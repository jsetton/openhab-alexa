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

const user = require('@lib/user.js');
const AlexaDirective = require('../directive.js');

/**
 * Defines Alexa.Authorization interface directive class
 * @extends AlexaDirective
 */
class AlexaAuthorization extends AlexaDirective {
  /**
   * Grant authorization
   */
  acceptGrant() {
    if (this.directive.payload.grant.type === 'OAuth2.AuthorizationCode') {
      user.grantAuthorization(this.directive.payload.grant.code, this.directive.payload.grantee.token).then(() => {
        const response = this.generateResponse({
          header: {
            namespace: this.directive.header.namespace,
            name: 'AcceptGrant.Response'
          }
        });
        this.returnAlexaResponse(response);
      }).catch((error) => {
        this.returnAlexaErrorResponse({
          error: error,
          namespace: this.directive.header.namespace,
          payload: {
            type: 'ACCEPT_GRANT_FAILED',
            message: error.message
          }
        });
      });
    }
  }
}

module.exports = AlexaAuthorization;
