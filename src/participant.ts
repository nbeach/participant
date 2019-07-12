import {Action} from "./action"

export type Reaction = void | Action | ReadonlyArray<Action>
export type ActionHandler = (action: Action) => Reaction | Promise<Reaction>
export type Dispatch = (action: Action) => void
export type Participant = (dispatch: Dispatch) => ActionHandler | void
export interface ParticipantGroup { readonly close: () => void }

const dispatch = (action: Action, handlers: ReadonlyArray<ActionHandler>) => {
    const results = handlers.map(handler => handler(action))
    const reactions = results.filter(not(isPromise)) as ReadonlyArray<Reaction>
    const reactionPromises = results.filter(isPromise) as ReadonlyArray<Promise<Reaction>>

    reactions
        .map(toActions)
        .flat()
        .forEach(action => dispatch(action, handlers))

    reactionPromises.forEach(promise =>
        promise
            .then(toActions)
            .then(actions => actions.flat().forEach(action => dispatch(action, handlers))),
    )
}

export const createParticipantGroup = (participants: ReadonlyArray<Participant>): ParticipantGroup => {
    let actionsHandlers: ReadonlyArray<ActionHandler> = []
    let initComplete = false
    let actionQueue: ReadonlyArray<Action> = []

    const dispatchOrQueue = (action: Action) => {
        initComplete ? dispatch(action, actionsHandlers) : actionQueue = [...actionQueue, action]
    }

    actionsHandlers = participants
        .map(participant => participant(dispatchOrQueue)) // TODO: delay dispatching of actions until all participants are registered
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

const isPromise = (value: any): value is Promise<any> => {
    return not(isUndefined)(value) && typeof value.then === "function"
}

const not = <T>(func: (param: T) => boolean): (param: T) => boolean => {
    return (param: T) => !func(param)
}

const isUndefined = (value: any): value is undefined => {
    return value === undefined
}
