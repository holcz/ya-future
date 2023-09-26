# Yet Another Future

Opinionated Future implementation inspired by the Scala Future and the Mondadic approach, but for TS devs with FP mindset

## Examples
```
// Example 1
const result = await 
    YaFuture.of<number, string>(() => Promise.resolve(1));
        .flatMap((d) => Promise.resolve(d + 1))
        .map(d => d + 1)
        .flatMap(d => Promise.resolve(YaResult.success(d + 1)))
        .map(d => YaResult.success(d + 1))

if (YaResult.isSuccess(result)) {
    expect(result.data).toBe(5);
} else {
    expect(true).toBe(false);
}

// Example 2
const result = await 
    YaFuture.of<number, string>(() => Promise.resolve(1))
        .flatMap(d => Promise.resolve(d + 1))
        .flatMap<number>(() => Promise.reject('Error'))
        .flatMap(d => Promise.resolve(d + 1))
if (YaResult.isSuccess(result)) {
    expect(true).toBe(false);
} else {
    expect(result.message).toBe('Error');
}
```
