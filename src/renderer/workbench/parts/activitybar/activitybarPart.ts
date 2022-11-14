
import { registerSingleton } from "platform/instantiation/common/extensions";
import { Color } from 'base/common/color';
import { IWorkbenchLayoutService, Parts } from "renderer/services/layout/layoutService";
import { Part } from "renderer/workbench/part";
import { IActivityBarService } from "renderer/services/activityBar/common/activityBarService";

export class ActivitybarPart extends Part implements IActivityBarService {

  declare readonly _serviceBrand: undefined;

  //#region IView

  readonly minimumWidth: number = 48;
  readonly maximumWidth: number = 48;
  readonly minimumHeight: number = 0;
  readonly maximumHeight: number = Number.POSITIVE_INFINITY;

  //#endregion

  constructor(@IWorkbenchLayoutService layoutService: IWorkbenchLayoutService) {
    super(Parts.ACTIVITYBAR_PART, {}, layoutService);
  }

  createContentArea(parent: HTMLElement): HTMLElement {
    this.element = parent;
    this.element.style.backgroundColor = Color.blue.toString();

    return this.element;
  }

  layout(width: number, height: number): void {
    super.layoutContents(width, height);
  }

  toJSON(): object {
    return {
      type: Parts.ACTIVITYBAR_PART
    };
  }
}

registerSingleton(IActivityBarService, ActivitybarPart);
