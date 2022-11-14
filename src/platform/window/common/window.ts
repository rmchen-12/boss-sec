/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { URI, UriComponents } from 'base/common/uri';
import { ISandboxConfiguration } from 'base/parts/sandbox/common/sandboxTypes';

export const WindowMinimumSize = {
  WIDTH: 400,
  WIDTH_WITH_VERTICAL_PANEL: 600,
  HEIGHT: 270,
};

export interface IBaseOpenWindowsOptions {

  /**
   * Whether to reuse the window or open a new one.
   */
  readonly forceReuseWindow?: boolean;

  /**
   * The remote authority to use when windows are opened with either
   * - no workspace (empty window)
   * - a workspace that is neither `file://` nor `vscode-remote://`
   * Use 'null' for a local window.
   * If not set, defaults to the remote authority of the current window.
   */
  readonly remoteAuthority?: string | null;
}

export interface IOpenWindowOptions extends IBaseOpenWindowsOptions {
  readonly forceNewWindow?: boolean;
  readonly preferNewWindow?: boolean;

  readonly noRecentEntry?: boolean;

  readonly addMode?: boolean;

  readonly diffMode?: boolean;
  readonly gotoLineMode?: boolean;

  readonly waitMarkerFileURI?: URI;
}

export interface IAddFoldersRequest {
  readonly foldersToAdd: UriComponents[];
}

export interface IOpenedWindow {
  readonly id: number;
  readonly title: string;
  readonly filename?: string;
  readonly dirty: boolean;
}

export interface IOpenEmptyWindowOptions extends IBaseOpenWindowsOptions { }

export type IWindowOpenable = IWorkspaceToOpen | IFolderToOpen | IFileToOpen;

export interface IBaseWindowOpenable {
  label?: string;
}

export interface IWorkspaceToOpen extends IBaseWindowOpenable {
  readonly workspaceUri: URI;
}

export interface IFolderToOpen extends IBaseWindowOpenable {
  readonly folderUri: URI;
}

export interface IFileToOpen extends IBaseWindowOpenable {
  readonly fileUri: URI;
}

export function isWorkspaceToOpen(uriToOpen: IWindowOpenable): uriToOpen is IWorkspaceToOpen {
  return !!(uriToOpen as IWorkspaceToOpen).workspaceUri;
}

export function isFolderToOpen(uriToOpen: IWindowOpenable): uriToOpen is IFolderToOpen {
  return !!(uriToOpen as IFolderToOpen).folderUri;
}

export function isFileToOpen(uriToOpen: IWindowOpenable): uriToOpen is IFileToOpen {
  return !!(uriToOpen as IFileToOpen).fileUri;
}

export type MenuBarVisibility = 'classic' | 'visible' | 'toggle' | 'hidden' | 'compact';

export interface IWindowsConfiguration {
  readonly window: IWindowSettings;
}

export interface IWindowSettings {
  readonly openFilesInNewWindow: 'on' | 'off' | 'default';
  readonly openFoldersInNewWindow: 'on' | 'off' | 'default';
  readonly openWithoutArgumentsInNewWindow: 'on' | 'off';
  readonly restoreWindows: 'preserve' | 'all' | 'folders' | 'one' | 'none';
  readonly restoreFullscreen: boolean;
  readonly zoomLevel: number;
  readonly titleBarStyle: 'native' | 'custom';
  readonly autoDetectHighContrast: boolean;
  readonly autoDetectColorScheme: boolean;
  readonly menuBarVisibility: MenuBarVisibility;
  readonly newWindowDimensions: 'default' | 'inherit' | 'offset' | 'maximized' | 'fullscreen';
  readonly nativeTabs: boolean;
  readonly nativeFullScreen: boolean;
  readonly enableMenuBarMnemonics: boolean;
  readonly closeWhenEmpty: boolean;
  readonly clickThroughInactive: boolean;
}

interface IWindowBorderColors {
  readonly 'window.activeBorder'?: string;
  readonly 'window.inactiveBorder'?: string;
}

export interface IPath extends IPathData {

  /**
   * The file path to open within the instance
   */
  fileUri?: URI;
}

export interface IPathData {

  /**
   * The file path to open within the instance
   */
  readonly fileUri?: UriComponents;

  /**
   * A hint that the file exists. if true, the
   * file exists, if false it does not. with
   * `undefined` the state is unknown.
   */
  readonly exists?: boolean;

  /**
   * Specifies if the file should be only be opened
   * if it exists.
   */
  readonly openOnlyIfExists?: boolean;
}

export interface IPathsToWaitFor extends IPathsToWaitForData {
  paths: IPath[];
  waitMarkerFileUri: URI;
}

interface IPathsToWaitForData {
  readonly paths: IPathData[];
  readonly waitMarkerFileUri: UriComponents;
}

export interface IOpenFileRequest {
  readonly filesToOpenOrCreate?: IPathData[];
  readonly filesToDiff?: IPathData[];
}

/**
 * Additional context for the request on native only.
 */
export interface INativeOpenFileRequest extends IOpenFileRequest {
  readonly termProgram?: string;
  readonly filesToWait?: IPathsToWaitForData;
}

export interface INativeRunActionInWindowRequest {
  readonly id: string;
  readonly from: 'menu' | 'touchbar' | 'mouse';
  readonly args?: any[];
}

export interface INativeRunKeybindingInWindowRequest {
  readonly userSettingsLabel: string;
}

export interface IColorScheme {
  readonly dark: boolean;
  readonly highContrast: boolean;
}

export interface IWindowConfiguration {
  remoteAuthority?: string;

  filesToOpenOrCreate?: IPath[];
  filesToDiff?: IPath[];
}

export interface IOSConfiguration {
  readonly release: string;
  readonly hostname: string;
}

export interface INativeWindowConfiguration extends IWindowConfiguration, ISandboxConfiguration {
  mainPid: number;

  machineId: string;

  execPath: string;
  backupPath?: string;

  homeDir: string;
  tmpDir: string;
  userDataDir: string;

  isInitialStartup?: boolean;

  fullscreen?: boolean;
  maximized?: boolean;
  accessibilitySupport?: boolean;
  colorScheme: IColorScheme;
  autoDetectHighContrast?: boolean;
  autoDetectColorScheme?: boolean;

  perfMarks: PerformanceMark[];

  filesToWait?: IPathsToWaitFor;

  os: IOSConfiguration;
}

/**
 * According to Electron docs: `scale := 1.2 ^ level`.
 * https://github.com/electron/electron/blob/master/docs/api/web-contents.md#contentssetzoomlevellevel
 */
export function zoomLevelToZoomFactor(zoomLevel = 0): number {
  return Math.pow(1.2, zoomLevel);
}
