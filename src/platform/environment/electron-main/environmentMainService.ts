/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { memoize } from 'base/common/decorators';
import { join } from 'base/common/path';
import { IEnvironmentService, INativeEnvironmentService } from 'platform/environment/common/environment';
import { NativeEnvironmentService } from 'platform/environment/node/environmentService';
import { refineServiceDecorator } from 'platform/instantiation/common/instantiation';

export const IEnvironmentMainService = refineServiceDecorator<IEnvironmentService, IEnvironmentMainService>(IEnvironmentService);

/**
 * A subclass of the `INativeEnvironmentService` to be used only in electron-main
 * environments.
 */
export interface IEnvironmentMainService extends INativeEnvironmentService {
  // --- backup paths
  backupHome: string;
  backupWorkspacesPath: string;

  // --- V8 code caching
  codeCachePath: string | undefined;
  useCodeCache: boolean;
}

export class EnvironmentMainService extends NativeEnvironmentService implements IEnvironmentMainService {

  @memoize
  get cachedLanguagesPath(): string { return join(this.userDataPath, 'clp'); }

  @memoize
  get backupHome(): string { return join(this.userDataPath, 'Backups'); }

  @memoize
  get backupWorkspacesPath(): string { return join(this.backupHome, 'workspaces.json'); }

  @memoize
  get mainLockfile(): string { return join(this.userDataPath, 'code.lock'); }

  @memoize
  get codeCachePath(): string | undefined { return process.env['VSCODE_CODE_CACHE_PATH'] || undefined; }

  @memoize
  get useCodeCache(): boolean { return !!this.codeCachePath; }
}
