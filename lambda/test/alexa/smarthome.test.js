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

import { expect, use } from 'chai';
import chaiSubset from 'chai-subset';
import sinon from 'sinon';
import { compressJSON, decamelize } from '#root/utils.js';
import log from '#root/log.js';
import config from '#root/config.js';
import db from '#root/database.js';
import lwa from '#root/lwa.js';
import OpenHAB from '#openhab/index.js';
import { handleSmarthomeRequest } from '#alexa/smarthome/index.js';
import AlexaAssetCatalog from '#alexa/smarthome/catalog.js';
import * as AlexaHandlers from '#alexa/smarthome/handlers/index.js';
import testCases from './cases/index.js';
import chaiCustom from './chai.js';

// Set chai environment
use(chaiSubset);
use(chaiCustom);

/* eslint-disable mocha/no-setup-in-describe */
describe('Alexa Smart Home Tests', function () {
  // set default environment
  const context = { awsRequestId: 'request-id' };

  afterEach(function () {
    // restore stub environment
    sinon.restore();
  });

  for (const [name, tests] of Object.entries(testCases)) {
    describe(`${decamelize(name, ' ')} request`, function () {
      for (const test of tests.flat()) {
        if (name === 'Authorization') {
          // Authorization Test
          it(test.description, async function () {
            // set stub environment
            const { credentials, error } = test;
            const directive = getDirective({
              header: { namespace: 'Alexa.Authorization', name: 'AcceptGrant' },
              payload: {
                grant: { type: 'OAuth2.AuthorizationCode', code: 'auth-code' },
                grantee: { type: 'BearerToken', token: 'access-token' }
              }
            });
            const settings = { runtime: {}, ...test.settings };
            const expected = { alexa: {}, db: [], ...test.expected };
            const dbStub = sinon.stub(db, 'saveUserSettings');
            sinon.stub(OpenHAB.prototype, 'getServerSettings').resolves(settings);
            if (error instanceof Error) {
              sinon.stub(lwa, 'getAccessToken').rejects(error);
            } else {
              sinon.stub(lwa, 'getAccessToken').resolves(credentials);
            }
            // run test
            const response = await handleSmarthomeRequest({ directive }, context);
            expect(dbStub.callCount).to.equal(expected.db.length);
            expect(dbStub.args.map(([userId, settings]) => ({ userId, ...settings }))).to.deep.equal(expected.db);
            expect(response).to.be.a.validSchema.that.containSubset(expected.alexa);
          });
        } else if (name === 'Binding') {
          // Binding Test
          it(test.description, async function () {
            // set stub environment
            const { credentials } = test;
            const directive = getDirective(test.directive);
            const reply = { statusCode: 202, ...test.reply };
            const settings = { runtime: {}, ...test.settings };
            const alexaApiUrl = 'https://foo';
            const skillApiUrl = 'https://bar';
            const expected = {
              ...test.expected,
              binding: {
                directive,
                context: {
                  ...(credentials && { credentials }),
                  endpoints: { event: `${alexaApiUrl}/v3/events`, token: `${skillApiUrl}/auth/token` }
                }
              }
            };
            const bindingStub = sinon.stub(OpenHAB.prototype, 'sendAlexaDirective').resolves(reply);
            sinon.stub(OpenHAB.prototype, 'getServerSettings').resolves(settings);
            sinon.stub(config.alexa, 'apiUrl').value(alexaApiUrl);
            sinon.stub(config.skill, 'apiUrl').value(skillApiUrl);
            sinon.stub(lwa, 'getAccessToken').resolves(credentials);
            sinon.stub(db, 'saveUserSettings');
            // run test
            const response = await handleSmarthomeRequest({ directive }, context);
            expect(bindingStub.called).to.be.true;
            expect(bindingStub.firstCall.args[0]).to.deep.equal(expected.binding);
            if (expected.alexa) {
              expect(response).to.be.a.validSchema.that.containSubset(expected.alexa);
            } else {
              expect(response).to.be.undefined;
            }
          });
        } else if (name === 'Discovery') {
          // Discovery Test
          it(test.description, async function () {
            // set environment
            const { catalog = {}, items = [], expected = {} } = test;
            const directive = getDirective({ header: { namespace: 'Alexa.Discovery', name: 'Discover' } });
            const settings = { regional: {}, runtime: {}, ...test.settings };
            sinon.stub(AlexaAssetCatalog, 'labelValues').value(catalog);
            sinon.stub(OpenHAB.prototype, 'getAllItems').resolves(items);
            sinon.stub(OpenHAB.prototype, 'getServerSettings').resolves(settings);
            // run test
            const response = await handleSmarthomeRequest({ directive }, context);
            expect(response)
              .to.be.a.validSchema.that.nested.includes({
                'event.header.namespace': 'Alexa.Discovery',
                'event.header.name': 'Discover.Response'
              })
              .and.has.nested.property('event.payload.endpoints')
              .that.has.endpoints(expected);
          });
        } else {
          // Controller Test
          it(test.description, async function () {
            // set environment
            const { error, items = [] } = test;
            const directive = getDirective(test.directive);
            const expected = {
              alexa: { ...test.expected.alexa },
              openhab: { commands: [], updates: [], ...test.expected.openhab }
            };
            const commandStub = sinon.stub(OpenHAB.prototype, 'sendCommand');
            const updateStub = sinon.stub(OpenHAB.prototype, 'postUpdate');
            sinon.stub(OpenHAB.prototype, 'getItem').callsFake(() => items.shift());
            if (error instanceof Error) {
              const { namespace, name } = directive.header;
              const handler = Object.values(AlexaHandlers).find((handler) => handler.namespace === namespace);
              const method = handler.directives[name];
              sinon.stub(handler, method.name).rejects(error);
              sinon.stub(log, 'error');
            }
            // run test
            const response = await handleSmarthomeRequest({ directive }, context);
            expect(commandStub.callCount).to.equal(expected.openhab.commands.length);
            expect(commandStub.args.map(([name, value]) => ({ name, value }))).to.deep.equal(expected.openhab.commands);
            expect(updateStub.callCount).to.equal(expected.openhab.updates.length);
            expect(updateStub.args.map(([name, value]) => ({ name, value }))).to.deep.equal(expected.openhab.updates);
            expect(response).to.be.a.validSchema.that.containSubset(expected.alexa);
          });
        }
      }
    });
  }
});

/**
 * Returns formatted directive object
 * @param  {Object} header
 * @param  {Object} endpoint
 * @param  {Object} payload
 * @return {Object}
 */
function getDirective({ header, endpoint, payload = {} }) {
  return {
    header: {
      namespace: header.namespace,
      ...(header.instance && { instance: header.instance }),
      name: header.name,
      payloadVersion: header.payloadVersion || '3',
      messageId: 'message-id',
      // add header correlation token for requests other than discovery
      ...(header.namespace !== 'Alexa.Discovery' && { correlationToken: 'correlation-token' })
    },
    // add endpoint only if provided
    ...(endpoint && {
      endpoint: {
        scope: { type: 'BearerToken', token: 'access-token' },
        endpointId: endpoint.endpointId,
        ...(endpoint.cookie && {
          cookie: {
            ...endpoint.cookie,
            ...(typeof endpoint.cookie.capabilities === 'object' && {
              capabilities: compressJSON(endpoint.cookie.capabilities)
            })
          }
        })
      }
    }),
    payload: {
      ...payload,
      // add scope to payload if no endpoint or payload grantee provided
      ...(!endpoint && !payload.grantee && { scope: { type: 'BearerToken', token: 'access-token' } })
    }
  };
}
