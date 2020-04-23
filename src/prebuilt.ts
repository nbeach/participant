import {Participant} from "./participant"
import {EventFactory} from "./event"

export const reduxParticipant = <T>(store: any, stateChangeActionFactory: EventFactory<{ readonly state: T}>): Participant => {
    return publish => {
        store.subscribe((newState: any) => publish(stateChangeActionFactory({ newState })))
        return event => store.dispatch(event)
    }
}

export const reactParticipant = <T>(rootElement: Element, rootComponent: any, stateEventActionFactory: EventFactory<{ readonly state: T}>, defaultState: T): Participant => {
    return (publish, call) => {
        return event => {}
    }
}
export const webSocketParticipant = <T>(socket: WebSocket): Participant => {
    return (publish, call) => {
        return event => {}
    }
}
