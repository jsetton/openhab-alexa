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

const { ItemType } = require('@openhab/constants');
const { Capability, Property } = require('@alexa/smarthome/constants');
const { Parameter, ParameterType } = require('@alexa/smarthome/metadata');
const { PlaybackAction, ToggleState } = require('@alexa/smarthome/properties');
const DeviceAttribute = require('./attribute');

/**
 * Defines mode attribute class
 * @extends DeviceAttribute
 */
class Mode extends DeviceAttribute {
  /**
   * Returns supported names
   * @return {Array}
   */
  static get supportedNames() {
    return [
      'Mode',
      'ModeComponent' // For backward compatibility (deprecated)
    ];
  }

  /**
   * Returns capabilities
   * @param  {Object} item
   * @param  {Object} metadata
   * @return {Array}
   */
  static getCapabilities(item, metadata) {
    const itemType = item.groupType || item.type;
    const actionMappings = metadata.getConfigParameter(Parameter.ACTION_MAPPINGS, ParameterType.MAP) || {};
    const stateMappings = metadata.getConfigParameter(Parameter.STATE_MAPPINGS, ParameterType.MAP) || {};
    const hasPlaybackActions = PlaybackAction.actionSemantics.some((action) => actionMappings[action]);
    const hasToggleSemantics =
      ToggleState.actionSemantics.every((action) => actionMappings[action]) ||
      ToggleState.stateSemantics.every((state) => stateMappings[state]);

    switch (itemType) {
      // Number/String mode control with toggles and actions if supported
      case ItemType.NUMBER:
      case ItemType.STRING:
        return [
          { name: Capability.MODE_CONTROLLER, property: Property.MODE },
          ...(hasToggleSemantics ? [{ name: Capability.TOGGLE_CONTROLLER, property: Property.TOGGLE_STATE }] : []),
          ...(hasPlaybackActions ? [{ name: Capability.PLAYBACK_CONTROLLER, property: Property.PLAYBACK_ACTION }] : [])
        ];
      // Switch mode control with actions if supported
      case ItemType.SWITCH:
        return [
          { name: Capability.MODE_CONTROLLER, property: Property.MODE },
          ...(hasPlaybackActions ? [{ name: Capability.PLAYBACK_CONTROLLER, property: Property.PLAYBACK_ACTION }] : [])
        ];
    }
  }
}

module.exports = Mode;
