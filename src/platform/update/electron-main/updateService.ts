import { ILogService } from 'platform/log/common/log';
import { IUpdateService } from 'platform/update/common/update';

export class UpdateService implements IUpdateService {

  declare readonly _serviceBrand: undefined;

  constructor(@ILogService protected logService: ILogService) { }

  async checkForUpdates(explicit: boolean) {
    this.logService.info('update#checkForUpdates');
  }
}
