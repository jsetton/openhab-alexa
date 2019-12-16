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

require('module-alias/register');
const catalog = require('@lib/catalog.js');
const log = require('@lib/log.js');
const rest = require('@lib/rest.js');
const storage = require('@lib/storage.js');
const ohv3 = require('@root/alexa/v3/ohConnector.js');
const settings = require('./settings.js');
const { assert, utils } = require('./common.js');

describe('ohConnectorV3 Tests', function () {

  let callback, capture, response;

  before(function () {
    // mock rest external calls
    rest.getAuthTokens = function (request) {
      return new Promise((resolve, reject) => request.code || request.refresh_token ?
        resolve({access_token: "access-token", token_type: "bearer", expires_in: 42, refresh_token: "refresh-token"}) :
        reject({message: "Missing authorization parameters"}));
    };
    rest.getUserProfile = function () {
      return Promise.resolve({userId: "user-id", name: "name", email: "email"});
    };
    rest.getItem = function () {
      return Promise.resolve(
        Array.isArray(response.openhab) && response.staged ? response.openhab.shift() : response.openhab);
    };
    rest.getItems = function () {
      return Promise.resolve(
        Array.isArray(response.openhab) && response.staged ? response.openhab.shift() : response.openhab);
    };
    rest.getServiceConfig = function (token, serviceId) {
      return Promise.resolve(response.services && response.services[serviceId]);
    };
    rest.pollItemStateEvents = function(undefined, itemNames) {
      return Promise.resolve(itemNames.reduce((result, name, index) => Object.assign(result, {[name]: index}), {}));
    };
    rest.postItemCommand = function (token, itemName, value) {
      capture.calls.push({'name': itemName, 'value': value});
      return Promise.resolve();
    };
    rest.postMessageEventGateway = function(undefined, result) {
      capture.result = capture.result ? [].concat(capture.result, result) : result;
      return Promise.resolve();
    };

    // mock storage external calls
    storage.deleteUserSettings = function () {
      return Promise.resolve();
    };
    storage.getUserSettings = function () {
      return Promise.resolve({Item: {accessToken: "access-token", expireTime: 42, refreshToken: "refresh-token"}});
    };
    storage.saveUserSettings = function () {
      return Promise.resolve();
    };
    storage.updateUserSettings = function () {
      return Promise.resolve();
    };

    // mock log error calls
    log.error = function (...args) {
      capture.logs.push(
        args.map(arg => typeof arg === 'object' ? arg.stack || JSON.stringify(arg) : arg).join(' '));
    };

    // mock aws lambda callback calls
    callback = function (error, result) {
      capture.result = capture.result ? [].concat(capture.result, result) : result;
    };
  });

  beforeEach(function () {
    // reset mock variables
    response = {};
    capture = {'calls': [], 'logs': [], 'result': null};
  });

  afterEach(function () {
    // output log errors if test failed
    if (this.currentTest.state === 'failed') {
      // eslint-disable-next-line no-console
      capture.logs.forEach(message => console.log(message));
    }
  });

  // Discovery Tests
  describe('Discovery Interface', function () {
    const directive = utils.generateDirectiveRequest({
      'header': {
        'namespace': 'Alexa.Discovery',
        'name': 'Discover'
      }
    });

    Object.keys(settings.testCasesV3.discovery).forEach(function (name) {
      settings.testCasesV3.discovery[name].forEach(function (path) {
        const test = require(path);

        it(test.description, function (done) {
          Object.assign(catalog, test.catalog);
          response = {'openhab': test.mocked, 'services': test.services};
          ohv3.handleRequest(directive, callback);
          // wait for async responses
          setTimeout(function () {
            // console.log('Capture:', JSON.stringify(capture, null, 2));
            assert.discoveredEndpoints(capture.result.event.payload.endpoints, test.expected);
            assert.validSchema(capture.result, test.validate);
            done();
          }, 1);
        });
      });
    });
  });

  // Controller Tests
  Object.keys(settings.testCasesV3.controllers).forEach(function (name){
    describe(name + ' Interface', function () {
      settings.testCasesV3.controllers[name].forEach(function (path){
        const tests = require(path);

        tests.forEach(function (test) {
          it(test.description, function (done) {
            response = test.mocked;
            ohv3.handleRequest(utils.generateDirectiveRequest(test.directive), callback);
            // wait for async responses
            setTimeout(function () {
              // console.log('Capture:', JSON.stringify(capture, null, 2));
              assert.capturedCalls(capture.calls, test.expected.openhab);
              assert.capturedResult(capture.result, test.expected.alexa);
              assert.validSchema(capture.result, test.validate);
              done();
            }, 5);
          });
        });
      });
    });
  });
});
