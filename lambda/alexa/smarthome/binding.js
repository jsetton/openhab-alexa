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

import config from '#root/config.js';
import { compareVersion } from '#root/utils.js';
import { BridgeUnreachableError } from './errors.js';

/**
 * Defines alexa binding class
 */
export default class AlexaBinding {
  /**
   * Defines minimum version
   * @type {String}
   */
  static MINIMUM_VERSION = '4.2.0';

  /**
   * Returns if required
   * @param  {String}  version
   * @return {Boolean}
   */
  static isRequired(version) {
    return typeof version === 'string' && compareVersion(version, AlexaBinding.MINIMUM_VERSION) >= 0;
  }

  /**
   * Sends directive to binding
   * @param  {Object} directive
   * @param  {Object} openhab
   * @param  {Object} context
   */
  static async handleDirective(directive, openhab, context) {
    try {
      const { statusCode } = await openhab.sendAlexaDirective({
        directive: directive.toJSON(),
        context: {
          ...context,
          endpoints: {
            event: `${config.alexa.apiUrl}/v3/events`,
            token: `${config.skill.apiUrl}/auth/token`
          }
        }
      });

      // Throw error if status code not accepted (202)
      if (statusCode !== 202) {
        throw new Error('Unexpected status code returned');
      }
    } catch {
      throw new BridgeUnreachableError('Unable to communicate with binding');
    }
  }
}
