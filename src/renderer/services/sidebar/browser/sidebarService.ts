/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { createDecorator } from 'platform/instantiation/common/instantiation';

export const ISidebarService = createDecorator<ISidebarService>('sidebarService');

export interface ISidebarService {
  readonly _serviceBrand: undefined;
}
