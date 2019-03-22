import './style.scss';

import { Subject, Observable, fromEvent} from 'rxjs'; 
import { mapTo, map, withLatestFrom, startWith, shareReplay} from 'rxjs/operators';

export interface CounterConfig {
  initialSetTo?: number;
  initialTickSpeed?: number;
  initialCountDiff?: number;
}

export interface CountDownState {
 isTicking: boolean;
 count: number; 
 countUp: boolean;
 tickSpeed: number;
 countDiff:number;
}

export type PartialCountDownState = 
  { isTicking: boolean } | 
  { count: number } | 
  { countUp: boolean } |
  { tickSpeed: number } |
  { countDiff:number};

export enum ConterStateKeys {
 isTicking = 'isTicking',
 count = 'count',
 countUp = 'countUp',
 tickSpeed = 'tickSpeed',
 countDiff = 'countDiff'
}

export enum ActionNames {
  Start,
  Pause,
  Reset,
  SetTo,
  Down,
  Up,
  TickSpeed,
  CountDiff
}

enum ElementIds {
  TimerDisplay = 'timer-display',
  BtnStart = 'btn-start',
  BtnPause = 'btn-pause',
  BtnUp = 'btn-up',
  BtnDown = 'btn-down',
  BtnReset = 'btn-reset',
  BtnSetTo = 'btn-set-to',
  InputSetTo = 'set-to-input',
  InputTickSpeed = 'tick-speed-input',
  InputCountDiff = 'count-diff-input'
}

export class Counter {
  private initialSetTo: number;
  private initialTickSpeed: number;
  private initialCountDiff: number;

  private viewHtml = (): string =>`
    <div id="${ElementIds.TimerDisplay}" class="countdownHolder">
      <p style="font-size:40px;">
      Press Start <br/>
      <small>
        Have fun! :) <br/>
        <small>
          read the comments
        </small>
      </small>
      </p>
    </div>

    <button type="button" id="${ElementIds.BtnStart}">
      Start
    </button>

    <button type="button" id="${ElementIds.BtnPause}">
      Pause
    </button>

    <br/>

    <button type="button" id="${ElementIds.BtnSetTo}">
      Set To
    </button>
    <input id="${ElementIds.InputSetTo}" style="width:40px" type="number" min=0 value="${this.initialSetTo}"/>
    <!-- I'm sorry for this, but I was lazy.. :) -->
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

   <button type="button" id="${ElementIds.BtnReset}">
      Reset
    </button>

  <br/>

    <button type="button" id="${ElementIds.BtnUp}">
      Count Up
    </button>

    <button type="submit" type="button" id="${ElementIds.BtnDown}">
      Count Down
    </button>

  <br/>

    <label>
      Tick Speed
    </label>
    <input id="${ElementIds.InputTickSpeed}" style="width:60px" type="number" min=0 value="${this.initialTickSpeed}"/>
 
<!-- I'm sorry for this, but I was lazy.. :) -->
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    
    <label>
      Count Diff   
    </label>
    <input id="${ElementIds.InputCountDiff}" style="width:60px" type="number" min=0 value="${this.initialCountDiff}"/>
    `;

  private display: HTMLParagraphElement;
  
  public renderCounterValue(count: number) {
     if(this.display) {
      this.display.innerHTML = count.toString()
          .split('')
          .map(this.getDigit)
          .join('');
     }
  
}

  private setToInput: HTMLInputElement;
  public renderSetToInputValue = (value: string) => {
    if(this.setToInput) {
      this.setToInput.value = value.toString();
    }
  }
  
  
  private tickSpeedInput;
  public renderTickSpeedInputValue = (value: number): void => {
    if(this.tickSpeedInput) {
      this.tickSpeedInput.value = value.toString();
    }
  }
  
  private countDiffInput;
  public renderCountDiffInputValue = (value: number): void => {
    if(this.countDiffInput) {
      this.countDiffInput.value = value.toString();
    }
  }

  public btnStart$: Observable<ActionNames>;
  public btnPause$: Observable<ActionNames>;
  public btnUp$: Observable<ActionNames>;
  public btnDown$: Observable<ActionNames>;
  public btnReset$: Observable<ActionNames>;
  public btnSetTo$: Observable<number>;

  public inputTickSpeed$: Observable<number>;
  public inputCountDiff$: Observable<number>;
  public inputSetTo$: Observable<number>

  constructor(parent: HTMLElement, config?: CounterConfig) {
    this.initialTickSpeed = config && config.initialTickSpeed || 1000;
    this.initialSetTo = config && config.initialSetTo || 0;
    this.initialCountDiff = config && config.initialCountDiff || 1;

    this.init(parent);
  }

  private init(parent: HTMLElement) {
    parent.innerHTML = parent.innerHTML + this.viewHtml();
    
    // getElements
    this.display = document.getElementById(ElementIds.TimerDisplay) as HTMLParagraphElement;
    this.setToInput = document.getElementById(ElementIds.InputSetTo) as HTMLInputElement; 
    this.tickSpeedInput = document.getElementById(ElementIds.InputTickSpeed) as HTMLInputElement;
    this.countDiffInput = document.getElementById(ElementIds.InputCountDiff) as HTMLInputElement;

    // setup observables
    this.btnStart$ = getCommandObservableByElem(ElementIds.BtnStart, 'click', ActionNames.Start);
    this.btnPause$ = getCommandObservableByElem(ElementIds.BtnPause, 'click', ActionNames.Pause);
    this.btnUp$ = getCommandObservableByElem(ElementIds.BtnUp, 'click',ActionNames.Up);
    this.btnDown$ = getCommandObservableByElem(ElementIds.BtnDown, 'click', ActionNames.Down);
    this.btnReset$ = getCommandObservableByElem(ElementIds.BtnReset, 'click', ActionNames.Reset);
    
    this.inputSetTo$ = getValueObservable(ElementIds.InputSetTo, 'input').pipe(startWith(this.initialSetTo));
    this.inputTickSpeed$ = getValueObservable(ElementIds.InputTickSpeed, 'input').pipe(startWith(this.initialTickSpeed));
    this.inputCountDiff$ = getValueObservable(ElementIds.InputCountDiff, 'input').pipe(startWith(this.initialCountDiff));

    this.btnSetTo$ = getCommandObservableByElem(ElementIds.BtnSetTo, 'click', ActionNames.SetTo)
      .pipe(withLatestFrom(this.inputSetTo$, (_, i$) => i$));
  
  } 


private getDigit(d): string {
  return `<span class="position">
            <span class="digit static">
              ${d}
            </span>
          </span>`;
}

private getDigitDivider(): string {
  return '<span class="countDiv"></span>'
}

  
}

function getCommandObservableByElem(elemId: string, eventName: string, command: ActionNames) {
  return fromEvent(document.getElementById(elemId), eventName).pipe(mapTo(command));
}

function getValueObservable (elemId: string, eventName: string): Observable<number> {
  const elem = document.getElementById(elemId);
  return fromEvent(elem, eventName)
    .pipe(
      map(v => v.target.value),
      map(v => parseInt(v, 10)),
      shareReplay(1)
    );
}
