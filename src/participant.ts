import {isUndefined, not} from "./util"
import {Event, EventFactory, isEvent} from "./event"
import {Call} from "./call"


export type Publisher = (publish: Publish, call: Call) => void
export type Subscriber<T = unknown> = (event: Event<T>, call: Call) => Reaction | ReactionPromise
export type Participant = (publish: Publish, call: Call) => Subscriber | null | undefined | void

export type Reaction = void | undefined | null | Event | ReadonlyArray<Event>
export type ReactionPromise = Promise<Reaction> | ReadonlyArray<Promise<Reaction>>

export type Publish = (event: Event<any>) => void
export interface ParticipantGroup {
    readonly close: () => void
    readonly add: (participant: Participant) => void
    readonly remove: (participant: Participant) => void
}

export const filterTo = <T>(eventFactory: EventFactory<T>, subscriber: Subscriber<T>): Subscriber<T> => {
    return (event, call) => isEvent(eventFactory, event) ? subscriber(event, call) : undefined
}
export const subscriber = (subscriber: Subscriber<any>): Participant => () => subscriber
export const publisher = (publisher: Publisher): Participant => publisher



export const createParticipantGroup = (participants: ReadonlyArray<Participant>): ParticipantGroup => {
    let actionsHandlers: ReadonlyArray<Subscriber<any>> = []
    // let initComplete = false
    // let actionQueue: ReadonlyArray<Reaction | Promise<Reaction>> = []
    //
    // const dispatchOrQueue = (action: Reaction | Promise<Reaction>) => {
    //     initComplete ? publish(action, actionsHandlers) : actionQueue = [...actionQueue, action]
    // }
    //
    // actionsHandlers = participants
    //     .map(participant => participant(dispatchOrQueue))
    //     .filter(participants => participants !== undefined) as ReadonlyArray<Subscriber>
    //
    // initComplete = true
    // actionQueue.forEach(dispatchOrQueue)
    // actionQueue = []

    return {
        close: () => actionsHandlers = [],
        add: (participant) => {},
        remove: (participant) => {},
    }
}

const publish = (reaction: Reaction | ReactionPromise, subscribers: ReadonlyArray<Subscriber>) => {
    // if (isPromise(reaction)) {
    //     reaction.then(event => publish(event, subscribers))
    // } else {
    //     toEvents(reaction)
    //         .flatMap(event => subscribers.map(handler => handler(event, call)))
    //         .forEach(reaction => publish(reaction, subscribers))
    // }
}

const toEvents = (reaction: Reaction): ReadonlyArray<Event> => {
    return [reaction].flat().filter(not(isUndefined))
}
