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
const AlexaDisplayCategory = require('../category');
const { Interface, Property } = require('../constants');
const { MuteStep, VolumeSteps } = require('../properties');

/**
 * Defines Alexa.StepSpeaker interface capability class
 *  https://developer.amazon.com/docs/device-apis/alexa-stepspeaker.html
 * @extends AlexaCapability
 */
class StepSpeaker extends AlexaCapability {
  /**
   * Returns interface
   * @return {String}
   */
  get interface() {
    return Interface.ALEXA_STEP_SPEAKER;
  }

  /**
   * Returns supported properties
   * @return {Object}
   */
  get supportedProperties() {
    return {
      [Property.MUTED]: MuteStep,
      [Property.VOLUME]: VolumeSteps
    };
  }

  /**
   * Returns default display categories
   * @return {Array}
   */
  get defaultDisplayCategories() {
    return [AlexaDisplayCategory.SPEAKER];
  }
}

module.exports = StepSpeaker;