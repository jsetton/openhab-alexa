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

const fs = require('fs');
const request = require('request-promise-native');
const Agent = require('agentkeepalive');
const EventSource = require('eventsource');

/**
 * Defines configuration settings object
 * @type {Object}
 */
const config = getConfig();

/**
 * Returns config settings
 * @return {Object}
 */
function getConfig() {
  // Default configuration
  const config = {
    alexa : {
      gateway: {
        eventURL: process.env.ALEXA_GATEWAY_EVENT_URL || 'https://api.amazonalexa.com/v3/events',
      },
      skill: {
        clientId: process.env.ALEXA_SKILL_CLIENT_ID || null,
        clientSecret: process.env.ALEXA_SKILL_CLIENT_SECRET || null
      },
    },
    amazon: {
      lwa: {
        authURL: process.env.AMAZON_LWA_AUTH_URL || 'https://api.amazon.com/auth/o2/token',
        userURL: process.env.AMAZON_LWA_USER_URL || 'https://api.amazon.com/user/profile'
      }
    },
    openhab: {
      baseURL: process.env.OPENHAB_BASE_URL || 'https://myopenhab.org/rest',
      user: process.env.OPENHAB_USERNAME,
      pass: process.env.OPENHAB_PASSWORD,
      certFile: process.env.OPENHAB_CERT_FILE || 'ssl/client.pfx',
      certPass: process.env.OPENHAB_CERT_PASSPHRASE
    }
  };
  // Merge config file settings with default ones
  Object.assign(config, getConfigFileSettings());
  // Merge username & password if specified
  if (config.openhab.user && config.openhab.pass) {
    config.openhab.userpass = `${config.openhab.user}:${config.openhab.pass}`;
  }
  // Load ssl client certificate if available
  if (fs.existsSync(config.openhab.certFile)) {
    config.openhab.cert = fs.readFileSync(`${process.cwd()}/${config.openhab.certFile}`);
  }
  return config;
}

/**
 * Returns config file settings
 * @return {Object}
 */
function getConfigFileSettings() {
  try {
    return require('@root/config.js');
  } catch (e) {
    return {};
  }
}

/**
 * Returns request options with openHAB authentication settings
 * @param  {String}   token
 * @param  {Object}   options
 * @return {Object}
 */
function ohAuthenticationSettings(token, options = {}) {
  if (config.openhab.cert) {
    // SSL Certificate Authentication
    options.agentOptions = Object.assign({}, options.agentOptions, {
      pfx: config.openhab.cert,
      passphrase: config.openhab.certPass
    });
  } else {
    options.headers = Object.assign({}, options.headers, {
      'Authorization': config.openhab.userpass ?
        // Basic Authentication
        'Basic ' + Buffer.from(config.openhab.userpass).toString('base64') :
        // OAuth2 Authentication
        'Bearer ' + token
    });
  }
  return options;
}

/**
 * Returns authorization oauth2 tokens from Amazon API
 *    requests:
 *      {'grant_type': 'authorization_code', 'code': <code>}
 *      {'grant_type': 'refresh_token', 'refresh_token': <token>}
 *
 * @param  {Object}   parameters
 * @return {Promise}
 */
function getAuthTokens(parameters) {
  const options = {
    method: 'POST',
    uri: config.amazon.lwa.authURL,
    json: true,
    body: Object.assign(parameters, {
      client_id: config.alexa.skill.clientId,
      client_secret: config.alexa.skill.clientSecret
    })
  };
  return handleRequest(options);
}

/**
 * Returns user profile information from Amazon API
 * @param  {String}   token
 * @return {Promise}
 */
function getUserProfile(token) {
  const options = {
    method: 'GET',
    uri: `${config.amazon.lwa.userURL}?access_token=${token}`,
    json: true
  };
  return handleRequest(options);
}

/**
 * Returns a single item
 * @param  {String}   token
 * @param  {String}   itemName
 * @param  {Number}   timeout
 * @return {Promise}
 */
function getItem(token, itemName, timeout) {
  return getItemOrItems(token, itemName, timeout);
}

/**
 * Returns all items with alexa, channel and synonyms metadata
 * @param  {String}   token
 * @param  {Number}   timeout
 * @return {Promise}
 */
function getItems(token, timeout) {
  const parameters = {
    fields: 'editable,groupNames,groupType,name,label,metadata,stateDescription,tags,type',
    metadata: 'alexa,autoupdate,channel,synonyms'
  };
  return getItemOrItems(token, null, timeout, parameters);
}

