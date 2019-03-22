import {Counter, CountDownState, ConterStateKeys, PartialCountDownState} from './counter'
import { Observable, Observer, NEVER, Subject, pipe, timer, combineLatest, merge, UnaryFunction} from 'rxjs'; 
import { map, mapTo, withLatestFrom,tap, distinctUntilChanged, shareReplay,distinctUntilKeyChanged, startWith, scan, pluck, switchMap} from 'rxjs/operators';

const initialConterState: CountDownState = {
  count: 0, 
  isTicking: false, 
  tickSpeed: 200, 
  countUp: true, 
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

const programmaticCommandSubject = new Subject<PartialCountDownState>();
const counterCommands$ = merge(
  counterUI.btnStart$.pipe(mapTo({isTicking: true})), 
  counterUI.btnPause$.pipe(mapTo({isTicking: false})),
  counterUI.btnSetTo$.pipe(map(n => ({count: n}))),
  counterUI.btnUp$.pipe(mapTo({countUp: true})),
  counterUI.btnDown$.pipe(mapTo({countUp: false})),
  counterUI.btnReset$.pipe(mapTo({...initialConterState})),
  counterUI.inputTickSpeed$.pipe(map ( n => ({tickSpeed: n}))),
  counterUI.inputCountDiff$.pipe(map ( n => ({countDiff: n}))),
  programmaticCommandSubject.asObservable()
);

const counterState$: Observable<CountDownState> = counterCommands$
  .pipe(
    startWith(initialConterState),
    scan( (counterState: CountDownState, command): CountDownState => ( {...counterState, ...command} ) ),
    shareReplay(1)
  );

const count$ = counterState$.pipe(pluck<CountDownState, number>(ConterStateKeys.count));
const isTicking$ = counterState$.pipe(queryChange<CountDownState, boolean>(ConterStateKeys.isTicking));
const tickSpeed$ = counterState$.pipe(queryChange<CountDownState, number>(ConterStateKeys.tickSpeed));
const countDiff$ = counterState$.pipe(queryChange<CountDownState, number>(ConterStateKeys.countDiff));

const counterUpdateTrigger$ = combineLatest([isTicking$, tickSpeed$])
  .pipe(switchMap(([isTicking, tickSpeed]) => isTicking ? timer(0, tickSpeed) : NEVER));

const renderCountChange$ = count$.pipe(tap(n => counterUI.renderCounterValue(n)));
const renderTickSpeedChange$ = tickSpeed$.pipe(tap(n => counterUI.renderTickSpeedInputValue(n)));
const renderCountDiffChange$ = countDiff$.pipe(tap(n => counterUI.renderCountDiffInputValue(n)));
const renderSetToChange$ = counterUI.btnReset$.pipe(tap(_ => { counterUI.renderSetToInputValue('10');}));
const commandFromTick$ = counterUpdateTrigger$
  .pipe(
     withLatestFrom(counterState$, (_, counterState) => ({
       [ConterStateKeys.count]: counterState.count,
       [ConterStateKeys.countUp]: counterState.countUp,
       [ConterStateKeys.countDiff]: counterState.countDiff
     }) ),
     tap(({count, countUp, countDiff}) => programmaticCommandSubject.next( {count: count + countDiff * (countUp ? 1 : -1)}) )
  );

merge(
  renderCountChange$,
  renderTickSpeedChange$,
  renderCountDiffChange$,
  renderSetToChange$,
  commandFromTick$
).subscribe();

function queryChange<T, I>(key: string): UnaryFunction<Observable<T>, Observable<I>> {
  return  pipe(pluck<T, I>(key), distinctUntilChanged<I>() );
}

