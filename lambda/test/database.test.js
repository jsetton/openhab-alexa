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
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import config from '#root/config.js';
import db from '#root/database.js';

describe('Database Tests', function () {
  // set default environment
  const tableName = 'foo';
  const userId = 'bar';
  const settings = { foo: 1, bar: 2 };

  let command;

  beforeEach(function () {
    // set stub environment
    command = sinon.stub(DynamoDBDocumentClient.prototype, 'send');
    sinon.stub(config.skill, 'tableName').value(tableName);
  });

  afterEach(function () {
    // restore stub environment
    sinon.restore();
  });

  describe('get user settings', function () {
    it('successful', async function () {
      // set stub environment
      command.resolves({ Item: settings });
      // run test
      expect(await db.getUserSettings(userId)).to.deep.equal(settings);
      expect(command.called).to.be.true;
      expect(command.firstCall.args[0]).to.deep.include({
        input: {
          TableName: tableName,
          Key: { userId }
        }
      });
    });

    it('not found', async function () {
      // set stub environment
      command.resolves({});
      // run test
      expect(await db.getUserSettings(userId)).to.be.undefined;
      expect(command.called).to.be.true;
      expect(command.firstCall.args[0]).to.deep.include({
        input: {
          TableName: tableName,
          Key: { userId }
        }
      });
    });
  });

  describe('save user settings', function () {
    it('successful', async function () {
      // run test
      await db.saveUserSettings(userId, settings);
      expect(command.called).to.be.true;
      expect(command.firstCall.args[0]).to.deep.include({
        input: {
          TableName: tableName,
          Item: { userId, ...settings }
        }
      });
    });
  });
});
