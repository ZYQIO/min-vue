import { h, renderSlots } from '../../lib/guide-mini-vue.esm.js'

window.self = null
export const Foo = {
    name: 'Foo',
    setup() { },
    render() {
        const foo = h("p", {}, "foo")
        console.log('this.$slots', this.$slots);

        const age = 18
        return h('div', {}, [
            renderSlots(this.$slots, 'header', {
                age
            }),
            foo,
            renderSlots(this.$slots, 'footer')
        ])
    }
}
