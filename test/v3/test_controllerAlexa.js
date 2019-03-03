module.exports = [
  {
    description: "report state color item",
    directive: {
      "header": {
        "namespace": "Alexa",
        "name": "ReportState"
      },
      "endpoint": {
        "endpointId": "light1",
        "cookie": {
          "propertyMap": JSON.stringify({
            "PowerController": {
              "powerState": {"parameters": {}, "item": {"name": "light1"}, "schema": {"name": "powerState"}}},
            "BrightnessController": {
              "brightness": {"parameters": {}, "item": {"name": "light1"}, "schema": {"name": "brightness"}}},
            "ColorController": {
              "color": {"parameters": {}, "item": {"name": "light1"}, "schema": {"name": "color"}}}
          })
        }
      }
    },
    mocked: {
      openhab: {"name": "light1", "state": "0,0,42", "type": "Color"}
    },
    expected: {
      alexa: {
        "context": {
          "properties": [
            {
              "namespace": "Alexa.PowerController",
              "name": "powerState",
              "value": "ON"
            },
            {
              "namespace": "Alexa.BrightnessController",
              "name": "brightness",
              "value": 42
            },
            {
              "namespace": "Alexa.ColorController",
              "name": "color",
              "value": {
                "hue": 0,
                "saturation": 0,
                "brightness": 0.42
              }
            }
          ]
        },
        "event": {
          "header": {
            "namespace": "Alexa",
            "name": "StateReport"
          },
        }
      },
      openhab: []
    }
  },
  {
    description: "report state number temperature item",
    directive: {
      "header": {
        "namespace": "Alexa",
        "name": "ReportState"
      },
      "endpoint": {
        "endpointId": "temperature1",
        "cookie": {
          "propertyMap": JSON.stringify({
            "TemperatureSensor": {
              "temperature": {
                "parameters": {"scale": "Fahrenheit"},
                "item": {"name": "temperature1", "type": "Number:Temperature"},
                "schema": {"name": "temperature"}
              }
            }
          })
        }
      }
    },
    mocked: {
      openhab: {"name": "temperature1", "state": "68.0123456789 °F", "type": "Number:Temperature",
        "stateDescription": {"pattern": "%.1f °F"}}
    },
    expected: {
      alexa: {
        "context": {
          "properties": [
            {
              "namespace": "Alexa.TemperatureSensor",
              "name": "temperature",
              "value": {
                "value": 68.0,
                "scale": "FAHRENHEIT"
              }
            }
          ]
        },
        "event": {
          "header": {
            "namespace": "Alexa",
            "name": "StateReport"
          },
        }
      },
      openhab: []
    }
  },
  {
    description: "report state unreachable error",
    directive: {
      "header": {
        "namespace": "Alexa",
        "name": "ReportState"
      },
      "endpoint": {
        "endpointId": "switch1",
        "cookie": {
          "propertyMap": JSON.stringify({
            "PowerController": {
              "powerState": {"parameters": {}, "item": {"name": "switch1"}, "schema": {"name": "powerState"}}
            },
          })
        }
      }
    },
    mocked: {
      openhab: {"name": "switch1", "state": "NULL", "type": "Switch"}
    },
    expected: {
      alexa: {
        "event": {
          "header": {
            "namespace": "Alexa",
            "name": "ErrorResponse"
          },
          "payload": {
            type: "ENDPOINT_UNREACHABLE",
            message: "Unable to reach device"
          }
        }
      },
      openhab: []
    }
  },
  {
    description: "invalid directive namespace error",
    directive: {
      "header": {
        "namespace": "Alexa.Foobar",
        "name": "ReportState"
      },
      "endpoint": {
        "endpointId": "foobar1"
      }
    },
    mocked: {},
    expected: {
      alexa: {
        "event": {
          "header": {
            "namespace": "Alexa",
            "name": "ErrorResponse"
          },
          "payload": {
            "type": "INVALID_DIRECTIVE",
            "message": "Unsupported directive"
          }
        }
      },
      openhab: []
    }
  },
  {
    description: "invalid directive name error",
    directive: {
      "header": {
        "namespace": "Alexa",
        "name": "FooBar"
      },
      "endpoint": {
        "endpointId": "foobar1"
      }
    },
    mocked: {},
    expected: {
      alexa: {
        "event": {
          "header": {
            "namespace": "Alexa",
            "name": "ErrorResponse"
          },
          "payload": {
            "type": "INVALID_DIRECTIVE",
            "message": "Unsupported directive"
          }
        }
      },
      openhab: []
    }
  }
];
