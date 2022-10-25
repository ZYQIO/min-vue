import { createVNode } from "./vnode"

// render
export function createAppAPI(render) {

    return function createApp(rootComponent) {

        return {
            mount(rootContainer) {
                // 先转换成 vnode
                // 后续的所有逻辑操作都会基于 vnode 做处理
                const vnode = createVNode(rootComponent)

                render(vnode, rootContainer)
            }
        }
    }

}
