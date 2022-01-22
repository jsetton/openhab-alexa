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

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import config from './config.js';

// Initialize DynamoDB client using lambda function region
const client = new DynamoDBClient({ region: process.env.AWS_REGION });
// Initialize DynamoDB document client
const docClient = DynamoDBDocumentClient.from(client);

/**
 * Defines database functions
 * @type {Object}
 */
export default {
  /**
   * Returns user settings
   * @param  {String}  userId
   * @return {Promise}
   */
  getUserSettings: (userId) => {
    const command = new GetCommand({
      TableName: config.skill.tableName,
      Key: { userId }
    });
    return docClient.send(command).then((data) => data.Item);
  },

  /**
   * Saves user settings
   * @param  {String}  userId
   * @param  {Object}  settings
   * @return {Promise}
   */
  saveUserSettings: (userId, settings) => {
    const command = new PutCommand({
      TableName: config.skill.tableName,
      Item: { userId, ...settings }
    });
    return docClient.send(command);
  }
};
