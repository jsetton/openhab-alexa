/**
 * Copyright (c) 2010-2023 Contributors to the openHAB project
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

import { ItemType, ItemValue } from '#openhab/constants.js';
import { Property, Parameter, ParameterType } from '../constants.js';
import { PlaybackOperation } from './playback.js';
import AlexaProperty from './property.js';

/**
 * Defines playback stop property class
 * @extends AlexaProperty
 */
export default class PlaybackStop extends AlexaProperty {
  /**
   * Returns supported item types
   * @return {Array}
   */
  get supportedItemTypes() {
    return [ItemType.SWITCH];
  }

  /**
   * Returns supported parameters and their type
   * @return {Object}
   */
  get supportedParameters() {
    return {
      [Parameter.INVERTED]: ParameterType.BOOLEAN
    };
  }

  /**
   * Returns required linked properties
   * @return {Array}
   */
  get requiredLinkedProperties() {
    return [{ name: Property.PLAYBACK }];
  }

  /**
   * Returns if is reportable
   * @return {Boolean}
   */
  get isReportable() {
    return false;
  }

  /**
   * Returns supported operations
   * @return {Array}
   */
  get supportedOperations() {
    return [PlaybackOperation.STOP];
  }

  /**
   * Returns inverted based on parameter
   * @return {Boolean}
   */
  get inverted() {
    return this.parameters[Parameter.INVERTED] === true;
  }

  /**
   * Returns openhab command
   * @return {String}
   */
  getCommand() {
    return this.inverted ? ItemValue.OFF : ItemValue.ON;
  }
}
