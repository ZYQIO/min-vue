import { createVNode } from './vnode'

export function h(type, props?, children?) {
    // createVNode 返回的数据结构
    // const vnode = {
    //     type,
    //     props,
    //     children
    // }

    return createVNode(type, props, children)
}
