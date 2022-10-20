import { h } from '../../lib/guide-mini-vue.esm.js'

export const App = {

    render() {
        return h('div', {
            id: "root",
            class: ["red", "hard"]
        },
            // 'hi ' + this.msg
            // 'hi, min-vue'
            [h('p', { class: "red" }, 'hi'), h('p', { class: 'blue' }, 'text...')]
        )
    },

    setup() {
        return {
            msg: 'min-vue'
        }
    }
}
