import {ActionHandler, asParticipant, createParticipantGroup, Dispatch, Participant} from "./participant"
import {Action} from "./action"
import {webWorkerParticipant} from "./worker"

type Reducer<S, E> = (state: S, event: E) => S

const createStateStore = <T>(initialState: T, reducer: Reducer<T, Action>): ActionHandler => {
    let state = initialState

    return (event: Action) => {
        state = reducer(state, event)
        return { type: "STATE_CHANGED", state }
    }
}

const asyncResolver: ActionHandler = async (event: Action) => {
    const async = await Promise.resolve({})
    return { type: "DATA_LOADED", async }
}

const appUserInterface: Participant = (dispatch) => {
    return (event: Action) => {

    }
}

const group = createParticipantGroup([
    asParticipant(createStateStore({}, (state, event) => ({}))),
    (dispatch) => asyncResolver,
    webWorkerParticipant(new Worker("foo.js")),
    appUserInterface,
])
