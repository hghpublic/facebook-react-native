/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall react_native
 */

import type {Server} from 'connect';
import type {TerminalReportableEvent} from 'metro/src/lib/TerminalReporter';

const debug = require('debug')('ReactNative:CommunityCliPlugin');

type MiddlewareReturn = {
  middleware: Server,
  websocketEndpoints: {
    [path: string]: ws$WebSocketServer,
  },
  messageSocketEndpoint: {
    server: ws$WebSocketServer,
    broadcast: (method: string, params?: Record<string, mixed> | null) => void,
  },
  eventsSocketEndpoint: {
    server: ws$WebSocketServer,
    reportEvent: (event: TerminalReportableEvent) => void,
  },
  ...
};

// $FlowFixMe
const unusedStubWSServer: ws$WebSocketServer = {};
// $FlowFixMe
const unusedMiddlewareStub: Server = {};

const communityMiddlewareFallback = {
  createDevServerMiddleware: (params: {
    host?: string,
    port: number,
    watchFolders: $ReadOnlyArray<string>,
  }): MiddlewareReturn => ({
    // FIXME: Several features will break without community middleware and
    // should be migrated into core.
    // e.g. used by Libraries/Core/Devtools:
    // - /open-stack-frame
    // - /open-url
    // - /symbolicate
    middleware: unusedMiddlewareStub,
    websocketEndpoints: {},
    messageSocketEndpoint: {
      server: unusedStubWSServer,
      broadcast: (
        method: string,
        _params?: Record<string, mixed> | null,
      ): void => {},
    },
    eventsSocketEndpoint: {
      server: unusedStubWSServer,
      reportEvent: (event: TerminalReportableEvent) => {},
    },
  }),
};

// Attempt to use the community middleware if it exists, but fallback to
// the stubs if it doesn't.
try {
  const community = require('@react-native-community/cli-server-api');
  communityMiddlewareFallback.createDevServerMiddleware =
    community.createDevServerMiddleware;
} catch {
  debug(`⚠️ Unable to find @react-native-community/cli-server-api
Starting the server without the community middleware.`);
}

export const createDevServerMiddleware =
  communityMiddlewareFallback.createDevServerMiddleware;
