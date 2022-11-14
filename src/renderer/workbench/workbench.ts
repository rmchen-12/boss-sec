import { Emitter, setGlobalLeakWarningThreshold } from 'base/common/event';
import { isLinux, isWeb, isWindows } from 'base/common/platform';
import { coalesce } from 'base/common/arrays';
import { isChrome, isFirefox, isSafari } from 'base/browser/browser';
import { Layout } from './layout';
import { BeforeShutdownEvent, ILifecycleService, WillShutdownEvent } from 'renderer/services/lifecycle/common/lifecycle';
import { ServiceCollection } from 'platform/instantiation/common/serviceCollection';
import { IInstantiationService } from 'platform/instantiation/common/instantiation';
import { IWorkbenchLayoutService, Parts, Position, positionToString } from 'renderer/services/layout/layoutService';
import { getSingletonServiceDescriptors } from 'platform/instantiation/common/extensions';
import { InstantiationService } from 'platform/instantiation/common/instantiationService';

export class Workbench extends Layout {
  private readonly _onBeforeShutdown = this._register(new Emitter<BeforeShutdownEvent>());
  readonly onBeforeShutdown = this._onBeforeShutdown.event;

  private readonly _onWillShutdown = this._register(new Emitter<WillShutdownEvent>());
  readonly onWillShutdown = this._onWillShutdown.event;

  private readonly _onShutdown = this._register(new Emitter<void>());
  readonly onShutdown = this._onShutdown.event;

  constructor(parent: HTMLElement, private readonly serviceCollection: ServiceCollection) {
    super(parent);
  }

  startup(): IInstantiationService {
    // Configure emitter leak warning threshold
    setGlobalLeakWarningThreshold(175);

    // Services
    const instantiationService = this.initServices(this.serviceCollection);

    instantiationService.invokeFunction(async (accessor) => {
      const lifecycleService = accessor.get(ILifecycleService);

      // Layout
      this.initLayout(accessor);

      // Register Listeners
      this.registerListeners(lifecycleService);

      // Render Workbench
      this.renderWorkbench();

      // Workbench Layout
      this.createWorkbenchLayout();

      // Layout
      this.layout();
    });

    return instantiationService;
  }

  private registerListeners(lifecycleService: ILifecycleService): void {
    // Lifecycle
    this._register(lifecycleService.onBeforeShutdown((event) => this._onBeforeShutdown.fire(event)));
    this._register(lifecycleService.onWillShutdown((event) => this._onWillShutdown.fire(event)));
    this._register(
      lifecycleService.onShutdown(() => {
        this._onShutdown.fire();
        this.dispose();
      })
    );
  }

  private renderWorkbench(): void {
    // State specific classes
    const platformClass = isWindows ? 'windows' : isLinux ? 'linux' : 'mac';
    const workbenchClasses = coalesce(['monaco-workbench', platformClass, isWeb ? 'web' : undefined, isChrome ? 'chromium' : isFirefox ? 'firefox' : isSafari ? 'safari' : undefined]);

    this.container.classList.add(...workbenchClasses);
    document.body.classList.add(platformClass); // used by our fonts

    if (isWeb) {
      document.body.classList.add('web');
    }

    // Create Parts
    [
      { id: Parts.TITLEBAR_PART, role: 'contentinfo', classes: ['titlebar'] },
      { id: Parts.ACTIVITYBAR_PART, role: 'navigation', classes: ['activitybar', this.state.sideBar.position === Position.LEFT ? 'left' : 'right'] },
      { id: Parts.SIDEBAR_PART, role: 'complementary', classes: ['sidebar', this.state.sideBar.position === Position.LEFT ? 'left' : 'right'] },
      { id: Parts.PANEL_PART, role: 'complementary', classes: ['panel', positionToString(this.state.panel.position)] },
      { id: Parts.STATUSBAR_PART, role: 'status', classes: ['statusbar'] },
    ].forEach(({ id, role, classes }) => {
      const partContainer = this.createPart(id, role, classes);

      this.getPart(id).create(partContainer);
    });

    // Add Workbench to DOM
    this.parent.appendChild(this.container);
  }

  private createPart(id: string, role: string, classes: string[]): HTMLElement {
    const part = document.createElement(role === 'status' ? 'footer' : 'div'); // Use footer element for status bar #98376
    part.classList.add('part', ...classes);
    part.id = id;
    part.setAttribute('role', role);
    if (role === 'status') {
      part.setAttribute('aria-live', 'off');
    }

    return part;
  }

  private initServices(serviceCollection: ServiceCollection): IInstantiationService {
    // Layout Service
    serviceCollection.set(IWorkbenchLayoutService, this);

    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    //
    // NOTE: Please do NOT register services here. Use `registerSingleton()`
    //       from `workbench.common.main.ts` if the service is shared between
    //       native and web or `workbench.sandbox.main.ts` if the service
    //       is native only.
    //
    //       DO NOT add services to `workbench.desktop.main.ts`, always add
    //       to `workbench.sandbox.main.ts` to support our Electron sandbox
    //
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    // All Contributed Services
    const contributedServices = getSingletonServiceDescriptors();
    for (let [id, descriptor] of contributedServices) {
      serviceCollection.set(id, descriptor);
    }

    const instantiationService = new InstantiationService(serviceCollection, true);

    instantiationService.invokeFunction((accessor) => {});

    return instantiationService;
  }
}
