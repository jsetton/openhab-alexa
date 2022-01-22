/**
 * Copyright (c) 2010-2024 Contributors to the openHAB project
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
    description: 'grant authorization',
    credentials: {
      access_token: 'foo',
      refresh_token: 'bar',
      token_type: 'bearer',
      expires_in: 42
    },
    settings: {
      runtime: {
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
      },
      db: [
        {
          userId: 'fb86a2e5-a4ff-4175-ab37-0f85b44d57e1',
          refreshToken: 'bar'
        }
      ]
    }
  },
  {
    description: 'grant authorization no uuid',
    settings: {
      runtime: {
        uuid: undefined
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
    description: 'grant authorization failed error',
    settings: {
      runtime: {
        uuid: 'fb86a2e5-a4ff-4175-ab37-0f85b44d57e1'
      }
    },
    error: new Error('Failed to get credentials'),
    expected: {
      alexa: {
        event: {
          header: {
            namespace: 'Alexa.Authorization',
            name: 'ErrorResponse'
          },
          payload: {
            type: 'ACCEPT_GRANT_FAILED',
            message: 'Failed to obtain and store user credentials'
          }
        }
      }
    }
  }
];
