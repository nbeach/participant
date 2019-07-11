import {asParticipant, createParticipantGroup, Dispatch, Participant} from "./participant"
import {Action} from "./action"
import {expect} from "chai"

const sleep = (time: number) => new Promise(resolve => setTimeout(resolve, time))

describe("Participant", () => {

    describe(createParticipantGroup.name, () => {
        let dispatchFunction: Dispatch | null = null
        let receivedActions: ReadonlyArray<Action> = []

        const dispatchHijacker: Participant = (dispatch) => { dispatchFunction = dispatch}
        const actionAccumulator = asParticipant((action) => {
            if (action.type !== "INITIATING") {
                receivedActions = [...receivedActions, action]
            }
        })

        beforeEach(() => {
            dispatchFunction = null
            receivedActions = []
        })

        it("dispatch actions to participants", () => {
            createParticipantGroup([
                dispatchHijacker,
                actionAccumulator,
            ])

            dispatchFunction!({ type: "TEST" })
            expect(receivedActions).to.eql([{ type: "TEST" }])
        })

        describe("dispatches the result returned by action handlers when it is a", () => {

            it("action", async () => {
                createParticipantGroup([
                    dispatchHijacker,
                    actionAccumulator,
                    asParticipant((action) => action.type === "INITIATING" ? { type: "GENERATED_ACTION" } : undefined),
                ])

                dispatchFunction!({ type: "INITIATING" })
                expect(receivedActions.filter(action => action.type !== "INITIATING")).to.eql([{ type: "GENERATED_ACTION" }])
            })

            it("arrays of actions", async () => {
                createParticipantGroup([
                    dispatchHijacker,
                    actionAccumulator,
                    asParticipant((action) => action.type === "INITIATING" ? [{ type: "ACTION_1" }, { type: "ACTION_2" }] : undefined),
                ])

                dispatchFunction!({ type: "INITIATING" })
                expect(receivedActions).to.eql([{ type: "ACTION_1" }, { type: "ACTION_2" }])
            })

            it("promise for an action", async () => {
                createParticipantGroup([
                    dispatchHijacker,
                    actionAccumulator,
                    asParticipant((action) => action.type === "INITIATING" ? Promise.resolve({ type: "GENERATED_ACTION" }) : undefined),
                ])

                dispatchFunction!({ type: "INITIATING" })
                await sleep(1)
                expect(receivedActions).to.eql([{ type: "GENERATED_ACTION" }])
            })

            it("promise for an array of actions", async () => {
                createParticipantGroup([
                    dispatchHijacker,
                    actionAccumulator,
                    asParticipant((action) => action.type === "INITIATING" ? Promise.resolve([{ type: "ACTION_1" }, { type: "ACTION_2" }]) : undefined),
                ])

                dispatchFunction!({ type: "INITIATING" })
                await sleep(1)
                expect(receivedActions).to.eql([{ type: "ACTION_1" }, { type: "ACTION_2" }])
            })

        })

        describe("does not dispatch the result returned by action handlers when it is a", () => {

            it("undefined", async () => {
                createParticipantGroup([
                    dispatchHijacker,
                    actionAccumulator,
                    asParticipant((action) => undefined),
                ])

                dispatchFunction!({ type: "INITIATING" })
                await sleep(1)
                expect(receivedActions).to.eql([])
            })

            it("promise for undefined", async () => {
                createParticipantGroup([
                    dispatchHijacker,
                    actionAccumulator,
                    asParticipant((action) => action.type === "INITIATING" ? Promise.resolve(undefined) : undefined),
                ])

                dispatchFunction!({ type: "INITIATING" })
                await sleep(1)
                expect(receivedActions).to.eql([])
            })

        })

        describe("when the group is closed", () => {

            it("no longer dispatches message to participants", async () => {
                const group = createParticipantGroup([
                    dispatchHijacker,
                    actionAccumulator,
                ])

                group.close()
                dispatchFunction!({ type: "TEST" })
                await sleep(1)
                expect(receivedActions).to.eql([])
            })

        })

    })
})
