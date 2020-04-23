import {expect} from "chai"
import {createEventFactory, isEvent} from "./event";

describe("Event", () => {

    describe(createEventFactory.name, () => {

        it("creates factory methods for events", () => {
            interface TestEvent {
                readonly message: string
            }
            const factory = createEventFactory<{ readonly message: string }>("TEST_EVENT")
            const EVENT: TestEvent = factory({ message: "hello" })
            expect(EVENT).to.eql({ type: "TEST_EVENT", message: "hello" })
        })

    })

    describe(isEvent.name, () => {

        it("returns true when an event if of the specified type", () => {
            interface TestEvent {}
            const testEvent = createEventFactory<TestEvent>("TEST_EVENT")
            const event = testEvent({})
            expect(isEvent(testEvent, event)).to.be.true
        })

        it("returns false when an event is not of the specified type", () => {
            interface TestEventA {}
            interface TestEventB {}
            const testEventA = createEventFactory<TestEventA>("TEST_EVENT_A")
            const testEventB = createEventFactory<TestEventB>("TEST_EVENT_B")

            const event = testEventA({})
            expect(isEvent(testEventB, event)).to.be.false
        })

    })

})
