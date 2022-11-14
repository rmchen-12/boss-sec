/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as errors from 'base/common/errors';
import * as uuid from 'base/common/uuid';
import { getMac } from 'base/node/macAddress';

let machineId: Promise<string>;
export async function getMachineId(): Promise<string> {
  if (!machineId) {
    machineId = (async () => {
      const id = await getMacMachineId();

      return id || uuid.generateUuid(); // fallback, generate a UUID
    })();
  }

  return machineId;
}

async function getMacMachineId(): Promise<string | undefined> {
  try {
    const crypto = await import('crypto');
    const macAddress = getMac();
    return crypto.createHash('sha256').update(macAddress, 'utf8').digest('hex');
  } catch (err) {
    errors.onUnexpectedError(err);
    return undefined;
  }
}
