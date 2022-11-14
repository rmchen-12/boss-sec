import { Color } from "base/common/color";
import { registerSingleton } from "platform/instantiation/common/extensions";
import { IWorkbenchLayoutService, Parts } from "renderer/services/layout/layoutService";
import { IPanelService } from "renderer/services/panel/common/panelService";
import { Part } from "renderer/workbench/part";

export class PanelPart extends Part implements IPanelService {

  declare readonly _serviceBrand: undefined;

  //#region IView

  readonly minimumWidth: number = 300;
  readonly maximumWidth: number = Number.POSITIVE_INFINITY;
  readonly minimumHeight: number = 77;
  readonly maximumHeight: number = Number.POSITIVE_INFINITY;

  //#region

  constructor(@IWorkbenchLayoutService layoutService: IWorkbenchLayoutService) {
    super(Parts.PANEL_PART, {}, layoutService);
  }

  createContentArea(parent: HTMLElement): HTMLElement {
    this.element = parent;
    this.element.style.backgroundColor = Color.green.toString();

    return this.element;
  }

  layout(width: number, height: number): void {
    super.layoutContents(width, height);
  }

  toJSON(): object {
    return {
      type: Parts.PANEL_PART
    };
  }
}

registerSingleton(IPanelService, PanelPart);
