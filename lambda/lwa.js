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

import axios from 'axios';
import config from './config.js';

/**
 * Defines login with amazon api functions
 * @type {Object}
 */
export default {
  /**
   * Returns access token credentials
   *  https://developer.amazon.com/docs/login-with-amazon/authorization-code-grant.html#access-token-request
   * @param  {Object}  parameters
   * @return {Promise}
   */
  getAccessToken: async (parameters) => {
    const { data } = await axios.post(`${config.lwa.apiUrl}/auth/o2/token`, {
      ...parameters,
      client_id: config.skill.clientId,
      client_secret: config.skill.clientSecret
    });
    return data;
  }
};
