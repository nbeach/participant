import {Action} from "./action"

export type Reaction = void | Action | ReadonlyArray<Action>
export type ActionHandler = (event: Action) => Reaction | Promise<Reaction>
export type Dispatch = <T extends Action>(event: T) => void
export type Participant = (dispatch: Dispatch) => ActionHandler | void
export interface ParticipantGroup { readonly close: () => void }

export const createParticipantGroup = (participants: ReadonlyArray<Participant>): ParticipantGroup => {
    let actionsHandlers: ReadonlyArray<ActionHandler> = []
    const dispatch = (event: Action) => {
        const results = actionsHandlers.map(handler => handler(event))
        const reactions = results.filter(not(isPromise)) as ReadonlyArray<Reaction>
        const reactionPromises = results.filter(isPromise) as ReadonlyArray<Promise<Reaction>>

        reactions
            .map(toActions)
            .flat()
            .forEach(dispatch)

        reactionPromises.forEach(promise => promise.then(reaction =>
            toActions(reaction)
                .flat()
                .forEach(dispatch),
        ))

    }

    actionsHandlers = participants
        .map(participant => participant(dispatch))
        .filter(participants => participants !== undefined) as ReadonlyArray<ActionHandler>

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



