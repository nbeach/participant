import {Action} from "./action"
import {isPromise, isUndefined, not} from "./util"

export type Reaction = void | Action | ReadonlyArray<Action>
export type ActionHandler = (action: Action) => Reaction | Promise<Reaction>
export type Dispatch = (action: Reaction | Promise<Reaction>) => void
export type Participant = (dispatch: Dispatch) => ActionHandler | void
export interface ParticipantGroup { readonly close: () => void }

const dispatch = (reaction: Reaction | Promise<Reaction>, handlers: ReadonlyArray<ActionHandler>) => {
    if (isPromise(reaction)) {
        reaction.then(action => dispatch(action, handlers))
    } else {
        toActions(reaction)
            .flatMap(action => handlers.map(handler => handler(action)))
            .forEach(reaction => dispatch(reaction, handlers))
    }
}

export const createParticipantGroup = (participants: ReadonlyArray<Participant>): ParticipantGroup => {
    let actionsHandlers: ReadonlyArray<ActionHandler> = []
    let initComplete = false
    let actionQueue: ReadonlyArray<Reaction | Promise<Reaction>> = []

    const dispatchOrQueue = (action: Reaction | Promise<Reaction>) => {
        initComplete ? dispatch(action, actionsHandlers) : actionQueue = [...actionQueue, action]
    }

    actionsHandlers = participants
        .map(participant => participant(dispatchOrQueue))
        .filter(participants => participants !== undefined) as ReadonlyArray<ActionHandler>

    initComplete = true
    actionQueue.forEach(dispatchOrQueue)
    actionQueue = []

    return {
        close: () => actionsHandlers = [],
    }
}

export const asParticipant = (handler: ActionHandler): Participant => (dispatch) => handler

const toActions = (reaction: Reaction): ReadonlyArray<Action> => {
    return [reaction].flat().filter(not(isUndefined))
}

