/**
 * Copyright (c) 2010-2021 Contributors to the openHAB project
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

const AlexaCapability = require('./capability');
const { Interface, Property } = require('../constants');
const { AlertState } = require('../properties');

/**
 * Defines Alexa.Safety interface capability class
 *  https://developer.amazon.com/docs/device-apis/alexa-safety-errorresponse.html
 * @extends AlexaCapability
 */
class Safety extends AlexaCapability {
  /**
   * Returns interface
   * @return {String}
   */
  get interface() {
    return Interface.ALEXA_SAFETY;
  }

  /**
   * Returns supported properties
   * @return {Object}
   */
  get supportedProperties() {
    return {
      [Property.OBSTACLE_ALERT]: AlertState,
      [Property.SAFETY_BEAM_ALERT]: AlertState
    };
  }

  /**
   * Returns if is discoverable
   * @return {Boolean}
   */
  get isDiscoverable() {
    return false;
  }
}

module.exports = Safety;
