import { Bubbles } from 'base/browser/ui/bubble/bubbles';
import { Color } from 'base/common/color';
import { registerSingleton } from 'platform/instantiation/common/extensions';
import { IWorkbenchLayoutService, Parts } from 'renderer/services/layout/layoutService';
import { ITitleService } from 'renderer/services/title/common/titleService';
import { Part } from 'renderer/workbench/part';

export class TitlebarPart extends Part implements ITitleService {
  declare readonly _serviceBrand: undefined;

  //#region IView

  readonly minimumWidth: number = 0;
  readonly maximumWidth: number = Number.POSITIVE_INFINITY;
  get minimumHeight(): number {
    return 200;
  }
  get maximumHeight(): number {
    return this.minimumHeight;
  }

  //#endregion

  constructor(@IWorkbenchLayoutService layoutService: IWorkbenchLayoutService) {
    super(Parts.TITLEBAR_PART, {}, layoutService);
  }

  createContentArea(parent: HTMLElement): HTMLElement {
    this.element = parent;
    this.element.style.backgroundColor = Color.lightgrey.toString();

    const chatWindow = ((window as any).chatWindow = new Bubbles(this.element, 'chatWindow'));

    chatWindow.talk(
      // pass your JSON/JavaScript object to `.talk()` function where
      // you define how the conversation between the bot and user will go
      {
        // "ice" (as in "breaking the ice") is a required conversation object
        // that maps the first thing the bot will say to the user
        ice: {
          // "says" defines an array of sequential bubbles
          // that the bot will produce
          says: ['Hey!', 'Can I have a banana?'],

          // "reply" is an array of possible options the user can pick from
          // as a reply
          reply: [
            {
              question: '🍌', // label for the reply option
              answer: 'banana', // key for the next conversation object
            },
          ],
        }, // end required "ice" conversation object

        // another conversation object that can be queued from within
        // any other conversation object, including itself
        banana: {
          says: ['Thank you!', 'Can I have another banana?'],
          reply: [
            {
              question: '🍌🍌',
              answer: 'banana',
            },
          ],
        }, // end conversation object
      } // end conversation object
    );

    return this.element;
  }

  layout(width: number, height: number): void {
    super.layoutContents(width, height);
  }

  toJSON(): object {
    return {
      type: Parts.TITLEBAR_PART,
    };
  }
}

registerSingleton(ITitleService, TitlebarPart);
