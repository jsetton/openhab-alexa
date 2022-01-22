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

import log from './log.js';
import { handleSmarthomeRequest } from './alexa/smarthome/index.js';
import { handleApiRequest } from './api/index.js';

/**
 * Defines skill event handler
 * @param  {Object}  event
 * @param  {Object}  context
 * @return {Promise}
 */
export const handler = async (event, context) => {
  let response;

  log.info('Received event:', event);

  if (event.directive?.header.payloadVersion === '3') {
    response = await handleSmarthomeRequest(event, context);
  } else if (event.routeKey) {
    response = await handleApiRequest(event);
  } else {
    log.warn('Unsupported event:', event);
  }

  if (response) {
    log.info('Response:', response);
    return response;
  }
};
