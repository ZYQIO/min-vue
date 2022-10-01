import { isReadonly, readonly, isProxy } from '../reactive'


describe("reactive", () => {
    it('shoule make nested valus readonly', () => {
        // not set
        const original = { foo: 1, bar: { baz: 2 } };
        const wrapped = readonly(original)
        expect(wrapped).not.toBe(original)
        expect(wrapped.foo).toBe(1)
        expect(isReadonly(wrapped)).toBe(true)
        expect(isReadonly(original)).toBe(false)
        expect(isReadonly(wrapped.bar)).toBe(true)
        expect(isReadonly(original.bar)).toBe(false)
        expect(wrapped.bar.baz).toBe(2)
        expect(isProxy(wrapped)).toBe(true)
    })

    it('shoule call console.warn when set', () => {
        console.warn = jest.fn()
        const user = readonly({
            age: 10
        })
        user.age = 11

        expect(console.warn).toHaveBeenCalled()
    })
})

