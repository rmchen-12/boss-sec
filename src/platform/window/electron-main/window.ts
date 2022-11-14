/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { BrowserWindow, Rectangle } from 'electron';
import { CancellationToken } from 'base/common/cancellation';
import { Event } from 'base/common/event';
import { IDisposable } from 'base/common/lifecycle';
import { INativeWindowConfiguration } from 'platform/window/common/window';

export interface ICodeWindow extends IDisposable {

  readonly onWillLoad: Event<ILoadEvent>;
  readonly onDidSignalReady: Event<void>;
  readonly onDidClose: Event<void>;
  readonly onDidDestroy: Event<void>;

  readonly whenClosedOrLoaded: Promise<void>;

  readonly id: number;
  readonly win: BrowserWindow | null; /* `null` after being disposed */
  readonly config: INativeWindowConfiguration | undefined;

  readonly backupPath?: string;

  readonly lastFocusTime: number;

  readonly isReady: boolean;
  ready(): Promise<ICodeWindow>;
  setReady(): void;

  readonly hasHiddenTitleBarStyle: boolean;

  addTabbedWindow(window: ICodeWindow): void;

  load(config: INativeWindowConfiguration, options?: { isReload?: boolean }): void;
  reload(): void;

  focus(options?: { force: boolean }): void;
  close(): void;

  getBounds(): Rectangle;

  send(channel: string, ...args: any[]): void;
  sendWhenReady(channel: string, token: CancellationToken, ...args: any[]): void;

  readonly isFullScreen: boolean;
  toggleFullScreen(): void;

  isMinimized(): boolean;

  setRepresentedFilename(name: string): void;
  getRepresentedFilename(): string | undefined;

  handleTitleDoubleClick(): void;

  serializeWindowState(): IWindowState;
}

export const enum LoadReason {

  /**
   * The window is loaded for the first time.
   */
  INITIAL = 1,

  /**
   * The window is loaded into a different workspace context.
   */
  LOAD,

  /**
   * The window is reloaded.
   */
  RELOAD
}

export const enum UnloadReason {

  /**
   * The window is closed.
   */
  CLOSE = 1,

  /**
   * All windows unload because the application quits.
   */
  QUIT,

  /**
   * The window is reloaded.
   */
  RELOAD,

  /**
   * The window is loaded into a different workspace context.
   */
  LOAD
}

export interface IWindowState {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  mode?: WindowMode;
  display?: number;
}

export const defaultWindowState = function (mode = WindowMode.Normal): IWindowState {
  return {
    width: 1024,
    height: 768,
    mode,
  };
};

export const enum WindowMode {
  Maximized,
  Normal,
  Minimized, // not used anymore, but also cannot remove due to existing stored UI state (needs migration)
  Fullscreen
}

export interface ILoadEvent {
  reason: LoadReason;
}

export const enum WindowError {

  /**
   * Maps to the `unresponsive` event on a `BrowserWindow`.
   */
  UNRESPONSIVE = 1,

  /**
   * Maps to the `render-proces-gone` event on a `WebContents`.
   */
  CRASHED = 2,

  /**
   * Maps to the `did-fail-load` event on a `WebContents`.
   */
  LOAD = 3
}
