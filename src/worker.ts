import {Participant, Reaction, ReactionPromise} from "./participant"
import {isPromise, isUndefined, not} from "./util"

export const webWorkerParticipant = (worker: Worker): Participant => {
    return (publish) => {
        worker.onmessage = event => publish(event.data)
        return event => worker.postMessage(event)
    }
}

export const initWorkerParticipant = (participant: Participant) => {
    const sendMessage = (reaction: Reaction) => self.postMessage(reaction, undefined as any)

    const publish = (reaction: Reaction | ReactionPromise) => {
        if (isPromise(reaction)) {
            reaction.then(sendMessage)
        } else if (not(isUndefined)(reaction)) {
            sendMessage(reaction)
        }
    }

    const handler = participant(publish, call)
    if (handler !== undefined) {
        self.addEventListener("message", (event) => {
            publish(handler(event.data))
        }, false)
    }
}

