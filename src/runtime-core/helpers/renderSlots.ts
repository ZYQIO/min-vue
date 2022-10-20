import { createVNode, Fragment } from "../vnode";

export function renderSlots(slots, name, props) {
    const slot = slots[name]

    if (slot) {
        if (typeof slot === 'function') {
            // 问题: children 不可以有 array
            // 所以需要去掉多余渲染出来的 div

            return createVNode(Fragment, {}, slot(props))
        }
    }
}
