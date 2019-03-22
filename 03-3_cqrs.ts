import {Counter, CountDownState, ConterStateKeys} from './counter'
import { Observable, Observer, NEVER, Subject, pipe, timer, combineLatest, merge} from 'rxjs'; 
import { map, mapTo, withLatestFrom,tap, distinctUntilChanged, shareReplay, startWith, scan, pluck, switchMap} from 'rxjs/operators';

// EXERCISE DESCRIPTION ==============================

/**
 * Use `ConterStateKeys` for property names.
 * Explort the counterUI API by typing `counterUI.` somewhere. ;)
 * 
 * Implement all features of the counter: 
 * 1. Start, pause the counter. Then restart the counter with 0 (+)  
 * 2. Start it again from paused number (++) 
 * 3. If Set to button is clicked set counter value to input value while counting (+++)
 * 4. Reset to initial state if reset button is clicked (+)
 * 5. If count up button is clicked count up, if count down button is clicked count down  (+)
 * 6. Change interval if input tickSpeed input changes (++)
 * 7. Change count up if input countDiff changes (++)
 * 8. Take care of rendering execution and other performance optimisations as well as refactoring (+)
 */

// ==================================================================


// == CONSTANTS ===========================================================
// Setup conutDown state
const initialConterState: CountDownState = {
  isTicking: false, 
  count: 0, 
  countUp: true, 
  tickSpeed: 200, 
  countDiff:1
};

// Init CountDown counterUI
const counterUI = new Counter(
  document.body,
  {
    initialSetTo: initialConterState.count + 10,
    initialTickSpeed: initialConterState.tickSpeed,
    initialCountDiff: initialConterState.countDiff,
  }
);

// = BASE OBSERVABLES  ====================================================
// == SOURCE OBSERVABLES ==================================================
// === STATE OBSERVABLES ==================================================
const counterCommands$ = merge(
  counterUI.btnStart$.pipe(mapTo({isTicking: true})), 
  counterUI.btnPause$.pipe(mapTo({isTicking: false})),
  counterUI.btnSetTo$.pipe(map(n => ({count: n}))),
  counterUI.btnUp$.pipe(mapTo({countUp: true})),
  counterUI.btnDown$.pipe(mapTo({countUp: false})),
  counterUI.btnReset$.pipe(mapTo({...initialConterState})),
  counterUI.inputTickSpeed$.pipe(map ( n => ({tickSpeed: n}))),
  counterUI.inputCountDiff$.pipe(map ( n => ({countDiff: n})))
);

const counterState$: Observable<CountDownState> = counterCommands$
  .pipe(
    startWith(initialConterState),
    scan( (counterState: CountDownState, command): CountDownState => ( {...counterState, ...command} ) ),
    shareReplay(1)
  );

// JUST FOR TESTING
counterState$
  .subscribe(console.log);

// === INTERACTION OBSERVABLES ============================================
// == INTERMEDIATE OBSERVABLES ============================================
// = SIDE EFFECTS =========================================================

// WRONG SOLUTION !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// Never maintain state by mutating variables outside of streams

let actualCount = initialConterState.count;

// == UI INPUTS ===========================================================
const renderCountChangeFromTick$ = merge(
  counterUI.btnStart$.pipe(mapTo(true)),
  counterUI.btnPause$.pipe(mapTo(false)),
)
  .pipe(
    switchMap(isTicking => isTicking ? timer(0, initialConterState.tickSpeed): NEVER),
    tap(_ => ++actualCount),
    tap(_ => counterUI.renderCounterValue(actualCount))
  );

const renderCountChangeFromSetTo$ = counterUI.btnSetTo$
  .pipe(
    tap(n => actualCount = n),
    tap(_ => counterUI.renderCounterValue(actualCount))
  );

// == UI OUTPUTS ==========================================================



// == SUBSCRIPTION ========================================================

merge(
  // Input side effect
  renderCountChangeFromTick$,
  // Outputs side effect
  renderCountChangeFromSetTo$
)
.subscribe();

// = HELPER ===============================================================
// = CUSTOM OPERATORS =====================================================
// == CREATION METHODS ====================================================
// == OPERATORS ===========================================================
