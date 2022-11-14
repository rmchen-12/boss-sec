/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { homedir, tmpdir } from 'os';
import { AbstractNativeEnvironmentService } from 'platform/environment/common/environmentService';
import { getUserDataPath } from 'platform/environment/node/userDataPath';

export class NativeEnvironmentService extends AbstractNativeEnvironmentService {

  constructor() {
    super({
      homeDir: homedir(),
      tmpDir: tmpdir(),
      userDataDir: getUserDataPath(),
    });
  }
}
