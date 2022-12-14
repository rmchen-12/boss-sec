/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/


import { ISandboxConfiguration } from 'base/parts/sandbox/common/sandboxTypes';
import { ipcRenderer, webFrame, contextBridge, IpcRendererEvent } from 'electron';


//#region Utilities

/**
 * @param {string} channel
 * @returns {true | never}
 */
function validateIPC(channel: string) {
  if (!channel || !channel.startsWith('vscode:')) {
    throw new Error(`Unsupported event IPC channel '${channel}'`);
  }

  return true;
}

/**
 * @param {string} key the name of the process argument to parse
 * @returns {string | undefined}
 */
function parseArgv(key: string) {
  for (const arg of process.argv) {
    if (arg.indexOf(`--${key}=`) === 0) {
      return arg.split('=')[1];
    }
  }

  return undefined;
}

//#endregion

//#region Resolve Configuration

/**
 * @typedef {import('../common/sandboxTypes').ISandboxConfiguration} ISandboxConfiguration
 */

/** @type {ISandboxConfiguration | undefined} */
let configuration: ISandboxConfiguration | undefined = undefined;

/** @type {Promise<ISandboxConfiguration>} */
const resolveConfiguration = (async () => {


  try {

    // Resolve configuration from electron-main

    // Apply `userEnv` directly
    Object.assign(process.env);

    // Apply zoom level early before even building the
    // window DOM elements to avoid UI flicker. We always
    // have to set the zoom level from within the window
    // because Chrome has it's own way of remembering zoom
    // settings per origin (if vscode-file:// is used) and
    // we want to ensure that the user configuration wins.

    return configuration;
  } catch (error) {
    throw new Error(`Preload: unable to fetch vscode-window-config: ${error}`);
  }
})();

//#endregion

//#region Globals Definition

// #######################################################################
// ###                                                                 ###
// ###       !!! DO NOT USE GET/SET PROPERTIES ANYWHERE HERE !!!       ###
// ###       !!!  UNLESS THE ACCESS IS WITHOUT SIDE EFFECTS  !!!       ###
// ###       (https://github.com/electron/electron/issues/25516)       ###
// ###                                                                 ###
// #######################################################################

/**
 * @type {import('../electron-sandbox/globals')}
 */
const globals = {

  /**
   * A minimal set of methods exposed from Electron's `ipcRenderer`
   * to support communication to main process.
   *
   * @typedef {import('../electron-sandbox/electronTypes').IpcRenderer} IpcRenderer
   * @typedef {import('electron').IpcRendererEvent} IpcRendererEvent
   *
   * @type {IpcRenderer}
   */

  ipcRenderer: {

    /**
     * @param {string} channel
     * @param {any[]} args
     */
    send(channel: string, ...args: any[]) {
      if (validateIPC(channel)) {
        ipcRenderer.send(channel, ...args);
      }
    },

    /**
     * @param {string} channel
     * @param {any[]} args
     * @returns {Promise<any> | undefined}
     */
    invoke(channel: string, ...args: any[]) {
      if (validateIPC(channel)) {
        return ipcRenderer.invoke(channel, ...args);
      }
    },

    /**
     * @param {string} channel
     * @param {(event: IpcRendererEvent, ...args: any[]) => void} listener
     * @returns {IpcRenderer}
     */
    on(channel: string, listener: () => any) {
      if (validateIPC(channel)) {
        ipcRenderer.on(channel, listener);

        return this;
      }
    },

    /**
     * @param {string} channel
     * @param {(event: IpcRendererEvent, ...args: any[]) => void} listener
     * @returns {IpcRenderer}
     */
    once(channel: string, listener: () => any) {
      if (validateIPC(channel)) {
        ipcRenderer.once(channel, listener);

        return this;
      }
    },

    /**
     * @param {string} channel
     * @param {(event: IpcRendererEvent, ...args: any[]) => void} listener
     * @returns {IpcRenderer}
     */
    removeListener(channel: string, listener: () => void) {
      if (validateIPC(channel)) {
        ipcRenderer.removeListener(channel, listener);

        return this;
      }
    },
  },

  /**
   * @type {import('../electron-sandbox/globals').IpcMessagePort}
   */
  ipcMessagePort: {

    /**
     * @param {string} responseChannel
     * @param {string} nonce
     */
    acquire(responseChannel: string, nonce: string) {
      if (validateIPC(responseChannel)) {
        const responseListener = (/** @type {IpcRendererEvent} */ e: IpcRendererEvent, /** @type {string} */ responseNonce: string) => {
          // validate that the nonce from the response is the same
          // as when requested. and if so, use `postMessage` to
          // send the `MessagePort` safely over, even when context
          // isolation is enabled
          if (nonce === responseNonce) {
            ipcRenderer.off(responseChannel, responseListener);
            window.postMessage(nonce, '*', e.ports);
          }
        };

        // handle reply from main
        ipcRenderer.on(responseChannel, responseListener);
      }
    },
  },

  /**
   * Support for subset of methods of Electron's `webFrame` type.
   *
   * @type {import('../electron-sandbox/electronTypes').WebFrame}
   */
  webFrame: {

    /**
     * @param {number} level
     */
    setZoomLevel(level: Number) {
      if (typeof level === 'number') {
        webFrame.setZoomLevel(level);
      }
    },
  },

  /**
   * Support for a subset of access to node.js global `process`.
   *
   * Note: when `sandbox` is enabled, the only properties available
   * are https://github.com/electron/electron/blob/master/docs/api/process.md#sandbox
   *
   * @typedef {import('../electron-sandbox/globals').ISandboxNodeProcess} ISandboxNodeProcess
   *
   * @type {ISandboxNodeProcess}
   */
  process: {
    get platform() { return process.platform; },
    get arch() { return process.arch; },
    get env() { return { ...process.env }; },
    get pid() { return process.pid; },
    get versions() { return process.versions; },
    get type() { return 'renderer'; },
    get execPath() { return process.execPath; },
    get sandboxed() { return process.sandboxed; },

    /**
     * @returns {string}
     */
    cwd() {
      return process.env['VSCODE_CWD'] || process.execPath.substr(0, process.execPath.lastIndexOf(process.platform === 'win32' ? '\\' : '/'));
    },

    /**
     * @returns {Promise<import('electron').ProcessMemoryInfo>}
     */
    getProcessMemoryInfo() {
      return process.getProcessMemoryInfo();
    },

    /**
     * @param {string} type
     * @param {Function} callback
     * @returns {void}
     */
    on(type: string, callback: () => any) {
      // @ts-ignore
      process.on(type, callback);
    },
  },

  /**
   * Some information about the context we are running in.
   *
   * @type {import('../electron-sandbox/globals').ISandboxContext}
   */
  context: {

    /**
     * A configuration object made accessible from the main side
     * to configure the sandbox browser window.
     *
     * Note: intentionally not using a getter here because the
     * actual value will be set after `resolveConfiguration`
     * has finished.
     *
     * @returns {ISandboxConfiguration | undefined}
     */
    configuration() {
      return configuration;
    },

    /**
     * Allows to await the resolution of the configuration object.
     *
     * @returns {Promise<ISandboxConfiguration>}
     */
    async resolveConfiguration() {
      return resolveConfiguration;
    },
  },
};

// Use `contextBridge` APIs to expose globals to VSCode
// only if context isolation is enabled, otherwise just
// add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('vscode', globals);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore
  window.vscode = globals;
}
