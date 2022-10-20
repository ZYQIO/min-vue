import { h } from '../../lib/guide-mini-vue.esm.js'

window.self = null
export const Foo = {
    name: 'Foo',
    setup(props, { emit }) {
        // props.count
        props.count++
        console.log(props);

        const emitAdd = () => {
            emit('add', 1, 2)
            emit('add-foo')
        }

        return {
            emitAdd
        }
    },
    render() {
        const btn = h('button', {
            onClick: this.emitAdd
        }, 'emitAdd')

        const foo = h("p", {}, "foo")
        return h('div', {}, [foo, btn])
    }
}
