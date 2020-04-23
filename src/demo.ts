import {createParticipantGroup, filterTo, subscriber} from "./participant"
import {createEventFactory} from "./event"
import {webWorkerParticipant} from "./worker"
import {reactParticipant, reduxParticipant, webSocketParticipant} from "./prebuilt";

const deleteRequested = createEventFactory<{ readonly id: string }>("DELETE_REQUESTED")
const deleteResult = createEventFactory<{ readonly id: string, readonly success: boolean }>("DELETE_REQUESTED")

const deleteRequestedSubscribe = filterTo(deleteRequested, async ({id}, call) => {
    const success = await Promise.resolve(id).then(id => id === "123")
    return deleteResult({ id, success })
})
const store = null

const viewStateChanged = createEventFactory<{ readonly state: string }>("VIEW_STATE_CHANGED")
const viewState = reduxParticipant(store, viewStateChanged)
const AppComponent = null as any
const rootElement = null as any
const defaultState = null as any
const uiParticipant = reactParticipant(rootElement, AppComponent, viewStateChanged, defaultState)

const group = createParticipantGroup([
    viewState,
    uiParticipant,
    subscriber(deleteRequestedSubscribe),
    webSocketParticipant(new WebSocket("ws://localhost")),
    webWorkerParticipant(new Worker("foo.js")),
])
