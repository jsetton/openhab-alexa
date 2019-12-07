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

module.exports = {
  description: "washer mode components enabled group",
  mocked: [
    {
      "type": "String",
      "name": "WashCycle",
      "tags": [],
      "metadata": {
        "alexa": {
          "value": "ModeController.mode",
          "config": {
            "supportedModes": "Normal=:Cottons,Delicate=@Value.Delicate:Knits,Whites",
            "friendlyNames": "Wash Cycle,Wash Setting"
          }
        }
      },
      "groupNames": ["gWasher"]
    },
    {
      "type": "Number",
      "name": "WashTemperature",
      "tags": [],
      "metadata": {
        "alexa": {
          "value": "ModeController.mode",
          "config": {
            "supportedModes": "0=Cold:Cool,1=Warm,2=Hot",
            "friendlyNames": "Wash Temperature,@Setting.WaterTemperature",
            "ordered": true
          }
        }
      },
      "groupNames": ["gWasher"]
    },
    {
      "stateDescription": {
        "options": [
          {"value": "off", "label": "No Spin"},
          {"value": "low", "label": "Low"},
          {"value": "medium", "label": "Medium"},
          {"value": "high", "label": "High"},
        ]
      },
      "type": "String",
      "name": "WashSpinSpeed",
      "label": "Wash Spin Speed",
      "tags": [],
      "metadata": {
        "alexa": {
          "value": "ModeController.mode"
        }
      },
      "groupNames": ["gWasher"]
    },
    {
      "type": "String",
      "name": "WashStatus",
      "tags": [],
      "metadata": {
        "alexa": {
          "value": "ModeController.mode",
          "config": {
            "supportedModes": "Washing=:Lavage@fr-FR,Rinsing=:Rincage@fr-FR,Spinning=:Essorage@fr-FR",
            "friendlyNames": "Wash Status,État de Lavage@fr-FR",
            "nonControllable": true
          }
        }
      },
      "groupNames": ["gWasher"]
    },
    {
      "type": "String",
      "name": "InvalidMode",
      "tags": [],
      "metadata": {
        "alexa": {
          "value": "ModeController.mode"
        }
      },
      "groupNames": ["gWasher"]
    },
    {
      "type": "Group",
      "name": "gWasher",
      "label": "Washer",
      "tags": [],
      "metadata": {
        "alexa": {
          "value": "Endpoint.Other"
        }
      },
      "groupNames": []
    }
  ],
  settings: {
    "regional": {
      "language": "en",
      "region": "US"
    }
  },
  expected: {
    "gWasher": {
      "capabilities": [
        "Alexa",
        "Alexa.ModeController.WashCycle.mode",
        "Alexa.ModeController.WashTemperature.mode",
        "Alexa.ModeController.WashSpinSpeed.mode",
        "Alexa.ModeController.WashStatus.mode",
        "Alexa.EndpointHealth.connectivity"
      ],
      "displayCategories": ["OTHER"],
      "friendlyName": "Washer",
      "resources": {
        "Alexa.ModeController.WashCycle": {
          "friendlyNames": ["text:Wash Cycle:en-US", "text:Wash Setting:en-US"]
        },
        "Alexa.ModeController.WashTemperature": {
          "friendlyNames": ["text:Wash Temperature:en-US", "asset:Alexa.Setting.WaterTemperature"]
        },
        "Alexa.ModeController.WashSpinSpeed": {
          "friendlyNames": ["text:Wash Spin Speed:en-US"]
        },
        "Alexa.ModeController.WashStatus": {
          "friendlyNames": ["text:Wash Status:en-US", "text:État de Lavage:fr-FR"]
        }
      },
      "configuration": {
        "Alexa.ModeController.WashCycle": {
          "ordered": false,
          "supportedModes": {
            "Normal": {
              "friendlyNames": ["text:Normal:en-US", "text:Cottons:en-US"]
            },
            "Delicate": {
              "friendlyNames": ["asset:Alexa.Value.Delicate", "text:Knits:en-US"]
            },
            "Whites": {
              "friendlyNames": ["text:Whites:en-US"]
            }
          }
        },
        "Alexa.ModeController.WashTemperature": {
          "ordered": true,
          "supportedModes": {
            "0": {
              "friendlyNames": ["text:Cold:en-US", "text:Cool:en-US"]
            },
            "1": {
              "friendlyNames": ["text:Warm:en-US"]
            },
            "2": {
              "friendlyNames": ["text:Hot:en-US"]
            }
          }
        },
        "Alexa.ModeController.WashSpinSpeed": {
          "ordered": false,
          "supportedModes": {
            "off": {
              "friendlyNames": ["text:No Spin:en-US"]
            },
            "low": {
              "friendlyNames": ["text:Low:en-US"]
            },
            "medium": {
              "friendlyNames": ["text:Medium:en-US"]
            },
            "high": {
              "friendlyNames": ["text:High:en-US"]
            }
          }
        },
        "Alexa.ModeController.WashStatus": {
          "ordered": false,
          "supportedModes": {
            "Washing": {
              "friendlyNames": ["text:Washing:en-US", "text:Lavage:fr-FR"]
            },
            "Rinsing": {
              "friendlyNames": ["text:Rinsing:en-US", "text:Rincage:fr-FR"]
            },
            "Spinning": {
              "friendlyNames": ["text:Spinning:en-US", "text:Essorage:fr-FR"]
            }
          }
        }
      },
      "propertyMap": {
        "ModeController:WashCycle": {
          "mode": {
            "parameters": {
              "supportedModes": ["Normal=Normal:Cottons", "Delicate=@Value.Delicate:Knits", "Whites=Whites"],
              "friendlyNames": ["Wash Cycle", "Wash Setting"]},
            "item": {"name": "WashCycle", "type": "String"},
            "schema": {"name": "mode"}
          }
        },
        "ModeController:WashTemperature": {
          "mode": {
            "parameters": {
              "supportedModes": ["0=Cold:Cool", "1=Warm", "2=Hot"], "ordered": true,
              "friendlyNames": ["Wash Temperature", "@Setting.WaterTemperature"]},
            "item": {"name": "WashTemperature", "type": "Number"},
            "schema": {"name": "mode"}
          }
        },
        "ModeController:WashSpinSpeed": {
          "mode": {
            "parameters": {
              "supportedModes": ["off=No Spin", "low=Low", "medium=Medium", "high=High"],
              "friendlyNames": ["Wash Spin Speed"]},
            "item": {"name": "WashSpinSpeed", "type": "String"},
            "schema": {"name": "mode"}
          }
        },
        "ModeController:WashStatus": {
          "mode": {
            "parameters": {
              "supportedModes": [
                "Washing=Washing:Lavage@fr-FR", "Rinsing=Rinsing:Rincage@fr-FR", "Spinning=Spinning:Essorage@fr-FR"],
              "friendlyNames": ["Wash Status", "État de Lavage@fr-FR"], "nonControllable": true},
            "item": {"name": "WashStatus", "type": "String"},
            "schema": {"name": "mode"}
          }
        }
      }
    }
  }
};
