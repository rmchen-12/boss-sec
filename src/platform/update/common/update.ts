/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { createDecorator } from 'platform/instantiation/common/instantiation';

export const IUpdateService = createDecorator<IUpdateService>('updateService');

export interface IUpdateService {
  readonly _serviceBrand: undefined;

  checkForUpdates(explicit: boolean): Promise<void>;
}
