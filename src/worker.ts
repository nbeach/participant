import {Participant} from "./participant"
import {Action} from "./action"

export const webWorkerParticipant = (file: string): Participant => {
    return dispatch => {
        const worker = new Worker(file)
        worker.onmessage = event => dispatch(event.data)
        return event => worker.postMessage(event)
    }
}

export const initWorkerParticipant = (participant: Participant) => {
    const dispatch = (action: Action) => self.postMessage(action, "*")
    const handler = participant(dispatch)
    if (handler !== undefined) {
        self.addEventListener("message", (event) => handler(event.data), false)
    }
}
