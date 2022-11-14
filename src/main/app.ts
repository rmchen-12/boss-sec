import { app } from 'electron';
import { onUnexpectedError, setUnexpectedErrorHandler } from 'base/common/errors';
import { Disposable } from 'base/common/lifecycle';
import { IProcessEnvironment } from 'base/common/platform';
import { IEnvironmentMainService } from 'platform/environment/electron-main/environmentMainService';
import { IInstantiationService, ServicesAccessor } from 'platform/instantiation/common/instantiation';
import { ILifecycleMainService, LifecycleMainPhase, ShutdownReason } from 'platform/lifecycle/electron-main/lifecycleMainService';
import { ILogService } from 'platform/log/common/log';
import { Server as ElectronIPCServer } from 'base/parts/ipc/electron-main/ipc.electron';
import { getMachineId } from 'base/node/id';
import { ServiceCollection } from 'platform/instantiation/common/serviceCollection';
import { validatedIpcMain } from 'base/parts/ipc/electron-main/ipcMain';
import { registerContextMenuListener } from 'base/parts/contextmenu/electron-main/contextmenu';
import { restoreOrCreateWindow } from './mainWindow';
import { once } from 'base/common/functional';
import { IUpdateService } from 'platform/update/common/update';
import { SyncDescriptor } from 'platform/instantiation/common/descriptors';
import { UpdateService } from 'platform/update/electron-main/updateService';
import { UpdateChannel } from 'platform/update/common/updateIpc';

export class Application extends Disposable {
  constructor(
    private readonly userEnv: IProcessEnvironment,
    @IInstantiationService private readonly mainInstantiationService: IInstantiationService,
    @ILogService private readonly logService: ILogService,
    @IEnvironmentMainService private readonly environmentMainService: IEnvironmentMainService,
    @ILifecycleMainService private readonly lifecycleMainService: ILifecycleMainService
  ) {
    super();

    this.registerListeners();
  }

  async startup(): Promise<void> {
    this.logService.debug('Starting boss-sec');
    this.logService.debug(`from: ${this.environmentMainService}`);

    // Main process server (electron IPC based)
    const mainProcessElectronServer = new ElectronIPCServer();
    this.lifecycleMainService.onWillShutdown((e) => {
      if (e.reason === ShutdownReason.KILL) {
        // When we go down abnormally, make sure to free up
        // any IPC we accept from other windows to reduce
        // the chance of doing work after we go down. Kill
        // is special in that it does not orderly shutdown
        // windows.
        mainProcessElectronServer.dispose();
      }
    });

    // Resolve unique machine ID
    this.logService.trace('Resolving machine identifier...');
    const machineId = await this.resolveMachineId();
    this.logService.trace(`Resolved machine identifier: ${machineId}`);

    // Services
    const appInstantiationService = await this.initServices(machineId);

    // Init Channels
    appInstantiationService.invokeFunction((accessor) => this.initChannels(accessor, mainProcessElectronServer));

    // Open Windows
    const windows = appInstantiationService.invokeFunction((accessor) => this.openFirstWindow(accessor, mainProcessElectronServer));

    // Post Open Windows Tasks
    appInstantiationService.invokeFunction((accessor) => this.afterWindowOpen(accessor));
  }

  private async initServices(machineId: string): Promise<IInstantiationService> {
    const services = new ServiceCollection();

    services.set(IUpdateService, new SyncDescriptor(UpdateService));
    // Windows
    // services.set(IWindowsMainService, new SyncDescriptor(WindowsMainService, [machineId, this.userEnv]));

    return this.mainInstantiationService.createChild(services);
  }

  private initChannels(accessor: ServicesAccessor, mainProcessElectronServer: ElectronIPCServer): void {
    // Update
    const updateChannel = new UpdateChannel(accessor.get(IUpdateService));
    mainProcessElectronServer.registerChannel('update', updateChannel);
  }

  private openFirstWindow(accessor: ServicesAccessor, mainProcessElectronServer: ElectronIPCServer) {
    restoreOrCreateWindow();
  }

  private async resolveMachineId(): Promise<string> {
    return await getMachineId();
  }

  private registerListeners(): void {
    // We handle uncaught exceptions here to prevent electron from opening a dialog to the user
    setUnexpectedErrorHandler((error) => this.onUnexpectedError(error));
    process.on('uncaughtException', (error) => onUnexpectedError(error));
    process.on('unhandledRejection', (reason: unknown) => onUnexpectedError(reason));

    // Dispose on shutdown
    this.lifecycleMainService.onWillShutdown(() => this.dispose());

    // Contextmenu via IPC support
    registerContextMenuListener();

    // macOS dock activate
    app.on('activate', (event, hasVisibleWindows) => {
      this.logService.trace('app#activate');
    });

    //#endregion

    //#region Bootstrap IPC Handlers

    validatedIpcMain.on('vscode:toggleDevTools', (event) => event.sender.toggleDevTools());
    validatedIpcMain.on('vscode:openDevTools', (event) => event.sender.openDevTools());

    validatedIpcMain.on('vscode:reloadWindow', (event) => event.sender.reload());

    //#endregion
  }

  private onUnexpectedError(error: Error): void {
    this.logService.error(`[uncaught exception in main]: ${error}`);
    if (error.stack) {
      this.logService.error(error.stack);
    }
  }

  private async afterWindowOpen(accessor: ServicesAccessor): Promise<void> {
    // Signal phase: after window open
    this.lifecycleMainService.phase = LifecycleMainPhase.AfterWindowOpen;

    // Observe shared process for errors
    let willShutdown = false;
    once(this.lifecycleMainService.onWillShutdown)(() => (willShutdown = true));

    // Initialize update service
    // const updateService = accessor.get(IUpdateService);
    // if (updateService instanceof Win32UpdateService || updateService instanceof LinuxUpdateService || updateService instanceof DarwinUpdateService) {
    //   await updateService.initialize();
    // }
  }
}
