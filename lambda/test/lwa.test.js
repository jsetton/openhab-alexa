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

import { expect } from 'chai';
import sinon from 'sinon';
import nock from 'nock';
import { AxiosError } from 'axios';
import config from '#root/config.js';
import lwa from '#root/lwa.js';

describe('Login With Amazon Tests', function () {
  // set default environment
  const apiUrl = 'https://foobar';
  const clientId = 'foo';
  const clientSecret = 'bar';

  beforeEach(function () {
    // set stub environment
    sinon.stub(config.lwa, 'apiUrl').value(apiUrl);
    sinon.stub(config.skill, 'clientId').value(clientId);
    sinon.stub(config.skill, 'clientSecret').value(clientSecret);
  });

  afterEach(function () {
    // restore stub environment
    sinon.restore();
    // clean up nock environment
    nock.cleanAll();
  });

  describe('get access token', function () {
    // set default environment
    const parameters = { grant_type: 'authorization_code', code: 'foobar' };
    const body = { ...parameters, client_id: clientId, client_secret: clientSecret };
    const credentials = { access_token: 'foo', refresh_token: 'bar', token_type: 'bearer', expires_in: 42 };

    it('successful', async function () {
      // set environment
      nock(apiUrl).post('/auth/o2/token', body).reply(200, credentials);
      // run test
      expect(await lwa.getAccessToken(parameters)).to.deep.equal(credentials);
      expect(nock.isDone()).to.be.true;
    });

    it('bad request error', async function () {
      // set environment
      nock(apiUrl).post('/auth/o2/token', body).reply(400);
      // run test
      try {
        await lwa.getAccessToken(parameters);
      } catch (error) {
        expect(error).to.be.instanceof(AxiosError).and.nested.include({ 'response.status': 400 });
      }
      expect(nock.isDone()).to.be.true;
    });
  });
});