/**
 * Returns get item(s) result
 * @param  {String}   token
 * @param  {String}   itemName
 * @param  {Number}   timeout
 * @param  {Object}   parameters
 * @return {Promise}
 */
function getItemOrItems(token, itemName, timeout, parameters) {
  const options = ohAuthenticationSettings(token, {
    method: 'GET',
    uri: `${config.openhab.baseURL}/items/${itemName || ''}`,
    qs: parameters,
    json: true
  });
  return handleRequest(options, timeout);
}

/**
 * Returns openHAB service config
 * @param  {String}   token
 * @param  {String}   serviceId
 * @param  {Number}   timeout
 * @return {Promise}
 */
function getServiceConfig(token, serviceId, timeout) {
  const options = ohAuthenticationSettings(token, {
    method: 'GET',
    uri: `${config.openhab.baseURL}/services/${serviceId}/config`,
    json: true
  });
  return handleRequest(options, timeout);
}

/**
  * Poll item state events from openHAB rest server,
  *   looking for specific updates and return new states if found wihtin timeout period
  *
  * @param  {String}   token
  * @param  {Array}    itemNames
  * @param  {Integer}  timeout
  * @return {Promise}
 **/
function pollItemStateEvents(token, itemNames, timeout) {
  const url = `${config.openhab.baseURL}/events`;
  const options = ohAuthenticationSettings(token, {});
  const es = new EventSource(url, Object.assign(options, {https: options.agentOptions}));
  const result = {};
  let timer;

  function terminateConnection() {
    // Stop Timer
    clearTimeout(timer);
    // Close event source connection
    es.close();
  }

  return new Promise((resolve, reject) => {
    es.addEventListener('message', (e) => {
      const data = JSON.parse(e.data);

      if (data.type === 'ItemStateEvent') {
        const name = data.topic.match(/^smarthome\/items\/(\w+)\/state$/)[1];
        const index = itemNames.indexOf(name);

        // Remove matching item from list
        if (index > -1) {
          itemNames.splice(index, 1);
          result[name] = JSON.parse(data.payload).value;
        }
        // Return result when item names list becomes empty
        if (itemNames.length === 0) {
          terminateConnection();
          resolve(result);
        }
      }
    }, false);

    es.addEventListener('open', () => {
      // Close event source connection when reaching timeout
      timer = setTimeout(() => {
        terminateConnection();
        reject({cause: 'timed out'});
      }, timeout * 1000);
    }, false);

    es.addEventListener('error', (e) => {
      terminateConnection();
      reject(e);
    }, false);
  });
}

/**
 * POST a command to a item
 * @param  {String}   token
 * @param  {String}   itemName
 * @param  {String}   value
 * @param  {Number}   timeout
 * @return {Promise}
 */
function postItemCommand(token, itemName, value, timeout) {
  const options = ohAuthenticationSettings(token, {
    method: 'POST',
    uri: `${config.openhab.baseURL}/items/${itemName}`,
    headers: {
      'Content-Type': 'text/plain'
    },
    body: value.toString()
  });
  return handleRequest(options, timeout);
}

/**
 * POST a message to ALexa event gateway
 * @param  {String}   token
 * @param  {String}   message
 * @return {Promise}
 **/
function postMessageEventGateway(token, message) {
  const options = {
    method: 'POST',
    uri: `${config.alexa.gateway.eventURL}`,
    headers: {
      'Authorization': 'Bearer ' + token
    },
    json: true,
    body: message
  };
  return handleRequest(options);
}

/**
 * Handles http request
 * @param  {Object}   options
 * @param  {Number}   timeout
 * @return {Promise}
 */
function handleRequest(options, timeout) {
  // Add default request options
  Object.assign(options, {
    agentClass: options.uri.startsWith('https') ? Agent.HttpsAgent : Agent,
    agentOptions: Object.assign({}, options.agentOptions, {
      // Set keep-alive free socket to timeout after 45s of inactivity
      freeSocketTimeout: 45000
    }),
    headers: Object.assign({}, options.headers, {
      'Cache-Control': 'no-cache'
    }),
    gzip: true,
    timeout: parseInt(timeout)
  });
  return request(options);
}

module.exports = {
  getAuthTokens: getAuthTokens,
  getUserProfile: getUserProfile,
  getItem: getItem,
  getItems: getItems,
  getServiceConfig: getServiceConfig,
  pollItemStateEvents: pollItemStateEvents,
  postItemCommand: postItemCommand,
  postMessageEventGateway: postMessageEventGateway
};
