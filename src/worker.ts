import {Participant, Reaction} from "./participant"
import {isPromise, isUndefined, not} from "./util"

export const webWorkerParticipant = (file: string): Participant => {
    return dispatch => {
        const worker = new Worker(file)
        worker.onmessage = event => dispatch(event.data)
        return event => worker.postMessage(event)
    }
}

export const initWorkerParticipant = (participant: Participant) => {
    const sendMessage = (reaction: Reaction) => self.postMessage(reaction, undefined as any)

    const dispatch = (action: Reaction | Promise<Reaction>) => {
        if (isPromise(action)) {
            action.then(sendMessage)
        } else if (not(isUndefined)(action)) {
            sendMessage(action)
        }
    }

    const handler = participant(dispatch)
    if (handler !== undefined) {
        self.addEventListener("message", (event) => {
            dispatch(handler(event.data))
        }, false)
    }
}
