import { Color } from "base/common/color";
import { registerSingleton } from "platform/instantiation/common/extensions";
import { IWorkbenchLayoutService, Parts } from "renderer/services/layout/layoutService";
import { ISidebarService } from "renderer/services/sidebar/browser/sidebarService";
import { Part } from "renderer/workbench/part";

export class SidebarPart extends Part implements ISidebarService {

  declare readonly _serviceBrand: undefined;

  //#region IView

  readonly minimumWidth: number = 170;
  readonly maximumWidth: number = Number.POSITIVE_INFINITY;
  readonly minimumHeight: number = 0;
  readonly maximumHeight: number = Number.POSITIVE_INFINITY;

  //#endregion

  constructor(@IWorkbenchLayoutService layoutService: IWorkbenchLayoutService) {
    super(Parts.SIDEBAR_PART, {}, layoutService);
  }

  createContentArea(parent: HTMLElement): HTMLElement {
    this.element = parent;
    this.element.style.backgroundColor = Color.cyan.toString();

    return this.element;
  }

  layout(width: number, height: number): void {
    super.layoutContents(width, height);
  }

  toJSON(): object {
    return {
      type: Parts.SIDEBAR_PART
    };
  }
}

registerSingleton(ISidebarService, SidebarPart);
