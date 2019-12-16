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

/**
 * Default options, copy to config.js for deployment
 *   or use lambda function environment variables defined inside braces
 *     (Default values are listed inside brackets)
 *
 *   alexa:
 *     gateway: (Alexa Event Gateway for asynchronous response)
 *       eventURL: {ALEXA_GATEWAY_EVENT_URL} [https://api.amazonalexa.com/v3/events]
 *         Alexa gateway events endpoint (Based on regional location)
 *           North America:  https://api.amazonalexa.com/v3/events
 *           Europe:         https://api.eu.amazonalexa.com/v3/events
 *           Far East:       https://api.fe.amazonalexa.com/v3/events
 *
 *     skill:
 *       clientId: {ALEXA_SKILL_CLIENT_ID} [null] (Required)
 *         Alexa Skill Messaging Client Id
 *       clientSecret: {ALEXA_SKILL_CLIENT_SECRET} [null] (Required)
 *         Alexa Skill Messaging Client Secret
 *
 *   amazon:
 *     lwa: (Amazon LWA API for authorization tokens request)
 *       authURL: {AMAZON_LWA_AUTH_URL} [https://api.amazon.com/auth/o2/token]
 *         Amazon LWA OAuth2 token request endpoint
 *       userURL: {AMAZON_LWA_USER_URL} [https://api.amazon.com/user/profile]
 *         Amazon LWA user profile information endpoint
 *
 *   openhab:
 *     baseURL: {OPENHAB_BASE_URL} [https://myopenhab.org/rest]
 *       REST base URL, uncomment this to connect directly to a openHAB server.
 *     user: {OPENHAB_USERNAME} (Optional)
 *       username for the REST server
 *       by default oauth2 tokens will be used for authentication, uncomment this
 *       to use standard basic auth when talking directly to a openHAB server.
 *     pass: {OPENHAB_PASSWORD} (Optional)
 *       password for the REST server
 *       by default oauth2 tokens will be used for authentication, uncomment this
 *       to use standard basic auth when talking directly to a openHAB server.
 *     certFile: {OPENHAB_CERT_FILE} [ssl/client.pfx] (Optional)
 *       SSL client certificate file path for the REST server
 *       use this for certificate auth when talking directly to a openHAB server.
 *     certPass: {OPENHAB_CERT_PASSPHRASE} (Optional)
 *       SSL client certificate passphrase for the REST server
 *       use this for certificate auth when talking directly to a openHAB server.
 *
 */
module.exports = {
  alexa: {
    //gateway: {
    //  eventURL: 'https://api.amazonalexa.com/v3/events',
    //},
    skill: {
      clientId: '<client_id>',
      clientSecret: '<client_secret>'
    }
  },
  openhab: {
    //baseURL: 'https://openhab.example.com/rest',
    //user: 'user@foo.com',
    //pass: 'Password1'
  }
};
