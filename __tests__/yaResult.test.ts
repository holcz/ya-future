import { YaResult } from "../src";

const yaForTest = (type: 'success' | 'error'): YaResult<number> => {
    if (type === 'success') {
        return YaResult.success(1);
    } else {
        return YaResult.error('Error');
    }
}

describe('YaResult', () => {
    it('should be able to branch on isSuccess in a type safe manner', () => {
        const asyncResult = YaResult.fn(() => 1);

        if (YaResult.isSuccess(asyncResult)) {
            expect(asyncResult.data).toBe(1);
        } else {
            expect(true).toBe(false);
        }

        const asyncResult2 = YaResult.fn<number>(() => {
            throw new Error('Error');
        });

        if (YaResult.isSuccess(asyncResult2)) {
            expect(true).toBe(false);
        } else {
            expect(asyncResult2.message).toBe('Error');
        }
    });

    it('should be able to branch on isError in a type safe manner', () => {
        const asyncResult = YaResult.fn(() => 1);

        if (YaResult.isError(asyncResult)) {
            expect(true).toBe(false);
        } else {
            expect(asyncResult.data).toBe(1);
        }

        const asyncResult2 = YaResult.fn<number>(() => {
            throw new Error('Error');
        });

        if (YaResult.isError(asyncResult2)) {
            expect(asyncResult2.message).toBe('Error');
        } else {
            expect(true).toBe(false);
        }
    });

    it('should be able to map on success', () => {
        const success = yaForTest('success');

        const mapped = success.map((d) => d + 1);
        if (YaResult.isSuccess(mapped)) {
            expect(mapped.data).toBe(2);
        } else {
            expect(true).toBe(false);
        }
    });

    it('should be able to map on error', () => {
        const error = yaForTest('error');

        const mapped = error.map((d) => d + 1);
        if (YaResult.isError(mapped)) {
            expect(mapped.message).toBe('Error');
        } else {
            expect(true).toBe(false);
        }
    });

    it('should be able to flatMap on success', () => {
        const success = yaForTest('success');

        const mapped = success.flatMap((d) => YaResult.success(d + 1));
        if (YaResult.isSuccess(mapped)) {
            expect(mapped.data).toBe(2);
        } else {
            expect(true).toBe(false);
        }
    });

    it('should be able to flatMap on error', () => {
        const error = yaForTest('error');

        const mapped = error.flatMap((d) => YaResult.success(d + 1));
        if (YaResult.isError(mapped)) {
            expect(mapped.message).toBe('Error');
        } else {
            expect(true).toBe(false);
        }
    });

    it('should be able to getOrElse on success', () => {
        const success = yaForTest('success');

        const mapped = success.getOrElse(2);
        expect(mapped).toBe(1);
    });

    it('should be able to getOrElse on error', () => {
        const error = yaForTest('error');

        const mapped = error.getOrElse(2);
        expect(mapped).toBe(2);
    });

    it('should be able to getOrThrow on success', () => {
        const success = yaForTest('success');

        const mapped = success.getOrThrow();
        expect(mapped).toBe(1);
    });

    it('should be able to getOrThrow on error', () => {
        const error = yaForTest('error');

        expect(() => error.getOrThrow()).toThrowError('Error');
    });

    it('should be able to recover on success', () => {
        const success = yaForTest('success');

        const mapped = success.recover(() => 2);
        if (YaResult.isSuccess(mapped)) {
            expect(mapped.data).toBe(1);
        } else {
            expect(true).toBe(false);
        }
    });

    it('should be able to recover on error', () => {
        const error = yaForTest('error');

        const mapped = error.recover(() => 2);
        if (YaResult.isSuccess(mapped)) {
            expect(mapped.data).toBe(2);
        } else {
            expect(true).toBe(false);
        }
    });

    it('should be able to recoverWith on success', () => {
        const success = yaForTest('success');

        const mapped = success.recoverWith(() => YaResult.success(2));
        if (YaResult.isSuccess(mapped)) {
            expect(mapped.data).toBe(1);
        } else {
            expect(true).toBe(false);
        }
    });

    it('should be able to recoverWith on error', () => {
        const error = yaForTest('error');

        const mapped = error.recoverWith(() => YaResult.success(2));
        if (YaResult.isSuccess(mapped)) {
            expect(mapped.data).toBe(2);
        } else {
            expect(true).toBe(false);
        }
    });

    it('should be able to tap on success', () => {
        const success = yaForTest('success');
        const tapMock = jest.fn();

        const mapped = success.tap(tapMock);
        if (YaResult.isSuccess(mapped)) {
            expect(mapped.data).toBe(1);
            expect(tapMock).toBeCalled();
        } else {
            expect(true).toBe(false);
        }
    });

    it('should be able to tap on error', () => {
        const error = yaForTest('error');
        const tapMock = jest.fn();

        const mapped = error.tap(tapMock);
        if (YaResult.isError(mapped)) {
            expect(mapped.message).toBe('Error');
            expect(tapMock).not.toBeCalled();
        } else {
            expect(true).toBe(false);
        }
    });

    it('should be able to tapError on success', () => {
        const success = yaForTest('success');
        const tapMock = jest.fn();

        const mapped = success.tapError(tapMock);
        if (YaResult.isSuccess(mapped)) {
            expect(mapped.data).toBe(1);
            expect(tapMock).not.toBeCalled();
        } else {
            expect(true).toBe(false);
        }
    });

    it('should be able to tapError on error', () => {
        const error = yaForTest('error');
        const tapMock = jest.fn();

        const mapped = error.tapError(tapMock);
        if (YaResult.isError(mapped)) {
            expect(mapped.message).toBe('Error');
            expect(tapMock).toBeCalled();
        } else {
            expect(true).toBe(false);
        }
    });

    it('should be able to tapBoth on success', () => {
        const success = yaForTest('success');
        const tapMock = jest.fn();

        const mapped = success.tapBoth(tapMock);
        if (YaResult.isSuccess(mapped)) {
            expect(mapped.data).toBe(1);
            expect(tapMock).toBeCalledWith(1, undefined);
        } else {
            expect(true).toBe(false);
        }
    });

    it('should be able to tapBoth on error', () => {
        const error = YaResult.error('Error', 2);
        const tapMock = jest.fn();

        const mapped = error.tapBoth(tapMock);
        if (YaResult.isError(mapped)) {
            expect(mapped.message).toBe('Error');
            expect(tapMock).toBeCalledWith(undefined, 2);
        } else {
            expect(true).toBe(false);
        }
    });
});