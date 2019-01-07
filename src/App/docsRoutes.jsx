import { lazy } from 'react';
import { join } from 'path';
import { DOCS_PATH_PREFIX } from '../utils/constants';

export default [
  {
    component: lazy(() =>
      import(/* webpackChunkName: 'Documentation' */ '../views/Documentation')
    ),
    path: join(DOCS_PATH_PREFIX, ':path*'),
  },
];
