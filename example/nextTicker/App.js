import { h, ref, getCurrentInstance, nextTick } from '../../lib/guide-mini-vue.esm.js'

export const App = {
    name: 'App',
    setup() {
        const count = ref(1)
        const instance = getCurrentInstance()

        nextTick(() => {
            console.log('instance', instance);
        })

        const onClick = () => {
            for (let i = 0; i < 100; i++) {
                count.value = i;
            }
        }

        return {
            count,
            onClick
        }
    },
    render() {
        const button = h('button', { onClick: this.onClick }, "update")
        const p = h('p', {}, "count: " + this.count)
        return h("div", {}, [button, p])
    }
}
