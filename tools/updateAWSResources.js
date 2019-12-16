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

const assert = require('assert');
const { exec } = require('child_process');
const fs = require('fs');
const path = require("path");

const askConfig = loadSchema('../.ask/config');
const skill = loadSchema('../skill.json');

/**
 * AWS resources path
 * @type {String}
 */
const AWS_RESOURCES_PATH = '../resources/aws';

/**
 * Deploy resources
 * @type {Object}
 */
const DEPLOY_RESOURCES = askConfig.deploy_settings.default.resources || {};

/**
 * DynmoDB table name
 * @type {String}
 */
const TABLE_NAME = 'AlexaOpenHABSkillSettings';

/**
 * IAM Lambda policy name
 * @type {String}
 */
const POLICY_NAME = 'AlexaOpenHABLambdaRole';

/**
 * IAM Lambda role name
 * @type {String}
 */
const ROLE_NAME = `ask-lambda-${skill.manifest.publishingInformation.locales['en-US'].name}`;

/**
 * Execute AWS CLI command
 * @param  {String} args
 * @return {Promise}
 */
function executeAWSCommand(args) {
  return new Promise((resolve, reject) => {
    exec(`aws ${args} --output json`, (error, stdout, stderr) => {
      if (error) {
        reject(stderr.trim());
      } else {
        try {
          resolve(JSON.parse(stdout));
        } catch (e) {
          resolve({});
        }
      }
    });
  });
}

/**
 * Load schema from json-formatted file
 * @return {Object}
 */
function loadSchema(file) {
  try {
    const schema = fs.readFileSync(resolvePath(file));
    return JSON.parse(schema);
  } catch (e) {
    console.log(`Failed to load json schema from file: ${file}`);
    process.exit(1);
  }
}

/**
 * Update schema into json-formatted file
 * @param  {String} file
 * @param  {Object} schema
 */
function updateSchema(file, schema) {
  try {
    fs.writeFileSync(file, JSON.stringify(schema, null, 2));
  } catch (e) {
    console.log(`Failed to update json schema into file: ${file}`);
    process.exit(1);
  }
}

/**
 * Resolve full path
 * @param  {String} relpath
 * @return {String}
 */
function resolvePath(relpath) {
  return path.resolve(__dirname, relpath);
}

/**
 * Check AWS CLI installed
 */
function checkAWSInstalled() {
  exec(`which aws`, (error) => {
    if (error) {
      console.log(`AWS CLI is not installed.`);
      process.exit(1);
    }
  });
}

/**
 * Create DynmoDB table
 */
function createDynamoDB() {
  const schemaPath = resolvePath(`${AWS_RESOURCES_PATH}/aws_dynamodb_table.json`);
  const lambdaResources = DEPLOY_RESOURCES.lambda || [];

  lambdaResources.forEach((resource) =>
    executeAWSCommand(
      `dynamodb describe-table --table-name ${TABLE_NAME} --region ${resource.awsRegion}`
    ).catch(() =>
      executeAWSCommand(
        `dynamodb create-table --table-name ${TABLE_NAME} --region ${resource.awsRegion} --cli-input-json file://${schemaPath}`
      ).catch((error) => {
        console.log(`Failed to create dynamodb table: ${error}`);
        process.exit(1);
      })
    )
  );
}

/**
 * Update IAM Lambda role policy
 */
function updateIAMRolePolicy() {
  const schemaPath = resolvePath(`${AWS_RESOURCES_PATH}/aws_iam_policy.json`);
  const policyDocument = loadSchema(schemaPath);
  const dynamodbPermResource = `arn:aws:dynamodb:*:*:table/${TABLE_NAME}*`;

  // Update default policy document if necessary
  policyDocument.Statement.forEach((permission) => {
    if (permission.Resource.startsWith('arn:aws:dynamodb') && permission.Resource !== dynamodbPermResource) {
      permission.Resource = dynamodbPermResource;
      updateSchema(schemaPath, policyDocument);
    }
  });

  executeAWSCommand(
    `iam get-role --role-name ${ROLE_NAME}`
  ).then(() =>
    executeAWSCommand(
      `iam get-role-policy --role-name ${ROLE_NAME} --policy-name ${POLICY_NAME}`
    ).then((result) =>
      assert.deepEqual(result.PolicyDocument, policyDocument)
    ).catch(() =>
      executeAWSCommand(
        `iam put-role-policy --role-name ${ROLE_NAME} --policy-name ${POLICY_NAME} --policy-document file://${schemaPath}`
      ).catch((error) => {
        console.log(`Failed to update iam role policy: ${error}`);
        process.exit(1);
      })
    )
  );
}

/**
 * Update Lambda configuration
 */
function updateLambdaConfig() {
  const schemaPath = resolvePath(`${AWS_RESOURCES_PATH}/aws_lambda_configuration.json`);
  const lambdaConfig = loadSchema(schemaPath);
  const lambdaResources = DEPLOY_RESOURCES.lambda || [];

  lambdaResources.forEach((resource) =>
    executeAWSCommand(
      `lambda get-function-configuration --function-name ${resource.functionName} --region ${resource.awsRegion}`
    ).then((result) =>
      Object.keys(lambdaConfig).forEach((key) =>
        assert.deepEqual(result[key], lambdaConfig[key]))
    ).catch(() =>
      executeAWSCommand(
        `lambda update-function-configuration --function-name ${resource.functionName} --region ${resource.awsRegion} --cli-input-json file://${schemaPath}`
      ).catch((error) => {
        console.log(`Failed to update lambda configuration: ${error}`);
        process.exit(1);
      })
    )
  );
}

if (require.main === module) {
  // Check AWS CLI installed
  checkAWSInstalled();
  // Create DynmoDB table
  createDynamoDB();
  // Update IAM Lambda role policy
  updateIAMRolePolicy();
  // Update Lambda configuration
  updateLambdaConfig();
}
