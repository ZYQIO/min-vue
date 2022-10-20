import { h } from '../../lib/guide-mini-vue.esm.js'

window.self = null
export const Foo = {
    name: 'Foo',
    setup(props) {
        // props.count
        props.count++
        console.log(props);
    },
    render() {
        return h('div', {}, "foo: " + this.count)
    }
}
