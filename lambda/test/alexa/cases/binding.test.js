/**
 * Copyright (c) 2010-2022 Contributors to the openHAB project
 *
 * See the NOTICE file(s) distributed with this work for additional
 * information.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0
 *
 * SPDX-License-Identifier: EPL-2.0
 */

export default [
  {
    description: 'discover',
    directive: {
      header: {
        namespace: 'Alexa.Discovery',
        name: 'Discover'
      }
    },
    settings: {
      runtime: {
        version: '4.2.0'
      }
    }
  },
  {
    description: 'grant authorization',
    directive: {
      header: {
        namespace: 'Alexa.Authorization',
        name: 'AcceptGrant'
      },
      payload: {
        grant: {
          type: 'OAuth2.AuthorizationCode',
          code: 'auth-code'
        },
        grantee: {
          type: 'BearerToken',
          token: 'access-token'
        }
      }
    },
    credentials: {
      access_token: 'foo',
      refresh_token: 'bar',
      token_type: 'bearer',
      expires_in: 42
    },
    settings: {
      runtime: {
        version: '4.2.0',
        uuid: 'fb86a2e5-a4ff-4175-ab37-0f85b44d57e1'
      }
    },
    expected: {
      alexa: {
        event: {
          header: {
            namespace: 'Alexa.Authorization',
            name: 'AcceptGrant.Response'
          },
          payload: {}
        }
      }
    }
  },
  {
    description: 'report state',
    directive: {
      header: {
        namespace: 'Alexa',
        name: 'ReportState'
      },
      endpoint: {
        endpointId: 'switch',
        cookie: {
          binding: true
        }
      }
    }
  },
  {
    description: 'report state bridge unreachable error',
    directive: {
      header: {
        namespace: 'Alexa',
        name: 'ReportState'
      },
      endpoint: {
        endpointId: 'switch',
        cookie: {
          binding: true
        }
      }
    },
    reply: {
      statusCode: 200, // webui 3.x always return 200
      body: 'Requested content not found'
    },
    expected: {
      alexa: {
        event: {
          header: {
            namespace: 'Alexa',
            name: 'ErrorResponse'
          },
          payload: {
            type: 'BRIDGE_UNREACHABLE',
            message: 'Unable to communicate with binding'
          }
        }
      }
    }
  }
];
