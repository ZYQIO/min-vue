import { h } from '../../lib/guide-mini-vue.esm.js'
import { Foo } from './Foo.js'

window.self = null
export const App = {
    name: 'App',
    render() {
        window.self = this

        return h("div", {}, [h("div", {}, "App"), h(Foo, {
            onAdd(a, b) {
                console.log('父级....', a, b);
            },
            // add-foo  -->  onAddFoo
            onAddFoo() {
                console.log('11111111111');
            }
        })])
    },

    setup() {
        return {
            msg: 'min-vue-hh'
        }
    }
}
