export interface EventType { readonly type: string }
export type Event<T = unknown> = EventType & T

export interface EventFactory<T> {
    (parameters: T): Event<T>
    readonly type: string
}

export const createEventFactory = <T = {}>(type: string): EventFactory<T> => {
    const factory = (parameters: T) => ({type, ...parameters})
    factory.type = type
    return factory
}

export const isEvent = <T>(factory: EventFactory<T>, event: Event): event is Event<T> => {
    return event.type === factory.type
}
