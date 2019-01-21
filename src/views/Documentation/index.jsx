import { hot } from 'react-hot-loader';
import React, { isValidElement, Component, Fragment } from 'react';
import { renderToString } from 'react-dom/server';
import { BrowserRouter, Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import { lowerCase } from 'change-case';
import path from 'path';
import resolve from 'resolve-pathname';
import RefParser from 'json-schema-ref-parser';
import 'prismjs/themes/prism.css';
import Dashboard from '../../components/Dashboard';
import NotFound from '../../components/NotFound';
import ErrorPanel from '../../components/ErrorPanel';
import {
  DOCS_PATH_PREFIX,
  DOCS_MENU_ITEMS,
  DOCS_SCHEMA_REGEX,
} from '../../utils/constants';
import isUrl from '../../utils/isUrl';
import docsTableOfContents from '../../autogenerated/docsTableOfContents';
import docsPathMappings from '../../autogenerated/docsPathMappings';
import PageMeta from './PageMeta';
import SchemaTable from '../../components/SchemaTable';
import Reference from './Reference';
import 'highlight.js/styles/atom-one-dark.css';

// This is used for images. Relative paths don't seem to work.
let absolutePath = null;

@hot(module)
@withStyles(theme => ({
  innerHtml: {
    ...theme.mixins.markdown,
  },
}))
export default class Documentation extends Component {
  state = {
    error: null,
    Document: null,
    pageInfo: null,
    referenceJson: null,
  };

  componentDidMount() {
    this.load();
  }

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

  headingFactory = type => ({ children, ...props }) =>
    React.createElement(
      type,
      { ...props },
      ...children,
      <span>&nbsp;</span>,
      <a className="anchor-link-style" href={`#${props.id}`}>
        #
      </a>
    );

  imageFactory = ({ src, ...props }) => {
    const currentFileName = path.basename(absolutePath);
    const imgSrc = src.startsWith('http')
      ? src
      : path.join(absolutePath.replace(`/${currentFileName}`, ''), src);

    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} src={imgSrc} />;
  };

  handlePageChange = url =>
    this.props.history.push(`${DOCS_PATH_PREFIX}/${url}`);

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

  getProjectName() {
    const { path } = this.props.match.params;

    return docsPathMappings[path].split('/')[0];
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
      img: this.imageFactory,
    };
  }

  async load() {
    try {
      const { default: Page } = await this.handleImport(
        this.props.match.params.path
      );

      // use `isMDXComponent` once https://github.com/mdx-js/mdx/pull/369 is merged
      if (!Page.prototype) {
        const entries = await this.getReferenceEntries(Page.entries);

        return this.setState({
          Document: null,
          pageInfo: null,
          error: null,
          referenceJson: Object.assign({}, Page, { entries }),
        });
      }

      const pageInfo = this.getPageInfo();
      const page = renderToString(
        <BrowserRouter>
          <Page components={this.components()} />
        </BrowserRouter>
      );
      const Document = page
        .split(DOCS_SCHEMA_REGEX)
        .map(html => (isUrl(html) ? <SchemaTable schema={html} /> : html));

      this.setState({ Document, pageInfo, error: null, referenceJson: null });
    } catch (error) {
      this.setState({ error });
    }
  }

  async handleImport(url) {
    const doc = url ? url.replace(/\/$/, '') : 'index';
    const isJSON =
      url &&
      url.startsWith('reference') &&
      (url.endsWith('api') || url.endsWith('events'));

    if (docsPathMappings[doc]) {
      absolutePath = `/raw/${docsPathMappings[doc]}.${isJSON ? 'json' : 'md'}`;

      if (isJSON) {
        return import(/* webpackChunkName: 'Documentation.JSON' */ `../../../raw/${
          docsPathMappings[url]
        }.json`);
      }

      return import(/* webpackChunkName: 'Documentation.page' */ `../../../raw/${
        docsPathMappings[doc]
      }.md`).catch(() => {
        absolutePath = `/raw/${docsPathMappings[doc]}/index.md`;

        return import(/* webpackChunkName: 'Documentation.page' */ `../../../raw/${
          docsPathMappings[doc]
        }/index.md`);
      });
    }

    absolutePath = `/src/docs/${doc}.md`;

    return import(/* webpackChunkName: 'Documentation.page' */ `../../docs/${doc}.md`).catch(
      () => {
        absolutePath = `/src/docs/${doc}/index.md`;

        return import(/* webpackChunkName: 'Documentation.page' */ `../../docs/${doc}/index.md`);
      }
    );
  }

  getReferenceEntries = entries => {
    const projectName = this.getProjectName();

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
          } = await import(/* webpackChunkName: 'Documentation.Schema' */ `../../../raw/${projectName}/schemas/${schemaName}`);

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
                    } = await import(/* webpackChunkName: 'Documentation.Schema' */ `../../../raw/${projectName}/schemas/${schemaName}`);

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
    const { error, Document, pageInfo, referenceJson } = this.state;

    return (
      <Dashboard
        docs
        title={
          pageInfo && pageInfo.data.title
            ? pageInfo.data.title
            : 'Documentation'
        }>
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
                <div
                  className={classes.innerHtml}
                  key={elem}
                  dangerouslySetInnerHTML={{ __html: elem }}
                />
                /* eslint-enable react/no-danger */
              )
          )
        )}
        {!error && referenceJson && <Reference json={referenceJson} />}
        {pageInfo && (
          <PageMeta
            pageInfo={pageInfo}
            history={history}
            onPageChange={this.handlePageChange}
          />
        )}
      </Dashboard>
    );
  }
}
