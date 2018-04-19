import {
  arrayOf,
  bool,
  instanceOf,
  number,
  object,
  oneOf,
  oneOfType,
  shape,
  string,
} from 'prop-types';

export const user = shape({
  name: string,
  nickname: string,
  picture: string,
  sub: string,
});

export const date = oneOfType([string, instanceOf(Date)]);

export const pageInfo = shape({
  hasNextPage: bool,
  hasPreviousPage: bool,
  cursor: string,
  previousCursor: string,
  nextCursor: string,
});

export const artifact = shape({
  name: string,
  contentType: string,
  url: string,
  isPublicLog: bool,
});

export const artifacts = shape({
  pageInfo,
  edges: arrayOf(artifact),
});

export const run = shape({
  taskId: string,
  state: string,
  reasonCreated: string,
  scheduled: date,
  started: date,
  workerGroup: string,
  workerId: string,
  takenUntil: date,
  artifacts,
});

export const runs = arrayOf(run);

export const status = shape({
  state: oneOf([
    'RUNNING',
    'PENDING',
    'UNSCHEDULED',
    'COMPLETED',
    'FAILED',
    'EXCEPTION',
  ]),
  retriesLeft: number,
  runs,
});

export const provisionerActions = arrayOf(
  shape({
    name: string,
    title: string,
    context: oneOf(['PROVISIONER', 'WORKER_TYPE', 'WORKER']),
    url: string,
    method: oneOf(['POST', 'PUT', 'DELETE', 'PATCH']),
    description: string,
  })
);

export const stability = oneOf[('EXPERIMENTAL', 'STABLE', 'DEPRECATED')];

export const taskMetadata = shape({
  name: string,
  description: string,
  owner: string,
  source: string,
});

export const task = shape({
  metadata: taskMetadata,
  status,
  retries: number,
  created: date,
  deadline: date,
  expires: date,
  priority: string,
  provisionerId: string,
  workerType: string,
  schedulerId: string,
  dependencies: arrayOf(string),
  tags: object, // eslint-disable-line
  scopes: arrayOf(string),
  routes: arrayOf(string),
  payload: object, // eslint-disable-line
  extra: object, // eslint-disable-line
});

export const worker = shape({
  provisionerId: string,
  workerType: string,
  workerGroup: string,
  workerId: string,
  recentTasks: arrayOf(
    shape({
      taskId: string,
      runId: number,
      run,
    })
  ),
  expires: date,
  quarantineUntil: date,
  latestTasks: arrayOf(shape(task)),
  actions: provisionerActions,
});

export const workerType = shape({
  provisionerId: string,
  workerType: string,
  stability,
  description: string,
  expires: date,
  lastDateActive: date,
  actions: provisionerActions,
});

export const awsProvisionerWorkerTypeSummary = shape({
  workerType: string,
  minCapacity: number,
  maxCapacity: number,
  requestedCapacity: number,
  pendingCapacity: number,
  runningCapacity: number,
});

export const provisioner = shape({
  provisionerId: string,
  stability,
  description: string,
  expires: date,
  lastDateActive: date,
  actions: provisionerActions,
});
