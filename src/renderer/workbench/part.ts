/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import './media/part.css';
import { Dimension, size, IDimension } from 'base/browser/dom';
import { ISerializableView, IViewSize } from 'base/browser/ui/grid/grid';
import { Event, Emitter } from 'base/common/event';
import { assertIsDefined } from 'base/common/types';
import { Component } from 'renderer/common/component';
import { IWorkbenchLayoutService } from 'renderer/services/layout/layoutService';

export interface IPartOptions {
  hasTitle?: boolean;
  borderWidth?: () => number;
}

export interface ILayoutContentResult {
  titleSize: IDimension;
  contentSize: IDimension;
}

/**
 * Parts are layed out in the workbench and have their own layout that
 * arranges an optional title and mandatory content area to show content.
 */
export abstract class Part extends Component implements ISerializableView {

  private _dimension: Dimension | undefined;
  get dimension(): Dimension | undefined { return this._dimension; }

  protected _onDidVisibilityChange = this._register(new Emitter<boolean>());
  readonly onDidVisibilityChange = this._onDidVisibilityChange.event;

  private parent: HTMLElement | undefined;
  private titleArea: HTMLElement | undefined;
  private contentArea: HTMLElement | undefined;
  private partLayout: PartLayout | undefined;

  constructor(
    id: string,
    private options: IPartOptions,
    protected readonly layoutService: IWorkbenchLayoutService
  ) {
    super(id);

    layoutService.registerPart(this);
  }

  /**
   * Note: Clients should not call this method, the workbench calls this
   * method. Calling it otherwise may result in unexpected behavior.
   *
   * Called to create title and content area of the part.
   */
  create(parent: HTMLElement, options?: object): void {
    this.parent = parent;
    this.titleArea = this.createTitleArea(parent, options);
    this.contentArea = this.createContentArea(parent, options);

    this.partLayout = new PartLayout(this.options, this.contentArea);
  }

  /**
   * Returns the overall part container.
   */
  getContainer(): HTMLElement | undefined {
    return this.parent;
  }

  /**
   * Subclasses override to provide a title area implementation.
   */
  protected createTitleArea(parent: HTMLElement, options?: object): HTMLElement | undefined {
    return undefined;
  }

  /**
   * Returns the title area container.
   */
  protected getTitleArea(): HTMLElement | undefined {
    return this.titleArea;
  }

  /**
   * Subclasses override to provide a content area implementation.
   */
  protected createContentArea(parent: HTMLElement, options?: object): HTMLElement | undefined {
    return undefined;
  }

  /**
   * Returns the content area container.
   */
  protected getContentArea(): HTMLElement | undefined {
    return this.contentArea;
  }

  /**
   * Layout title and content area in the given dimension.
   */
  protected layoutContents(width: number, height: number): ILayoutContentResult {
    const partLayout = assertIsDefined(this.partLayout);

    return partLayout.layout(width, height);
  }

  //#region ISerializableView

  private _onDidChange = this._register(new Emitter<IViewSize | undefined>());
  get onDidChange(): Event<IViewSize | undefined> { return this._onDidChange.event; }

  element!: HTMLElement;

  abstract minimumWidth: number;
  abstract maximumWidth: number;
  abstract minimumHeight: number;
  abstract maximumHeight: number;

  layout(width: number, height: number): void {
    this._dimension = new Dimension(width, height);
  }

  setVisible(visible: boolean) {
    this._onDidVisibilityChange.fire(visible);
  }

  abstract toJSON(): object;

  //#endregion
}

class PartLayout {

  private static readonly TITLE_HEIGHT = 35;

  constructor(private options: IPartOptions, private contentArea: HTMLElement | undefined) { }

  layout(width: number, height: number): ILayoutContentResult {

    // Title Size: Width (Fill), Height (Variable)
    let titleSize: Dimension;
    if (this.options && this.options.hasTitle) {
      titleSize = new Dimension(width, Math.min(height, PartLayout.TITLE_HEIGHT));
    } else {
      titleSize = Dimension.None;
    }

    let contentWidth = width;
    if (this.options && typeof this.options.borderWidth === 'function') {
      contentWidth -= this.options.borderWidth(); // adjust for border size
    }

    // Content Size: Width (Fill), Height (Variable)
    const contentSize = new Dimension(contentWidth, height - titleSize.height);

    // Content
    if (this.contentArea) {
      size(this.contentArea, contentSize.width, contentSize.height);
    }

    return { titleSize, contentSize };
  }
}
