/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { URI } from 'base/common/uri';
import { createDecorator, refineServiceDecorator } from 'platform/instantiation/common/instantiation';

export const IEnvironmentService = createDecorator<IEnvironmentService>('environmentService');
export const INativeEnvironmentService = refineServiceDecorator<IEnvironmentService, INativeEnvironmentService>(IEnvironmentService);

export interface IDebugParams {
  port: number | null;
  break: boolean;
}

export interface IExtensionHostDebugParams extends IDebugParams {
  debugId?: string;
  env?: Record<string, string>;
}

/**
 * Type of extension.
 *
 * **NOTE**: This is defined in `platform/environment` because it can appear as a CLI argument.
 */
export type ExtensionKind = 'ui' | 'workspace' | 'web';

/**
 * A basic environment service that can be used in various processes,
 * such as main, renderer and shared process. Use subclasses of this
 * service for specific environment.
 */
export interface IEnvironmentService {

  readonly _serviceBrand: undefined;

  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  //
  // NOTE: KEEP THIS INTERFACE AS SMALL AS POSSIBLE.
  //
  // AS SUCH:
  //   - PUT NON-WEB PROPERTIES INTO NATIVE ENVIRONMENT SERVICE
  //   - PUT WORKBENCH ONLY PROPERTIES INTO WORKBENCH ENVIRONMENT SERVICE
  //   - PUT ELECTRON-MAIN ONLY PROPERTIES INTO MAIN ENVIRONMENT SERVICE
  //
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

  // --- user roaming data
  userRoamingDataHome: URI;
  settingsResource: URI;
  keybindingsResource: URI;
  keyboardLayoutResource: URI;

  // --- data paths
  globalStorageHome: URI;
  workspaceStorageHome: URI;
  localHistoryHome: URI;
  cacheHome: URI;

  // --- settings sync
  userDataSyncHome: URI;

  // --- logging
  logLevel?: string;
  isBuilt: boolean;

  // --- telemetry
  serviceMachineIdResource: URI;

  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  //
  // NOTE: KEEP THIS INTERFACE AS SMALL AS POSSIBLE.
  //
  // AS SUCH:
  //   - PUT NON-WEB PROPERTIES INTO NATIVE ENVIRONMENT SERVICE
  //   - PUT WORKBENCH ONLY PROPERTIES INTO WORKBENCH ENVIRONMENT SERVICE
  //   - PUT ELECTRON-MAIN ONLY PROPERTIES INTO MAIN ENVIRONMENT SERVICE
  //
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
}

/**
 * A subclass of the `IEnvironmentService` to be used only in native
 * environments (Windows, Linux, macOS) but not e.g. web.
 */
export interface INativeEnvironmentService extends IEnvironmentService {

  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  //
  // NOTE: KEEP THIS INTERFACE AS SMALL AS POSSIBLE.
  //
  // AS SUCH:
  //   - PUT WORKBENCH ONLY PROPERTIES INTO WORKBENCH ENVIRONMENT SERVICE
  //   - PUT ELECTRON-MAIN ONLY PROPERTIES INTO MAIN ENVIRONMENT SERVICE
  //
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

  // --- data paths
  appRoot: string;
  userHome: URI;
  appSettingsHome: URI;
  tmpDir: URI;
  userDataPath: string;
  machineSettingsResource: URI;
  installSourcePath: string;

  // --- use keytar for credentials
  disableKeytar?: boolean;

  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  //
  // NOTE: KEEP THIS INTERFACE AS SMALL AS POSSIBLE.
  //
  // AS SUCH:
  //   - PUT NON-WEB PROPERTIES INTO NATIVE ENVIRONMENT SERVICE
  //   - PUT WORKBENCH ONLY PROPERTIES INTO WORKBENCH ENVIRONMENT SERVICE
  //   - PUT ELECTRON-MAIN ONLY PROPERTIES INTO MAIN ENVIRONMENT SERVICE
  //
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
}
