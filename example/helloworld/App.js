import { h } from '../../lib/guide-mini-vue.esm.js'
import { Foo } from './Foo.js'

window.self = null
export const App = {
    name: 'App',
    render() {
        window.self = this

        return h('div',
            {
                id: "root",
                class: ["red", "hard"],
                onClick() {
                    console.log('click');
                },
                onMousedown() {
                    console.log('mousedown');
                }
            },
            [h('div', {}, 'hi, ' + this.msg), h(Foo, { count: 1 })]
            // 'hi ' + this.msg
            // 'hi, min-vue'
            // [h('p', { class: "red" }, 'hi'), h('p', { class: 'blue' }, 'text...')]
        )
    },

    setup() {
        return {
            msg: 'min-vue-hh'
        }
    }
}
