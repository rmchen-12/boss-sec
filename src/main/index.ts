import { app } from 'electron';
import { Promises } from 'base/common/async';
import { setUnexpectedErrorHandler } from 'base/common/errors';
import { IProcessEnvironment } from 'base/common/platform';
import { EnvironmentMainService, IEnvironmentMainService } from 'platform/environment/electron-main/environmentMainService';
import { SyncDescriptor } from 'platform/instantiation/common/descriptors';
import { IInstantiationService } from 'platform/instantiation/common/instantiation';
import { InstantiationService } from 'platform/instantiation/common/instantiationService';
import { ServiceCollection } from 'platform/instantiation/common/serviceCollection';
import { ILifecycleMainService, LifecycleMainService } from 'platform/lifecycle/electron-main/lifecycleMainService';
import { BufferLogService } from 'platform/log/common/bufferLog';
import { ConsoleMainLogger, getLogLevel, ILogService, MultiplexLogService } from 'platform/log/common/log';
import { Promises as FSPromises } from 'base/node/pfs';
import { Application } from 'main/app';

const isSingleInstance = app.requestSingleInstanceLock();
if (!isSingleInstance) {
  app.quit();
  process.exit(0);
}

class Main {
  main(): void {
    try {
      this.startup();
    } catch (error: any) {
      console.error(error.message);
      app.exit(1);
    }
  }

  private async startup(): Promise<void> {
    // Set the error handler early enough so that we are not getting the
    // default electron error dialog popping up
    setUnexpectedErrorHandler((err) => console.error(err));

    const [instantiationService, instanceEnvironment, environmentMainService] = this.createServices();

    try {
      await this.initServices(environmentMainService);
    } catch (error) {
      throw error;
    }

    await instantiationService.invokeFunction(async (accessor) => {
      const logService = accessor.get(ILogService);
      const lifecycleMainService = accessor.get(ILifecycleMainService);

      return instantiationService.createInstance(Application, instanceEnvironment).startup();
    });
  }

  private createServices(): [IInstantiationService, IProcessEnvironment, IEnvironmentMainService] {
    const services = new ServiceCollection();

    // Environment
    const environmentMainService = new EnvironmentMainService();
    const instanceEnvironment = this.patchEnvironment(environmentMainService); // Patch `process.env` with the instance's environment
    services.set(IEnvironmentMainService, environmentMainService);

    // Log: We need to buffer the spdlog logs until we are sure
    // we are the only instance running, otherwise we'll have concurrent
    // log file access on Windows (https://github.com/microsoft/vscode/issues/41218)
    const bufferLogService = new BufferLogService();
    const logService = new MultiplexLogService([new ConsoleMainLogger(getLogLevel(environmentMainService)), bufferLogService]);
    process.once('exit', () => logService.dispose());
    services.set(ILogService, logService);

    // // Logger
    // services.set(ILoggerService, new LoggerService(logService, fileService));

    // Lifecycle
    services.set(ILifecycleMainService, new SyncDescriptor(LifecycleMainService));

    return [new InstantiationService(services, true), instanceEnvironment, environmentMainService];
  }

  private patchEnvironment(environmentMainService: IEnvironmentMainService): IProcessEnvironment {
    const instanceEnvironment = process.env;

    return instanceEnvironment;
  }

  private initServices(environmentMainService: IEnvironmentMainService): Promise<unknown> {
    return Promises.settled<unknown>([
      // Environment service (paths)
      Promise.all<string | undefined>([environmentMainService.codeCachePath, environmentMainService.backupHome].map((path) => (path ? FSPromises.mkdir(path, { recursive: true }) : undefined))),

      // Configuration service
      // configurationService.initialize(),

      // State service
      // stateMainService.init(),
    ]);
  }
}

// Main Startup
const code = new Main();
code.main();
