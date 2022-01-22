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

import { AxiosError } from 'axios';
import db from '#root/database.js';
import lwa from '#root/lwa.js';
import OpenHAB from '#openhab/index.js';
import ApiRequest from './request.js';

/**
 * Handles api gateway request
 * @param  {Object}  event
 * @return {Promise}
 */
export const handleApiRequest = async (event) => {
  // Initialize api request object
  const request = new ApiRequest(event);

  try {
    if (request.routeKey === 'POST /auth/token') {
      let parameters = JSON.parse(request.body);

      // Update parameters to refresh token grant type based on stored user settings if user token grant type
      if (parameters.grant_type === 'user_token' && parameters.user_token) {
        const openhab = new OpenHAB(parameters.user_token);
        const userId = await openhab.getUUID();
        const settings = await db.getUserSettings(userId);
        if (!settings) return request.error(404, 'Not Found');
        parameters = { grant_type: 'refresh_token', refresh_token: settings.refreshToken };
      }
      // Return lwa access token credentials if refresh token grant type
      if (parameters.grant_type === 'refresh_token' && parameters.refresh_token) {
        const credentials = await lwa.getAccessToken(parameters);
        return request.response(200, credentials);
      }

      return request.error(400, 'Bad Request');
    }

    return request.error(501, 'Not Implemented');
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status) {
        return request.error(error.response.status, error.response.statusText);
      }
      return request.error(502, 'Bad Gateway');
    }

    if (error instanceof SyntaxError) {
      return request.error(400, 'Bad Request');
    }

    return request.error(500, 'Internal Server Error');
  }
};
