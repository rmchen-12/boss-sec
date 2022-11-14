/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { toLocalISOString } from 'base/common/date';
import { memoize } from 'base/common/decorators';
import { FileAccess } from 'base/common/network';
import { dirname, join, normalize, resolve } from 'base/common/path';
import { env } from 'base/common/process';
import { joinPath } from 'base/common/resources';
import { URI } from 'base/common/uri';
import { INativeEnvironmentService } from 'platform/environment/common/environment';

export interface INativeEnvironmentPaths {

  /**
   * The user data directory to use for anything that should be
   * persisted except for the content that is meant for the `homeDir`.
   *
   * Only one instance of VSCode can use the same `userDataDir`.
   */
  userDataDir: string;

  /**
   * The user home directory mainly used for persisting extensions
   * and global configuration that should be shared across all
   * versions.
   */
  homeDir: string;

  /**
   * OS tmp dir.
   */
  tmpDir: string;
}

export abstract class AbstractNativeEnvironmentService implements INativeEnvironmentService {

  declare readonly _serviceBrand: undefined;

  @memoize
  get appRoot(): string { return dirname(FileAccess.asFileUri('', require).fsPath); }

  @memoize
  get userHome(): URI { return URI.file(this.paths.homeDir); }

  @memoize
  get userDataPath(): string { return this.paths.userDataDir; }

  @memoize
  get appSettingsHome(): URI { return URI.file(join(this.userDataPath, 'User')); }

  @memoize
  get tmpDir(): URI { return URI.file(this.paths.tmpDir); }

  @memoize
  get cacheHome(): URI { return URI.file(this.userDataPath); }

  @memoize
  get userRoamingDataHome(): URI { return this.appSettingsHome; }

  @memoize
  get settingsResource(): URI { return joinPath(this.userRoamingDataHome, 'settings.json'); }

  @memoize
  get userDataSyncHome(): URI { return joinPath(this.userRoamingDataHome, 'sync'); }

  @memoize
  get machineSettingsResource(): URI { return joinPath(URI.file(join(this.userDataPath, 'Machine')), 'settings.json'); }

  @memoize
  get globalStorageHome(): URI { return joinPath(this.appSettingsHome, 'globalStorage'); }

  @memoize
  get workspaceStorageHome(): URI { return joinPath(this.appSettingsHome, 'workspaceStorage'); }

  @memoize
  get localHistoryHome(): URI { return joinPath(this.appSettingsHome, 'History'); }

  @memoize
  get keybindingsResource(): URI { return joinPath(this.userRoamingDataHome, 'keybindings.json'); }

  @memoize
  get keyboardLayoutResource(): URI { return joinPath(this.userRoamingDataHome, 'keyboardLayout.json'); }

  @memoize
  get installSourcePath(): string { return join(this.userDataPath, 'installSource'); }

  get isBuilt(): boolean { return !env['VSCODE_DEV']; }

  @memoize
  get serviceMachineIdResource(): URI { return joinPath(URI.file(this.userDataPath), 'machineid'); }

  constructor(
    private readonly paths: INativeEnvironmentPaths,
  ) { }
}
