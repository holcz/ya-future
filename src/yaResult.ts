interface YaResultFuncs<T, E> {
	identity: () => YaResult<T, E>;
	map: <U>(fn: (data: T) => U) => YaResult<U, E>;
	flatMap: <U>(fn: (data: T) => YaResult<U, E>) => YaResult<U, E>;
	getOrThrow: () => T;
	getOrElse: (d: T) => T;
	recover: (fn: (e?: E | undefined) => T) => YaResult<T, E>;
	recoverWith: (fn: (e?: E | undefined) => YaResult<T, E>) => YaResult<T, E>;
	tap: (fn: (data: T) => void) => YaResult<T, E>;
	tapError: (fn: (error: E | undefined) => void) => YaResult<T, E>;
	tapBoth: (fn: (data: T | undefined, error: E | undefined) => void) => YaResult<T, E>;
}

export class YaErrorResult<T, E = undefined> extends Error implements YaResultFuncs<T, E> {
	readonly resultType: 'error' = 'error' as const;
	readonly payload: E | undefined;
	readonly error: unknown | undefined;

  constructor(message: string, payload?: E, error?: unknown) {
	super(message);
	this.name = 'AsyncError';
	this.payload = payload;
	this.error = error;
  }
  
  identity: () => YaResult<T, E> = () => YaResult.error(this.message, this.payload);
  
  map: <U>(fn: (data: T) => U) => YaResult<U, E> = () => YaResult.error(this.message, this.payload);
  
  flatMap: <U>(fn: (data: T) => YaResult<U, E>) => YaResult<U, E> = () => YaResult.error(this.message, this.payload);
  
  getOrThrow: () => T = () => { throw new Error(this.message); };
  
  getOrElse: <T>(d: T) => T = (d) => d;
  
  recover: <U>(fn: (e: E | undefined) => U) => YaResult<U, E> = (fn) => YaResult.success(fn(this.payload));
  
  recoverWith: <U>(fn: (e: E | undefined) => YaResult<U, E>) => YaResult<U, E> = (fn) => fn(this.payload);
  
  tap: (fn: (data: T) => void) => YaResult<T, E> = () => YaResult.error(this.message, this.payload);
  
  tapError: (fn: (error: E | undefined) => void) => YaResult<T, E> = (fn) => {
	fn(this.payload);
	return YaResult.error(this.message, this.payload);
  }

  tapBoth: (fn: (data: T | undefined, error: E | undefined) => void) => YaResult<T, E> = (fn) => {
	fn(undefined, this.payload as E);
	return YaResult.error(this.message, this.payload);
  }
}


class YaSuccessResult<T, E = never> implements YaResultFuncs<T, E> {
    readonly resultType: 'success' = 'success' as const;

    constructor(public readonly data: T) {}
	
	identity: () => YaResult<T, E> = () => YaResult.success(this.data);
	
	map: <U>(fn: (data: T) => U) => YaResult<U, E> = (fn) => YaResult.success(fn(this.data));
	
	flatMap: <U>(fn: (data: T) => YaResult<U, E>) => YaResult<U, E> = (fn) => fn(this.data);
	
	getOrThrow: () => T = () => this.data;
	
	getOrElse: (d: T) => T = () => this.data;
	
	recover: (fn: (e?: E | undefined) => T) => YaResult<T, E> = () => YaResult.success(this.data);
	
	recoverWith: (fn: (e: E) => YaResult<T, E>) => YaResult<T, E> = () => YaResult.success(this.data);
	
	mapError: <U>(fn: (error: E) => U) => YaResult<T, U> = () => YaResult.success(this.data);
	
	tap: (fn: (data: T) => void) => YaResult<T, E> = (fn) => {
		fn(this.data);
		return YaResult.success(this.data);
	};
	
	tapError: (fn: (error: E) => void) => YaResult<T, E> = () => YaResult.success(this.data);
	
	tapBoth: (fn: (data: T | undefined, error: E | undefined) => void) => YaResult<T, E> = (fn) => {
		fn(this.data, undefined);
		return YaResult.success(this.data);
	};

}

export type YaResult<T, E = unknown> = YaErrorResult<T, E> | YaSuccessResult<T>;

export const YaResult = {
	success: <T>(data: T) => new YaSuccessResult(data),
	error: <E, T = never>(message: string, payload?: E | undefined, error?: unknown) => {
		return new YaErrorResult<T, E>(message, payload, error);
	},
	exception: <T, E = unknown>(e: unknown, message?: string, payload?: E): YaResult<T, E> => {
		const errorMessage = e instanceof Error ? e.message : message ?? 'Error';
		return new YaErrorResult<T, E>(errorMessage, payload, e);
	},
	fn: <T, E = unknown>(fn: () => T): YaResult<T, E> => {
		try {
			const d = fn();
			return YaResult.success(d);
		} catch (e) {
			return YaResult.error('Error');
		}
	},
	isSuccess: <T, E>(result: YaResult<T, E>): result is YaSuccessResult<T> => result.resultType === 'success',
	isError: <T, E>(result: YaResult<T, E>): result is YaErrorResult<T, E> => result.resultType === 'error',
} as const;

export const isYaResult = <T, E>(result: T | YaResult<T, E>): result is YaResult<T, E> => {
	return result instanceof YaSuccessResult || result instanceof YaErrorResult;
}

