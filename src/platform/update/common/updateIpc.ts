/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Event } from 'base/common/event';
import { IChannel, IServerChannel } from 'base/parts/ipc/common/ipc';
import { IUpdateService } from 'platform/update/common/update';

export class UpdateChannel implements IServerChannel {

  constructor(private service: IUpdateService) { }

  listen(_: unknown, event: string): Event<any> {
    switch (event) {
      // case 'onStateChange': return this.service.onStateChange;
    }

    throw new Error(`Event not found: ${event}`);
  }

  call(_: unknown, command: string, arg?: any): Promise<any> {
    switch (command) {
      case 'checkForUpdates': return this.service.checkForUpdates(arg);
    }

    throw new Error(`Call not found: ${command}`);
  }
}

export class UpdateChannelClient implements IUpdateService {

  declare readonly _serviceBrand: undefined;

  constructor(private readonly channel: IChannel) { }

  checkForUpdates(explicit: boolean): Promise<void> {
    return this.channel.call('checkForUpdates', explicit);
  }
}
