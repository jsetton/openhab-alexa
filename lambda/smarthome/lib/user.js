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

const log = require('@lib/log.js');
const rest = require('@lib/rest.js');
const storage = require('@lib/storage.js');
const utils = require('@lib/utils.js');

/**
 * Get user access token
 * @param  {String}   granteeToken
 * @return {Promise}
 */
function getAccessToken(granteeToken) {
  let userId;
  // Get userId from profile information
  return requestUserProfile(granteeToken).then((profile) => {
    const attributes = "accessToken, expireTime, refreshToken";
    // Get user settings from database
    return storage.getUserSettings((userId = profile.user_id), attributes);
  }).then((result) => {
    const settings = result.Item || {};

    if (settings.accessToken) {
      // Return stored access token if not expired
      if (settings.expireTime > utils.timeInSeconds()) {
        return settings.accessToken;
      }
      // Refresh token if available and return new access token
      if (settings.refreshToken) {
        return refreshAccessToken(userId, settings.refreshToken);
      }
    }
    // Throw error if reaching this point
    throw 'No valid access token found for userId: ' + userId;
  }).catch((error) => {
    log.error('getAccessToken failed with error:', error);
    throw error;
  });
}

/**
 * Grant authorization request
 * @param  {String}   grantCode
 * @param  {String}   granteeToken
 * @return {Promise}
 */
function grantAuthorization(grantCode, granteeToken) {
  // Request access token, using grant code, and user profile information simultaneously
  return Promise.all([requestAccessAuthCode(grantCode), requestUserProfile(granteeToken)]).then((results) => {
    const [tokens, profile] = results;
    log.info('grantAuthorization request results:', {tokens: tokens, profile: profile});
    const userId = profile.user_id;
    const settings = {
      'accessToken': tokens.access_token,
      'tokenType': tokens.token_type,
      'expireTime': utils.timeInSeconds() + parseInt(tokens.expires_in),
      'refreshToken': tokens.refresh_token
    };
    // Store user settings to database, and return userId if successful
    return storage.saveUserSettings(userId, settings);
  }).catch((error) => {
    log.error('grantAuthorization failed with error:', error);
    throw error;
  });
}

/**
 * Handle user access errors based on payload error code returned by Alexa event gateway
 * @param  {String} granteeToken
 * @param  {Object} error
 */
function handleAccessError(granteeToken, error) {
  if (error.result.payload) {
    // Get userId from profile information
    requestUserProfile(granteeToken).then((profile) => {
      const userId = profile.user_id;
      // Take action depending on payload error code
      switch(error.result.payload.code) {
        // User authorization revoked
        case 'SKILL_DISABLED_EXCEPTION':
          storage.deleteUserSettings(userId).then(() =>
            log.info('handleAccessError deleted revoked user access for ' + userId));
          break;
      }
    }).catch((error) => {
      log.error('handleAccessError failed with error:', error);
    });
  }
}

/**
 * Refresh access token
 * @param  {String}   userId
 * @param  {String}   refreshToken
 * @return {Promise}
 */
function refreshAccessToken(userId, refreshToken) {
  const settings = {};
  // Get refresh access token
  return requestAccessRefreshToken(refreshToken).then((tokens) => {
    log.info('refreshAuthorization tokens result:', {tokens: tokens});
    Object.assign(settings, {
      'accessToken': tokens.access_token,
      'tokenType': tokens.token_type,
      'expireTime': utils.timeInSeconds() + parseInt(tokens.expires_in),
      'refreshToken': tokens.refresh_token
    });
    // Update user settings to database, and return new accessToken if successful
    return storage.updateUserSettings(userId, settings);
  }).then(() => {
    return settings.accessToken;
  }).catch((error) => {
    log.error('refreshAccessToken failed with error:', error);
    throw error;
  });
}

/**
 * Request access token with authorization code
 * @param  {String}  code
 * @return {Promise}
 */
 function requestAccessAuthCode(code) {
  return rest.getAuthTokens({
    grant_type: 'authorization_code',
    code: code
  });
}

/**
 * Request access token with refresh token
 * @param  {String}  refreshToken
 * @return {Promise}
 */
function requestAccessRefreshToken(refreshToken) {
  return rest.getAuthTokens({
    grant_type: 'refresh_token',
    refresh_token: refreshToken
  });
}

/**
 * Request user profile information
 * @param  {String}  token
 * @return {Promise}
 */
 function requestUserProfile(token) {
  return rest.getUserProfile(token);
}

module.exports = {
  getAccessToken: getAccessToken,
  grantAuthorization: grantAuthorization,
  handleAccessError: handleAccessError
};
