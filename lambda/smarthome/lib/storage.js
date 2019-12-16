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

const AWS = require('aws-sdk');
// Set region to lambda function one (default: us-east-1)
AWS.config.update({region: process.env.AWS_REGION || 'us-east-1'});
// Initialize DynamoDB document client connection
const docClient = new AWS.DynamoDB.DocumentClient();
// Define settings table name
const tableName = process.env.ALEXA_SKILL_SETTINGS_TABLE || 'AlexaOpenHABSkillSettings';

/**
 * Delete user settings from DynamoDB Table
 * @param  {String}   userId
 * @return {Promise}
 */
function deleteUserSettings(userId) {
  const parameters = {
    TableName: tableName,
    Key: {'userId': userId},
  };
  return docClient.delete(parameters).promise();
}

/**
 * Get user settings from DynamoDB Table
 * @param  {String}   userId
 * @param  {String}   attributes
 * @return {Promise}
 */
function getUserSettings(userId, attributes) {
  const parameters = {
    TableName: tableName,
    Key: {'userId': userId},
    ProjectionExpression: attributes
  };
  return docClient.get(parameters).promise();
}

/**
 * Save user settings to DynamoDB Table
 * @param  {String}   userId
 * @param  {Object}   settings
 * @return {Promise}
 */
function saveUserSettings(userId, settings) {
  const item = Object.assign({userId: userId}, settings);
  const parameters = {
    TableName: tableName,
    Item: item
  };
  return docClient.put(parameters).promise();
}

/**
 * Update user settings in DynamoDB Table
 * @param  {String}   userId
 * @param  {Object}   settings
 * @return {Promise}
 */
function updateUserSettings(userId, settings) {
  const updateExpression = Object.keys(settings).reduce((expression, attribute, index) =>
    `${expression}${index == 0 ? 'set' : ','} ${attribute} = :${attribute}`, '');
  const expressionAttributeValues = Object.keys(settings).reduce((values, attribute) =>
    Object.assign(values, {[`:${attribute}`]: settings[attribute]}), {});
  const parameters = {
    TableName: tableName,
    Key: {'userId': userId},
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionAttributeValues
  };
  return docClient.update(parameters).promise();
}

module.exports = {
  deleteUserSettings: deleteUserSettings,
  getUserSettings: getUserSettings,
  saveUserSettings: saveUserSettings,
  updateUserSettings: updateUserSettings
};
