
import { Color } from "base/common/color";
import { registerSingleton } from "platform/instantiation/common/extensions";
import { IWorkbenchLayoutService, Parts } from "renderer/services/layout/layoutService";
import { IStatusbarService } from "renderer/services/statusbar/common/statusbarService";
import { Part } from "renderer/workbench/part";

export class StatusbarPart extends Part implements IStatusbarService {

  declare readonly _serviceBrand: undefined;

  //#region IView

  readonly minimumWidth: number = 0;
  readonly maximumWidth: number = Number.POSITIVE_INFINITY;
  readonly minimumHeight: number = 22;
  readonly maximumHeight: number = 22;

  //#endregion

  constructor(@IWorkbenchLayoutService layoutService: IWorkbenchLayoutService) {
    super(Parts.STATUSBAR_PART, {}, layoutService);
  }

  createContentArea(parent: HTMLElement): HTMLElement {
    this.element = parent;
    this.element.style.backgroundColor = Color.red.toString();

    return this.element;
  }

  layout(width: number, height: number): void {
    super.layoutContents(width, height);
  }

  toJSON(): object {
    return {
      type: Parts.STATUSBAR_PART
    };
  }
}

registerSingleton(IStatusbarService, StatusbarPart);
