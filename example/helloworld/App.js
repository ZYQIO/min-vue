import { h, createTextVNode } from '../../lib/guide-mini-vue.esm.js'
import { Foo } from './Foo.js'

window.self = null
export const App = {
    name: 'App',
    render() {
        window.self = this

        const foo = h(Foo, {}, {
            header: ({ age }) => [
                h("p", {}, "123 ," + age),
                createTextVNode("你说的发上来看电脑")
            ],
            footer: () => h("p", {}, "456"),
        })
        // const foo = h(Foo, {}, h("p", {}, '123'))

        return h("div", {}, [h("div", {}, "App"), foo])
    },

    setup() {
        return {
            msg: 'min-vue-hh'
        }
    }
}
