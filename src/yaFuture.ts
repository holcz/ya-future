import { YaResult, isYaResult } from "./yaResult";

export class YaFuture<T, E> implements Promise<YaResult<T, E>> {
    readonly [Symbol.toStringTag]!: string;

    private _isResolved: boolean;
    private _isRejected: boolean;
    private readonly _promise: Promise<YaResult<T, E>>;
    private _resolve?: (value: YaResult<T, E> | PromiseLike<YaResult<T, E>>) => void;
    private _reject?: (reason?: unknown) => void;

    private constructor(
        executor: (
            resolve: (value: YaResult<T, E> | PromiseLike<YaResult<T, E>>) => void,
            reject: (reason?: unknown) => void,
        ) => void
    ) {
        this._isResolved = false;
        this._isRejected = false;
        this._promise = new Promise<YaResult<T, E>>((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;

            const onResolve = (value: YaResult<T, E> | PromiseLike<YaResult<T, E>>): void => {
                if (this._isResolved || this._isRejected) {
                    return;
                }
                this._isResolved = true;
                this._resolve?.(value);
            };

            const onReject = (reason?: unknown): void => {
                if (this._isResolved || this._isRejected) {
                    return;
                }
                this._isRejected = true;
                this._reject?.(reason);
            };

            return executor(onResolve, onReject);
        });
    }

    public then<TResult1 = YaResult<T, E>, TResult2 = never>(
        onFulfilled?: ((value: YaResult<T, E>) => TResult1 | PromiseLike<TResult1>) | null,
        onRejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
    ): Promise<TResult1 | TResult2> {
        return this._promise.then(onFulfilled, onRejected);
    }

    public catch<TResult = never>(
        onRejected?: ((reason: unknown) => TResult | PromiseLike<TResult>) | null
    ): Promise<YaResult<T, E> | TResult> {
        return this._promise.catch(onRejected);
    }

    public finally(onFinally?: (() => void) | null): Promise<YaResult<T, E>> {
        return this._promise.finally(onFinally);
    }

    public map<U>(fn: (data: T) => U | YaResult<U, E>, errorMessage?: string): YaFuture<U, E> {
        return new YaFuture<U, E>((resolve) => {
            this.then((result) => {
                if (YaResult.isSuccess(result)) {
                    const d = fn(result.data);
                    if (isYaResult(d)) {
                        resolve(d);
                    } else {
                        resolve(YaResult.success(d));
                    }
                } else {
                    resolve(YaResult.error(result.message, result.payload, result.error));
                }
            }).catch((e) => {
                const message = errorMessage ?? e instanceof Error ? e.message : 'Error';
                resolve(YaResult.error(message, undefined as unknown as E, e));
            });
        });
    }

    public flatMap<U>(fn: (data: T) => Promise<U | YaResult<U, E>>, errorMessage?: string): YaFuture<U, E> {
        return new YaFuture<U, E>((resolve) => {
            this.then((result) => {
                if (YaResult.isSuccess(result)) {
                    fn(result.data)
                        .then((d) => {
                            if (isYaResult(d)) {
                                resolve(d);
                            } else {
                                resolve(YaResult.success(d));
                            }
                        })
                        .catch((e) => resolve(YaResult.exception(e)));
                } else {
                    resolve(YaResult.error(result.message, result.payload, result.error));
                }
            }).catch((e) => {
                const message = errorMessage ?? e instanceof Error ? e.message : 'Error';
                resolve(YaResult.error(message, undefined as unknown as E, e));
            });
        });
    }

    public static of<T, E>(fn: () => Promise<T>, errorMessage?: string, errorPayload?: E): YaFuture<T, E> {
        return new YaFuture((resolve) => {
            fn()
                .then((d) => resolve(YaResult.success(d)))
                .catch((e) => {
                    const message = errorMessage ?? e instanceof Error ? e.message : 'Error';
                    resolve(YaResult.error(message, errorPayload, e));
                });
        })
    }

    public static ofP<T, E>(p: Promise<T>, errorMessage?: string, errorPayload?: E): YaFuture<T, E> {
        return YaFuture.of(() => p, errorMessage, errorPayload);
    }

}
