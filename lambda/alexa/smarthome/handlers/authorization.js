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

import log from '#root/log.js';
import db from '#root/database.js';
import lwa from '#root/lwa.js';
import AlexaBinding from '../binding.js';
import { Interface } from '../constants.js';
import { AuthorizationAcceptGrantError } from '../errors.js';
import AlexaHandler from './handler.js';

/**
 * Defines Alexa.Authorization interface handler class
 *  https://developer.amazon.com/docs/device-apis/alexa-authorization.html#directives
 * @extends AlexaHandler
 */
export default class Authorization extends AlexaHandler {
  /**
   * Defines accept grant directive
   * @type {String}
   */
  static ACCEPT_GRANT = 'AcceptGrant';

  /**
   * Defines handler namespace
   * @return {String}
   */
  static get namespace() {
    return Interface.ALEXA_AUTHORIZATION;
  }

  /**
   * Defines handler supported directives
   * @return {Object}
   */
  static get directives() {
    return {
      [Authorization.ACCEPT_GRANT]: this.acceptGrant
    };
  }

  /**
   * Grants authorization
   * @param  {Object}  directive
   * @param  {Object}  openhab
   * @return {Promise}
   */
  static async acceptGrant(directive, openhab) {
    // Get server settings from openhab
    const settings = await openhab.getServerSettings();
    // Define user id as runtime uuid
    const userId = settings.runtime.uuid;

    let credentials;

    try {
      // Get lwa access token credentials
      credentials = await lwa.getAccessToken({
        grant_type: 'authorization_code',
        code: directive.payload.grant.code
      });

      log.debug('Data:', { credentials, userId });

      // Save user settings into database if user id defined
      //  (Since uuid not retrievable in 3.0, accept grant without storing credentials)
      if (userId) {
        await db.saveUserSettings(userId, { refreshToken: credentials.refresh_token });
      }
    } catch (error) {
      log.debug('Error:', error);
      // Throw authorization accept grant error on exception errors
      throw new AuthorizationAcceptGrantError('Failed to obtain and store user credentials');
    }

    // Sends directive to binding if required, including credentials
    if (AlexaBinding.isRequired(settings.runtime.version)) {
      await AlexaBinding.handleDirective(directive, openhab, { credentials });
    }

    return directive.response({
      namespace: directive.namespace,
      name: `${directive.name}.Response`
    });
  }
}
