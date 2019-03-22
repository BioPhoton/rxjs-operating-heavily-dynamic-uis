import {Counter, CountDownState, ConterStateKeys} from './counter'
import { merge, timer, NEVER} from 'rxjs'; 
import { mapTo, switchMap, scan} from 'rxjs/operators';

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

const initialConterState: CountDownState = {
  isTicking: false, 
  count: 0, 
  countUp: true, 
  tickSpeed: 200, 
  countDiff:1
};

const counterUI = new Counter(
  document.body,
  {
    initialSetTo: initialConterState.count + 10,
    initialTickSpeed: initialConterState.tickSpeed,
    initialCountDiff: initialConterState.countDiff,
  }
);

merge(
  counterUI.btnStart$.pipe(mapTo(true)),
  counterUI.btnPause$.pipe(mapTo(false)),
)
.pipe(
  switchMap(isTicking => (isTicking) ? timer(0, initialConterState.tickSpeed): NEVER),
  scan((conut: number, _) =>  ++conut)
)
.subscribe(
  n => counterUI.renderCounterValue(n)
);
