# STATE MANAGEMENT

1. Create a `command$` observable of all inputs (counterUI.btnStart$, counterUI.btnPause$, counterUI.inputTickSpeed, etc..)
   and map them to state updates i.e. counterUI.btnStart$.pipe(mapTo({isTicking: true}))
2. Create a `state$` observable. 
   Start with initialConterState, use scan to merge updates from command$ in.
   Use shareReplay(1) to retrieve the last value emitted whenever you subscribe.
3. Subscribe to state$ and use console.log to test it.

# RENDERING

1. Create a `renderCountValue$` observable in section "SIDE EFFECTS" - "Input". 
   Use `tap` to execute counterUI.renderDisplayText(). To optimize performance use the `queryChange` custom operator.
2. Place the new observable in the "SUBSCRUPTIONS" section under "Input" to test it.

# TIMER

1. Create a `timerProcessChange$` observable in the section "OBSERVABLES".
2. Use the `state$` to get the isTicking value. Use the "switchMap NEVER" pattern from before to start a timer. 
3. Create a `programmaticCommands` subject in section "STATE" - "Command"
4. Create a `handleTimerProcessChange$` observable in section "SIDE EFFECTS" - "Outputs". 
   Use the `tap` operator to call `next()` on `programmaticCommands` 

# BONUS

Explore the counterUI API by typing `counterUI.` somewhere in the index.ts file. ;)

Implement all the features of the counter: 
- Start, pause the counter. Then restart the counter (+)  
- Start it again from the paused number (++) 
- If Set to button is clicked set counter value to input value while counting (+++)
- Reset to initial state if the reset button is clicked (+)
- Is count up button is clicked count up  (+)
- Is count down button is clicked count down (+)
- Change interval if input tickSpeed input changes (++)
- Change count up if input countDiff changes (++)
- Take care of rendering execution and other performance optimizations (+)



Some structure recommendations


// == CONSTANTS ===========================================================
// = BASE OBSERVABLES  ====================================================
// == SOURCE OBSERVABLES ==================================================
// === STATE OBSERVABLES ==================================================
// === INTERACTION OBSERVABLES ============================================
// == INTERMEDIATE OBSERVABLES ============================================
// = SIDE EFFECTS =========================================================
// == UI INPUTS ===========================================================
// == UI OUTPUTS ==========================================================
// == SUBSCRIPTION ========================================================
// === INPUTs =============================================================
// === OUTPUTS ============================================================
// = HELPER ===============================================================
// = CUSTOM OPERATORS =====================================================
// == CREATION METHODS ====================================================
// == OPERATORS ===========================================================
