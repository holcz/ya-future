import {YaResult, YaFuture} from '../src';

describe('YaResult', () => {
    it('should work with await for success', async () => {
        const aPromise = YaFuture.of<number, string>(() => Promise.resolve(1));
        const result = await aPromise;
        if (YaResult.isSuccess(result)) {
            expect(result.data).toBe(1);
        } else {
            expect(true).toBe(false);
        }
    });

    it('should work with await for error', async () => {
        const aPromise = YaFuture.of<number, string>(() => Promise.reject('Error'));
        const result = await aPromise;
        if (YaResult.isError(result)) {
            expect(result.message).toBe('Error');
        } else {
            expect(true).toBe(false);
        }
    });

    it('should work with map for success', async () => {
        const aPromise = YaFuture.of<number, string>(() => Promise.resolve(1));
        const result = await aPromise
            .map((d) => d + 1)
            .map((d) => YaResult.success(d + 1));
        if (YaResult.isSuccess(result)) {
            expect(result.data).toBe(3);
        } else {
            expect(true).toBe(false);
        }
    });

    it('should work with map for error', async () => {
        const aPromise = YaFuture.of<number, string>(() => Promise.reject('Error'));
        const result = await aPromise
            .map((d) => d + 1)
            .map((d) => YaResult.success(d + 1));
        if (YaResult.isSuccess(result)) {
            expect(true).toBe(false);
        } else {
            expect(result.message).toBe('Error');
        }
    });

    it('should work with flatMap for success', async () => {
        const aPromise = YaFuture.of<number, string>(() => Promise.resolve(1));
        const result = await 
            aPromise
                .flatMap((d) => Promise.resolve(d + 1))
                .flatMap(d => Promise.resolve(YaResult.success(d + 1)))
        if (YaResult.isSuccess(result)) {
            expect(result.data).toBe(3);
        } else {
            expect(true).toBe(false);
        }
    });

    it('should work with flatMap for error', async () => {
        const aPromise = YaFuture.of<number, string>(() => Promise.reject('Error'));
        const result = await 
            aPromise
                .flatMap((d) => Promise.resolve(d + 1))
                .flatMap<number>(() => Promise.reject('Error'))
                .flatMap(d => Promise.resolve(d + 1))
        if (YaResult.isSuccess(result)) {
            expect(true).toBe(false);
        } else {
            expect(result.message).toBe('Error');
        }
    });

    it('should work with map and flatMap for success', async () => {
        const aPromise = YaFuture.of<number, string>(() => Promise.resolve(1));
        const result = await 
            aPromise
                .flatMap((d) => Promise.resolve(d + 1))
                .flatMap(d => Promise.resolve(YaResult.success(d + 1)))
                .map(d => d + 1)
                .map(d => YaResult.success(d + 1))
        if (YaResult.isSuccess(result)) {
            expect(result.data).toBe(5);
        } else {
            expect(true).toBe(false);
        }
    });

    it('should work with map while mapping to an error state', async () => {
        const aPromise = YaFuture.of<number, string>(() => Promise.resolve(1));
        const result = await 
            aPromise
                .map(d => d + 1)
                .map<number>(() => YaResult.error('Error'))
                .map(d => d + 1)
        if (YaResult.isSuccess(result)) {
            expect(true).toBe(false);
        } else {
            expect(result.message).toBe('Error');
        }
    });

    it('should work with flatMap while mapping to an error state', async () => {
        const aPromise = YaFuture.of<number, string>(() => Promise.resolve(1));
        const result = await 
            aPromise
                .flatMap(d => Promise.resolve(d + 1))
                .flatMap<number>(() => Promise.reject('Error'))
                .flatMap(d => Promise.resolve(d + 1))
        if (YaResult.isSuccess(result)) {
            expect(true).toBe(false);
        } else {
            expect(result.message).toBe('Error');
        }
    });

    it('should work with then for map for success', async () => {
        const catchMock = jest.fn();
        const aPromise = YaFuture.of<number, string>(() => Promise.resolve(1));
        const finalResult = await 
            aPromise
                .map((d) => d + 1)
                .map((d) => YaResult.success(d + 1))
                .then((result) => {
                    if (YaResult.isSuccess(result)) {
                        return result.data + 1;
                    } else {
                        return 0;
                    }
                })
                .catch(catchMock);
        expect(finalResult).toBe(4);
        expect(catchMock).not.toBeCalled();
    });

    it('should work with then for map for error', async () => {
        const catchMock = jest.fn();
        const aPromise = YaFuture.of<number, string>(() => Promise.reject('Error'));
        const finalResult = await 
            aPromise
                .map((d) => d + 1)
                .map((d) => YaResult.success(d + 1))
                .then((result) => {
                    if (YaResult.isSuccess(result)) {
                        return result.data + 1;
                    } else {
                        return 0;
                    }
                }).catch(catchMock);
        expect(finalResult).toBe(0);
        expect(catchMock).not.toBeCalled();
    });

    it('should work with then for map when mapping to error state', async () => {
        const catchMock = jest.fn();
        const aPromise = YaFuture.of<number, string>(() => Promise.resolve(1));
        const finalResult = await 
            aPromise
                .map((d) => d + 1)
                .map<number>(() => YaResult.error('Error'))
                .map((d) => d + 1)
                .then((result) => {
                    if (YaResult.isSuccess(result)) {
                        return result.data + 1;
                    } else {
                        return 0;
                    }
                })
                .catch(catchMock);
        expect(finalResult).toBe(0);
        expect(catchMock).not.toBeCalled();
    });

    it('should work with then for flatMap to error state', async () => {
        const catchMock = jest.fn();
        const aPromise = YaFuture.of<number, string>(() => Promise.resolve(1));
        const finalResult = await 
            aPromise
                .flatMap((d) => Promise.resolve(d + 1))
                .flatMap<number>(() => Promise.reject('Error'))
                .flatMap((d) => Promise.resolve(d + 1))
                .then((result) => {
                    if (YaResult.isSuccess(result)) {
                        return result.data + 1;
                    } else {
                        return 0;
                    }
                })
                .catch(catchMock);
        expect(finalResult).toBe(0);
        expect(catchMock).not.toBeCalled();
    });
});