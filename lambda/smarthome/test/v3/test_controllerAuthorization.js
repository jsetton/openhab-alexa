/**
 * Copyright (c) 2010-2019 Contributors to the openHAB project
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

module.exports = [
  {
    description: "get authorization tokens",
    directive: {
      "header": {
        "namespace": "Alexa.Authorization",
        "name": "AcceptGrant"
      },
      "payload": {
        "grant": {
          "type": "OAuth2.AuthorizationCode",
          "code": "auth-code"
        },
        "grantee": {
          "type": "BearerToken",
          "token": "access-token-from-skill"
        }
      }
    },
    mocked: {},
    expected: {
      alexa: {
        "event": {
          "header": {
            "namespace": "Alexa.Authorization",
            "name": "AcceptGrant.Response"
          }
        }
      },
      openhab: []
    }
  },
  {
    description: "missing authorization parameters error",
    directive: {
      "header": {
        "namespace": "Alexa.Authorization",
        "name": "AcceptGrant"
      },
      "payload": {
        "grant": {
          "type": "OAuth2.AuthorizationCode",
          "code": null
        },
        "grantee": {
          "type": "BearerToken",
          "token": "access-token-from-skill"
        }
      }
    },
    mocked: {},
    expected: {
      alexa: {
        "event": {
          "header": {
            "namespace": "Alexa.Authorization",
            "name": "ErrorResponse"
          },
          "payload": {
            "type": "ACCEPT_GRANT_FAILED",
            "message": "Missing authorization parameters"
          }
        }
      },
      openhab: []
    }
  }
];
