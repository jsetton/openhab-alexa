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
import { AxiosError } from 'axios';
import { handleApiRequest } from '#root/api/index.js';
import db from '#root/database.js';
import lwa from '#root/lwa.js';
import OpenHAB from '#openhab/index.js';

describe('API Gateway Tests', function () {
  afterEach(function () {
    // restore stub environment
    sinon.restore();
  });

  describe('auth token', function () {
    // set default environment
    const userId = 'foo';
    const settings = { userId, refreshToken: 'bar' };
    const credentials = { access_token: 'foo', refresh_token: 'bar', token_type: 'bearer', expires_in: 42 };

    it('refresh token grant type', async function () {
      // set environment
      const parameters = { grant_type: 'refresh_token', refresh_token: 'foo' };
      const request = { routeKey: 'POST /auth/token', body: JSON.stringify(parameters) };
      sinon.stub(lwa, 'getAccessToken').resolves(credentials);
      // run test
      expect(await handleApiRequest(request)).to.deep.equal({
        statusCode: 200,
        body: JSON.stringify(credentials),
        headers: { 'Content-Type': 'application/json' }
      });
    });

    it('user token grant type', async function () {
      // set environment
      const parameters = { grant_type: 'user_token', user_token: 'foo' };
      const request = { routeKey: 'POST /auth/token', body: JSON.stringify(parameters) };
      sinon.stub(OpenHAB.prototype, 'getUUID').resolves(userId);
      sinon.stub(db, 'getUserSettings').resolves(settings);
      sinon.stub(lwa, 'getAccessToken').resolves(credentials);
      // run test
      expect(await handleApiRequest(request)).to.deep.equal({
        statusCode: 200,
        body: JSON.stringify(credentials),
        headers: { 'Content-Type': 'application/json' }
      });
    });

    it('no parameters bad request error', async function () {
      // set environment
      const request = { routeKey: 'POST /auth/token' };
      // run test
      expect(await handleApiRequest(request)).to.deep.equal({
        statusCode: 400,
        body: JSON.stringify({ message: 'Bad Request' }),
        headers: { 'Content-Type': 'application/json' }
      });
    });

    it('invalid parameters bad request error', async function () {
      // set environment
      const parameters = { foo: 1, bar: 2 };
      const request = { routeKey: 'POST /auth/token', body: JSON.stringify(parameters) };
      // run test
      expect(await handleApiRequest(request)).to.deep.equal({
        statusCode: 400,
        body: JSON.stringify({ message: 'Bad Request' }),
        headers: { 'Content-Type': 'application/json' }
      });
    });

    it('user token unauthorized error', async function () {
      // set environment
      const parameters = { grant_type: 'user_token', user_token: 'foo' };
      const request = { routeKey: 'POST /auth/token', body: JSON.stringify(parameters) };
      const error = new AxiosError(null, null, null, null, { status: 401, statusText: 'Unauthorized' });
      sinon.stub(OpenHAB.prototype, 'getUUID').rejects(error);
      // run test
      expect(await handleApiRequest(request)).to.deep.equal({
        statusCode: 401,
        body: JSON.stringify({ message: 'Unauthorized' }),
        headers: { 'Content-Type': 'application/json' }
      });
    });

    it('user token bad gateway error', async function () {
      // set environment
      const parameters = { grant_type: 'user_token', user_token: 'foo' };
      const request = { routeKey: 'POST /auth/token', body: JSON.stringify(parameters) };
      const error = new AxiosError();
      sinon.stub(OpenHAB.prototype, 'getUUID').rejects(error);
      // run test
      expect(await handleApiRequest(request)).to.deep.equal({
        statusCode: 502,
        body: JSON.stringify({ message: 'Bad Gateway' }),
        headers: { 'Content-Type': 'application/json' }
      });
    });

    it('user settings not found error', async function () {
      // set environment
      const parameters = { grant_type: 'user_token', user_token: 'foo' };
      const request = { routeKey: 'POST /auth/token', body: JSON.stringify(parameters) };
      sinon.stub(OpenHAB.prototype, 'getUUID').resolves(userId);
      sinon.stub(db, 'getUserSettings').resolves(undefined);
      // run test
      expect(await handleApiRequest(request)).to.deep.equal({
        statusCode: 404,
        body: JSON.stringify({ message: 'Not Found' }),
        headers: { 'Content-Type': 'application/json' }
      });
    });

    it('user settings internal server error', async function () {
      // set environment
      const parameters = { grant_type: 'user_token', user_token: 'foo' };
      const request = { routeKey: 'POST /auth/token', body: JSON.stringify(parameters) };
      const error = new Error('Requested resource not found');
      sinon.stub(OpenHAB.prototype, 'getUUID').resolves(userId);
      sinon.stub(db, 'getUserSettings').rejects(error);
      // run test
      expect(await handleApiRequest(request)).to.deep.equal({
        statusCode: 500,
        body: JSON.stringify({ message: 'Internal Server Error' }),
        headers: { 'Content-Type': 'application/json' }
      });
    });
  });

  describe('other requests', function () {
    it('not implemented error', async function () {
      // set environment
      const request = { routeKey: 'GET /foobar' };
      // run test
      expect(await handleApiRequest(request)).to.deep.equal({
        statusCode: 501,
        body: JSON.stringify({ message: 'Not Implemented' }),
        headers: { 'Content-Type': 'application/json' }
      });
    });
  });
});
