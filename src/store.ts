
import {ActionResponder, asParticipant, createParticipantGroup, Dispatch, Participant} from "./participant"
import {Action} from "./action"

type Reducer<S, E> = (state: S, event: E) => S

const createStateStore = <T>(initialState: T, reducer: Reducer<T, Action>): ActionResponder => {
    let state = initialState

    return (event: Action) => {
        state = reducer(state, event)
        return { type: "STATE_CHANGED", state }
    }
}

const asyncResolver: ActionResponder = async (event: Action) => {
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
    appUserInterface,
])
