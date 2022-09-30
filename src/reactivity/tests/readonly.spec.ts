import { readonly } from '../reactive'


describe("reactive", () => {
    it('happy path', () => {
        // not set
        const original = { foo: 1, bar: { baz: 2 } };
        const wrapped = readonly(original)
        expect(wrapped).not.toBe(original)
        expect(wrapped.foo).toBe(1)
        expect(wrapped.bar.baz).toBe(2)
    })

    it('warn the call set', () => {
        // console.warn()
        // mock()
        console.warn = jest.fn()
        const user = readonly({
            age: 10
        })
        user.age = 11

        expect(console.warn).toBeCalled()
    })
})

