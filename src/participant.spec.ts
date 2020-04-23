import {createParticipantGroup, Participant, Publish, subscriber} from "./participant"
import {expect} from "chai"
import {Event} from "./event"

const sleep = (time: number) => new Promise(resolve => setTimeout(resolve, time))

describe("Participant", () => {

    describe(createParticipantGroup.name, () => {
        let dispatchFunction: Publish | null = null
        let receivedEvents: ReadonlyArray<Event> = []

        const dispatchCapturer: Participant = (dispatch) => { dispatchFunction = dispatch}
        const eventAccumulator = subscriber((event) => {
            if (event.type !== "INITIATING") {
                receivedEvents = [...receivedEvents, event]
            }
        })

        beforeEach(() => {
            dispatchFunction = null
            receivedEvents = []
        })

        it("dispatch events to participants", () => {
            createParticipantGroup([
                dispatchCapturer,
                eventAccumulator,
            ])

            dispatchFunction!({ type: "TEST" })
            expect(receivedEvents).to.eql([{ type: "TEST" }])
        })

        describe("dispatches the result returned by event handlers when it is a", () => {

            it("event", async () => {
                createParticipantGroup([
                    dispatchCapturer,
                    eventAccumulator,
                    subscriber((event) => event.type === "INITIATING" ? { type: "GENERATED_EVENT" } : undefined),
                ])

                dispatchFunction!({ type: "INITIATING" })
                expect(receivedEvents.filter(event => event.type !== "INITIATING")).to.eql([{ type: "GENERATED_EVENT" }])
            })

            it("arrays of events", async () => {
                createParticipantGroup([
                    dispatchCapturer,
                    eventAccumulator,
                    subscriber((event) => event.type === "INITIATING" ? [{ type: "EVENT_1" }, { type: "EVENT_2" }] : undefined),
                ])

                dispatchFunction!({ type: "INITIATING" })
                expect(receivedEvents).to.eql([{ type: "EVENT_1" }, { type: "EVENT_2" }])
            })

            it("promise for an event", async () => {
                createParticipantGroup([
                    dispatchCapturer,
                    eventAccumulator,
                    subscriber((event) => event.type === "INITIATING" ? Promise.resolve({ type: "GENERATED_EVENT" }) : undefined),
                ])

                dispatchFunction!({ type: "INITIATING" })
                await sleep(1)
                expect(receivedEvents).to.eql([{ type: "GENERATED_EVENT" }])
            })

            it("promise for an array of events", async () => {
                createParticipantGroup([
                    dispatchCapturer,
                    eventAccumulator,
                    subscriber((event) => event.type === "INITIATING" ? Promise.resolve([{ type: "EVENT_1" }, { type: "EVENT_2" }]) : undefined),
                ])

                dispatchFunction!({ type: "INITIATING" })
                await sleep(1)
                expect(receivedEvents).to.eql([{ type: "EVENT_1" }, { type: "EVENT_2" }])
            })

        })

        describe("does not dispatch the result returned by event handlers when it is a", () => {

            it("undefined", async () => {
                createParticipantGroup([
                    dispatchCapturer,
                    eventAccumulator,
                    subscriber((event) => undefined),
                ])

                dispatchFunction!({ type: "INITIATING" })
                await sleep(1)
                expect(receivedEvents).to.eql([])
            })

            it("promise for undefined", async () => {
                createParticipantGroup([
                    dispatchCapturer,
                    eventAccumulator,
                    subscriber((event) => event.type === "INITIATING" ? Promise.resolve(undefined) : undefined),
                ])

                dispatchFunction!({ type: "INITIATING" })
                await sleep(1)
                expect(receivedEvents).to.eql([])
            })

        })

        describe("when the group is closed", () => {

            it("no longer dispatches message to participants", async () => {
                const group = createParticipantGroup([
                    dispatchCapturer,
                    eventAccumulator,
                ])

                group.close()
                dispatchFunction!({ type: "TEST" })
                await sleep(1)
                expect(receivedEvents).to.eql([])
            })

        })

    })
})
