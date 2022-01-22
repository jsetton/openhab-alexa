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

/**
 * Defines api request class
 */
export default class ApiRequest {
  /**
   * Constructor
   * @param {Object} request
   */
  constructor(request) {
    this._request = request;
  }

  /**
   * Returns route key
   * @return {String}
   */
  get routeKey() {
    return this._request.routeKey;
  }

  /**
   * Returns body
   * @return {String}
   */
  get body() {
    return this._request.body;
  }

  /**
   * Returns formatted api response
   * @param  {Number} statusCode
   * @param  {Object} body
   * @return {Object}
   */
  response(statusCode, body) {
    return { statusCode, body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } };
  }

  /**
   * Returns formatted api error response
   * @param  {Number} statusCode
   * @param  {String} message
   * @return {Object}
   */
  error(statusCode, message) {
    return this.response(statusCode, { message });
  }
}
