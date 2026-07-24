export type Deferred<T> = PromiseWithResolvers<T>;

export const createDeferred = <T>(): Deferred<T> => Promise.withResolvers<T>();
