import { hot } from 'react-hot-loader';
import React, { isValidElement, Component, Fragment } from 'react';
import { renderToString } from 'react-dom/server';
import { BrowserRouter, Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import { lowerCase } from 'change-case';
import path from 'path';
import resolve from 'resolve-pathname';
import RefParser from 'json-schema-ref-parser';
import catchLinks from 'catch-links';
import 'prismjs';
import 'prismjs/themes/prism.css';
import 'prism-themes/themes/prism-atom-dark.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-markup';
import Dashboard from '../../components/Dashboard';
import HeaderWithAnchor from '../../components/HeaderWithAnchor';
import ScrollToTop from '../../components/ScrollToTop';
import NotFound from '../../components/NotFound';
import ErrorPanel from '../../components/ErrorPanel';
import {
  DOCS_PATH_PREFIX,
  DOCS_MENU_ITEMS,
  DOCS_SCHEMA_REGEX,
} from '../../utils/constants';
import scrollToHash from '../../utils/scrollToHash';
import isUrl from '../../utils/isUrl';
import importDocFile from '../../utils/importDocFile';
import docsTableOfContents from '../../autogenerated/docsTableOfContents';
import PageMeta from './PageMeta';
import SchemaTable from '../../components/SchemaTable';
import Reference from './Reference';

// This is used for images. Relative paths don't seem to work.
let absolutePath = null;

@hot(module)
@withStyles(
  theme => ({
    innerHtml: {
      ...theme.mixins.markdown,
      '& .token.operator': {
        color: 'none',
        background: 'none',
      },
    },
    imageWrapper: {
      textAlign: 'center',
      background: theme.palette.type === 'dark' ? '#ffffffcc' : 'none',
    },
  }),
  { withTheme: true }
)
export default class Documentation extends Component {
  state = {
    error: null,
    Page: null,
    pageInfo: null,
    referenceJson: null,
  };

  async componentDidMount() {
    this.load();

    window.addEventListener('load', this.handleDomLoad);
  }

  componentWillUnmount() {
    window.removeEventListener('load', this.handleDomLoad);
  }

  handleDomLoad = () => {
    const { theme, history } = this.props;

    // Clicking a link from markdown opens a new page.
    // We need to make sure react-router is still used for local routes.
    // Note: The callback will only be triggered for relative links
    catchLinks(window, href => {
      history.push(href);

      scrollToHash(theme.spacing.double);
    });

    if (this.props.history.location.hash) {
      scrollToHash(theme.spacing.double);
    }
  };

  componentDidUpdate(prevProps) {
    if (this.props.match.params.path === prevProps.match.params.path) {
      return;
    }

    this.load();
  }

  anchorFactory = ({ href, children, ...props }) => {
    if (href.startsWith('http')) {
      return (
        <a href={href} {...props} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    }

    const { location } = this.props;
    const url = resolve(href, location.pathname);

    return (
      <Link to={url} {...props}>
        {children}
      </Link>
    );
  };

  headingFactory = type => ({ children, id, ...props }) => (
    <HeaderWithAnchor type={type} id={id} {...props}>
      {children}
    </HeaderWithAnchor>
  );

  imageFactory = ({ src, ...props }) => {
    const { classes } = this.props;
    const currentFileName = path.basename(absolutePath);
    const startsWithHttp = src.startsWith('http');
    const imgSrc = startsWithHttp
      ? src
      : path.join(absolutePath.replace(`/${currentFileName}`, ''), src);

    // Some local images have black text making it hard to see
    // when viewing the page with the dark theme
    /* eslint-disable jsx-a11y/alt-text */
    return startsWithHttp ? (
      <img {...props} src={imgSrc} />
    ) : (
      <div className={classes.imageWrapper}>
        <img {...props} src={imgSrc} />
      </div>
    );
    /* eslint-enable jsx-a11y/alt-text */
  };

  findChildFromRootNode(node) {
    const currentPath = window.location.pathname.replace(
      `${DOCS_PATH_PREFIX}/`,
      ''
    );

    if (currentPath === node.path) {
      return node;
    }

    if (node.children) {
      for (let i = 0; i < node.children.length; i += 1) {
        const result = this.findChildFromRootNode(node.children[i]);

        if (result) {
          return result;
        }
      }
    }
  }

  getPageInfo() {
    const menuItem = DOCS_MENU_ITEMS.find(
      ({ path }) =>
        window.location.pathname !== DOCS_PATH_PREFIX &&
        path !== DOCS_PATH_PREFIX &&
        window.location.pathname.startsWith(path)
    );

    if (!menuItem) {
      return null;
    }

    const rootNode = docsTableOfContents[lowerCase(menuItem.label)];

    return this.findChildFromRootNode(rootNode) || rootNode;
  }

  buildSchemaId(schemaId) {
    if (schemaId.startsWith('/')) {
      if (
        process.env.TASKCLUSTER_ROOT_URL &&
        process.env.TASKCLUSTER_ROOT_URL !== 'https://taskcluster.net'
      ) {
        return process.env.TASKCLUSTER_ROOT_URL + schemaId;
      }

      return `https://schemas.taskcluster.net/${schemaId.replace(
        /^\/schemas\//,
        ''
      )}`;
    }

    return schemaId;
  }

  sanitizeSchema(schema) {
    if (schema.$id) {
      return {
        ...schema,
        $id: this.buildSchemaId(schema.$id),
      };
    }

    if (schema.id) {
      return {
        ...schema,
        id: this.buildSchemaId(schema.id),
      };
    }

    return schema;
  }

  // Returns a mapping between the HTML element and the desired component
  components() {
    return {
      a: this.anchorFactory,
      h1: this.headingFactory('h1'),
      h2: this.headingFactory('h2'),
      h3: this.headingFactory('h3'),
      h4: this.headingFactory('h4'),
      h5: this.headingFactory('h5'),
      h6: this.headingFactory('h6'),
      img: this.imageFactory,
    };
  }

  async load() {
    try {
      const { params } = this.props.match;
      const isJsonFile =
        params.path.startsWith('reference') &&
        (params.path.endsWith('api') || params.path.endsWith('events'));
      const { loader, path } = importDocFile(
        `${this.props.match.params.path}.${isJsonFile ? 'json' : 'md'}`
      );
      const { default: Page } = await loader;

      absolutePath = path;

      // use `isMDXComponent` once https://github.com/mdx-js/mdx/pull/369 is merged
      if (!Page.prototype) {
        const entries = await this.getReferenceEntries(Page.entries);

        return this.setState({
          Page: null,
          pageInfo: null,
          error: null,
          referenceJson: Object.assign({}, Page, { entries }),
        });
      }

      const pageInfo = this.getPageInfo();

      this.setState({ Page, pageInfo, error: null, referenceJson: null });
    } catch (error) {
      this.setState({ error });
    }
  }

  getDocument(Page) {
    if (!Page) {
      return null;
    }

    const page = renderToString(
      <BrowserRouter>
        <Page components={this.components()} />
      </BrowserRouter>
    );

    return page
      .split(DOCS_SCHEMA_REGEX)
      .map(
        html =>
          !isUrl(html) && html.startsWith('<') ? (
            html
          ) : (
            <SchemaTable key={html} schema={html} />
          )
      );
  }

  getReferenceEntries = entries => {
    const projectName = this.props.match.params.path.split('/')[2];

    return Promise.all(
      entries.map(entry =>
        ['input', 'output', 'schema'].reduce(async (acc, prop) => {
          const accumulator = await acc;

          if (!(prop in entry)) {
            return acc;
          }

          const schemaName = entry[prop].replace(/#$/, '');
          let {
            default: schema,
          } = await import(/* webpackChunkName: 'Documentation.Schema' */ `../../../generated/docs/${projectName}/schemas/${schemaName}`);

          schema = this.sanitizeSchema(schema);

          // `dereference` maintains object reference equality
          const deref = await RefParser.dereference(
            schema.$id || schema.id,
            schema,
            {
              resolve: {
                http: false,
                file: false,
                any: {
                  order: 1,
                  canRead: /^http*|^\/schemas|^taskcluster:\/schemas/,
                  read: async (file, callback) => {
                    const url = new URL(file.url);
                    const schemaName =
                      url.hostname === 'schemas.taskcluster.net'
                        ? // e.g.,
                          // https://schemas.taskcluster.net/hooks/v1/hook-definition.json -> strip /hooks/ from
                          // the pathname
                          // eslint-disable-next-line no-useless-escape
                          url.pathname.replace(/^\/[^\/]*\//, '')
                        : // e.g.,
                          // https://taskcluster.example.com/schemas/hooks/v1/hook-definition.json
                          // or
                          // taskcluster:/schemas/hooks/v1/hook-definition.json
                          // or
                          // /schemas/hooks/v1/hook-definition.json
                          // -> strip /schemas/hooks/ from the pathname
                          // eslint-disable-next-line no-useless-escape
                          url.pathname.replace(/^\/schemas\/[^\/]*\//, '');
                    const {
                      default: schema,
                    } = await import(/* webpackChunkName: 'Documentation.Schema' */ `../../../generated/docs/${projectName}/schemas/${schemaName}`);

                    callback(null, schema);
                  },
                },
              },
              dereference: {
                circular: 'ignore',
              },
            }
          );

          return Promise.resolve({
            ...accumulator,
            [prop]: deref,
          });
        }, Promise.resolve(entry))
      )
    );
  };

  render() {
    const { classes, history } = this.props;
    const { error, Page, pageInfo, referenceJson } = this.state;
    const Document = this.getDocument(Page);

    return (
      <Dashboard
        className={classes.innerHtml}
        docs
        title={
          pageInfo && pageInfo.data.title
            ? pageInfo.data.title
            : 'Documentation'
        }>
        <ScrollToTop>
          <ErrorPanel
            warning
            error="Please refer to [https://docs.taskcluster.net/docs](https://docs.taskcluster.net/docs)
          for the documentation. The following is work in progress."
          />
          {error ? (
            <NotFound isDocs />
          ) : (
            Document &&
            Document.map(
              elem =>
                isValidElement(elem) ? (
                  <Fragment key={elem.props.url}>{elem}</Fragment>
                ) : (
                  /* eslint-disable react/no-danger */
                  <div key={elem} dangerouslySetInnerHTML={{ __html: elem }} />
                  /* eslint-enable react/no-danger */
                )
            )
          )}
          {!error && referenceJson && <Reference json={referenceJson} />}
          {pageInfo && <PageMeta pageInfo={pageInfo} history={history} />}
        </ScrollToTop>
      </Dashboard>
    );
  }
}
