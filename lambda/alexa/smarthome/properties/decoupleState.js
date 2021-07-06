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

const AlexaProperty = require('./property');

/**
 * Defines decouple state property class
 * @extends AlexaProperty
 */
class DecoupleState extends AlexaProperty {
  /**
   * Defines decouple state tag name
   * @type {String}
   */
  static TAG_NAME = 'sensor';

  /**
   * Returns supported tags
   * @return {Array}
   */
  get supportedTags() {
    return [DecoupleState.TAG_NAME];
  }

  /**
   * Returns if property is valid
   * @param  {Array}  properties
   * @return {Boolean}
   */
  isValid(properties) {
    return (
      super.isValid(properties) &&
      // Valid if untagged property (target) is defined
      properties.find(({ name, component, tag }) => name === this.name && component === this.component && !tag)
    );
  }
}

module.exports = DecoupleState;
