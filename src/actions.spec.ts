import {createActionFactory, isAction} from "./action"
import {expect} from "chai"

describe("Action", () => {

    describe(createActionFactory.name, () => {

        it("creates factory methods for actions", () => {
            interface TestAction {
                readonly message: string
            }
            const factory = createActionFactory<TestAction>("TEST_ACTION")
            const action: TestAction = factory({ message: "hello" })
            expect(action).to.eql({ type: "TEST_ACTION", message: "hello" })
        })

    })

    describe(isAction.name, () => {

        it("returns true when an action if of the specified type", () => {
            interface TestAction {}
            const testAction = createActionFactory<TestAction>("TEST_ACTION")
            const action = testAction({})
            expect(isAction(testAction, action)).to.be.true
        })

        it("returns false when an action is not of the specified type", () => {
            interface TestActionA {}
            interface TestActionB {}
            const testActionA = createActionFactory<TestActionA>("TEST_ACTION_A")
            const testActionB = createActionFactory<TestActionB>("TEST_ACTION_B")

            const action = testActionA({})
            expect(isAction(testActionB, action)).to.be.false
        })

    })

})
