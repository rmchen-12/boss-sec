import * as path from 'path';
import * as os from 'os';

export const getUserDataPath = () => {
  let appDataPath = process.env['VSCODE_APPDATA'];

  switch (process.platform) {
    case 'win32':
      appDataPath = process.env['APPDATA'];
      if (!appDataPath) {
        const userProfile = process.env['USERPROFILE'];
        if (typeof userProfile !== 'string') {
          throw new Error('Windows: Unexpected undefined %USERPROFILE% environment variable');
        }

        appDataPath = path.join(userProfile, 'AppData', 'Roaming');
      }
      break;
    case 'darwin':
      appDataPath = path.join(os.homedir(), 'Library', 'Application Support');
      break;
    case 'linux':
      appDataPath = process.env['XDG_CONFIG_HOME'] || path.join(os.homedir(), '.config');
      break;
    default:
      throw new Error('Platform not supported');
  }

  /** TODO: */
  return path.join(appDataPath, 'vite-electron');
};
