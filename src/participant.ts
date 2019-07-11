import {Action} from "./action"

export type ActionResponder = (event: Action) => void | Action | ReadonlyArray<Action> | Promise<void | Action | ReadonlyArray<Action>> | ReadonlyArray<Promise<Action | void>>
export type Dispatch = <T extends Action>(event: T) => void
export type Participant = ((dispatch: Dispatch) => ActionResponder)
export interface ParticipantGroup { readonly close: () => void }

export const createParticipantGroup = (participants: ReadonlyArray<Participant>): ParticipantGroup => {
    let eventHandlers: ReadonlyArray<ActionResponder> = []
    const dispatch = (event: Action) => eventHandlers.forEach(handler => handler(event))
    eventHandlers = participants.map(participant => participant(dispatch))

    return {
        close: () => eventHandlers = [],
    }
}

export const asParticipant = (handler: ActionResponder): Participant => (dispatch) => handler

