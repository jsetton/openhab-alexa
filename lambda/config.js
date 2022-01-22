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

/**
 * Defines backend configuration, change the values for your deployment
 *  or use lambda function environment variables defined inside braces
 *
 *  alexa:
 *    apiUrl: {ALEXA_API_URL} [https://api.amazonalexa.com]
 *      Alexa API endpoint
 *
 *  lwa:
 *    apiUrl: {LWA_API_URL} [https://api.amazon.com]
 *      Login With Amazon API endpoint
 *
 *  openhab:
 *    baseUrl: {OPENHAB_BASE_URL} [https://myopenhab.org]
 *      base URL to access your openHAB server
 *
 *    user: {OPENHAB_USERNAME} (Optional)
 *      username to access your openHAB server
 *      by default OAuth2 tokens will be used for authentication, set this
 *      to use standard basic auth when connecting directly to your server.
 *
 *    pass: {OPENHAB_PASSWORD} (Optional)
 *      password to access your openHAB server
 *      by default OAuth2 tokens will be used for authentication, set this
 *      to use standard basic auth when connecting directly to your server.
 *
 *    certFile: {OPENHAB_CERT_FILE} [ssl/client.pfx] (Optional)
 *      SSL client certificate file path to access your openHAB server
 *      use this for certificate auth when connecting directly to your server,
 *      if certificate file exists.
 *
 *    certPass: {OPENHAB_CERT_PASSPHRASE} (Optional)
 *      SSL client certificate passphrase to access your openHAB server
 *      use this for certificate auth when connecting directly to your server,
 *      if certificate file exists.
 *
 *  skill:
 *    apiUrl: {SKILL_API_URL} (Required)
 *      skill API endpoint
 *
 *    clientId: {SKILL_CLIENT_ID} (Required)
 *      skill client id
 *
 *    clientSecret: {SKILL_CLIENT_SECRET} (Required)
 *      skill client secret
 *
 *    tableName: {SKILL_TABLE_NAME} [AlexaOpenHABSkillSettings]
 *      skill DynamoDB table name
 *
 * @type {Object}
 */
export default {
  alexa: {
    apiUrl: process.env.ALEXA_API_URL || 'https://api.amazonalexa.com'
  },
  lwa: {
    apiUrl: process.env.LWA_API_URL || 'https://api.amazon.com'
  },
  openhab: {
    baseUrl: process.env.OPENHAB_BASE_URL || 'https://myopenhab.org',
    user: process.env.OPENHAB_USERNAME,
    pass: process.env.OPENHAB_PASSWORD,
    certFile: process.env.OPENHAB_CERT_FILE || 'ssl/client.pfx',
    certPass: process.env.OPENHAB_CERT_PASSPHRASE
  },
  skill: {
    apiUrl: process.env.SKILL_API_URL,
    clientId: process.env.SKILL_CLIENT_ID,
    clientSecret: process.env.SKILL_CLIENT_SECRET,
    tableName: process.env.SKILL_TABLE_NAME || 'AlexaOpenHABSkillSettings'
  }
};
