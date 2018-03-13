import { Fragment } from 'react';
import { Route, Link, Switch } from 'react-router-dom';
import Loadable from 'react-loadable';
import Prism from 'prismjs';
import 'prismjs/components/prism-jsx';
import 'prismjs/themes/prism-okaidia.css';
import SchemaTable from '../components/SchemaTable';
import RouteWithProps from '../components/RouteWithProps';
import NotFound from '../components/NotFound';
import Spinner from '../components/Spinner';

const loadable = loader =>
  Loadable({
    loading: Spinner,
    loader
  });
const markdownProps = {
  renderers: {
    link: function RouterLink(props) {
      return props.href.match(/^(https?:)?\/\//) ? (
        <a href={props.href}>{props.children}</a>
      ) : (
        <Link to={props.href}>{props.children}</Link>
      );
    },
    html: function HtmlFormatter(props) {
      const parser = new DOMParser();
      const tree = parser.parseFromString(props.value, 'text/html');
      const node = tree.querySelector('div[data-render-schema]');

      if (node) {
        const url = node.dataset.renderSchema;

        return <SchemaTable schemaUrl={url} />;
      }

      return props.value;
    },
    code: function CodeBlock(props) {
      const html = Prism.highlight(props.value, Prism.languages.html);
      const cls = `language-${props.language}`;

      /* eslint-disable react/no-danger */
      return (
        <pre className={cls}>
          <code dangerouslySetInnerHTML={{ __html: html }} className={cls} />
        </pre>
      );
      /* eslint-disable react/no-danger */
    }
  }
};
const People = loadable(() =>
  import(/* webpackChunkName: 'TaskCreator' */ '../docs/People')
);
const Api = loadable(() =>
  import(/* webpackChunkName: 'Api' */ '../docs/tutorial/apis')
);
const Authenticate = loadable(() =>
  import(/* webpackChunkName: 'Authenticate' */ '../docs/tutorial/authenticate')
);
const CreateTaskViaApi = loadable(() =>
  import(/* webpackChunkName: 'CreateTaskViaApi' */ '../docs/tutorial/create-task-via-api')
);
const DebugTask = loadable(() =>
  import(/* webpackChunkName: 'DebugTask' */ '../docs/tutorial/debug-task')
);
const DownloadTaskArtifacts = loadable(() =>
  import(/* webpackChunkName: 'DownloadTaskArtifacts' */ '../docs/tutorial/download-task-artifacts')
);
const FindingTasks = loadable(() =>
  import(/* webpackChunkName: 'FindingTasks' */ '../docs/tutorial/finding-tasks')
);
const GeckoDecisionTask = loadable(() =>
  import(/* webpackChunkName: 'GeckoDecisionTask' */ '../docs/tutorial/gecko-decision-task')
);
const GeckoDockerImages = loadable(() =>
  import(/* webpackChunkName: 'GeckoDockerImages' */ '../docs/tutorial/gecko-docker-images')
);
const GeckoNewJob = loadable(() =>
  import(/* webpackChunkName: 'GeckoNewJob' */ '../docs/tutorial/gecko-new-job')
);
const GeckoTaskGraph = loadable(() =>
  import(/* webpackChunkName: 'GeckoTaskGraph' */ '../docs/tutorial/gecko-task-graph')
);
const GeckoTaskGraphHowTo = loadable(() =>
  import(/* webpackChunkName: 'GeckoTaskGraphHowTo' */ '../docs/tutorial/gecko-task-graph-howto')
);
const GeckoTasks = loadable(() =>
  import(/* webpackChunkName: 'GeckoTasks' */ '../docs/tutorial/gecko-tasks')
);
const HackTc = loadable(() =>
  import(/* webpackChunkName: 'HackTc' */ '../docs/tutorial/hack-tc')
);
const HelloWorld = loadable(() =>
  import(/* webpackChunkName: 'HelloWorld' */ '../docs/tutorial/hello-world')
);
const MonitorTaskStatus = loadable(() =>
  import(/* webpackChunkName: 'MonitorTaskStatus' */ '../docs/tutorial/monitor-task-status')
);
const Reviews = loadable(() =>
  import(/* webpackChunkName: 'Reviews' */ '../docs/tutorial/reviews')
);
const WhatIsTc = loadable(() =>
  import(/* webpackChunkName: 'WhatIsTc' */ '../docs/tutorial/what-is-tc')
);
const Tutorial = loadable(() =>
  import(/* webpackChunkName: 'Tutorial' */ '../docs/tutorial')
);
const Docs = props => (
  <Fragment>
    <Switch>
      <RouteWithProps path="/people" component={People} {...props} />
      <RouteWithProps path="/tutorial/apis" component={Api} {...markdownProps} />
      <RouteWithProps
        path="/tutorial/authenticate"
        component={Authenticate}
        {...markdownProps}
      />
      <RouteWithProps
        path="/tutorial/create-task-via-api"
        component={CreateTaskViaApi}
        {...markdownProps}
      />
      <RouteWithProps
        path="/tutorial/debug-task"
        component={DebugTask}
        {...markdownProps}
      />
      <RouteWithProps
        path="/tutorial/download-task-artifacts"
        component={DownloadTaskArtifacts}
        {...markdownProps}
      />
      <RouteWithProps
        path="/tutorial/finding-tasks"
        component={FindingTasks}
        {...markdownProps}
      />
      <RouteWithProps
        path="/tutorial/gecko-decision-task"
        component={GeckoDecisionTask}
        {...markdownProps}
      />
      <RouteWithProps
        path="/tutorial/gecko-docker-images"
        component={GeckoDockerImages}
        {...markdownProps}
      />
      <RouteWithProps
        path="/tutorial/gecko-new-job"
        component={GeckoNewJob}
        {...markdownProps}
      />
      <RouteWithProps
        path="/tutorial/gecko-task-graph"
        component={GeckoTaskGraph}
        {...markdownProps}
      />
      <RouteWithProps
        path="/tutorial/gecko-task-graph-howto"
        component={GeckoTaskGraphHowTo}
        {...markdownProps}
      />
      <RouteWithProps
        path="/tutorial/gecko-tasks"
        component={GeckoTasks}
        {...markdownProps}
      />
      <RouteWithProps
        path="/tutorial/hack-tc"
        component={HackTc}
        {...markdownProps}
      />
      <RouteWithProps
        path="/tutorial/hello-world"
        component={HelloWorld}
        {...markdownProps}
      />
      <RouteWithProps
        path="/tutorial/monitor-task-status"
        component={MonitorTaskStatus}
        {...markdownProps}
      />
      <RouteWithProps
        path="/tutorial/reviews"
        component={Reviews}
        {...markdownProps}
      />
      <RouteWithProps
        path="/tutorial/what-is-tc"
        component={WhatIsTc}
        {...markdownProps}
      />
      <RouteWithProps path="/tutorial" component={Tutorial} {...markdownProps} />
      <Route component={NotFound} />
    </Switch>
  </Fragment>
);

export default Docs;
