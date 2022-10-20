import { ShapeFlags } from "../shared/ShapeFlags";

export function createVNode(type, props?, children?) {

    const vnode = {
        type,
        props,
        children,
        shapeFlag: getShapeFlg(type),
        el: null
    }

    // children
    if (typeof children === 'string') {
        vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
    } else if (Array.isArray(children)) {
        vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
    }

    return vnode;
}

function getShapeFlg(type) {
    return typeof type === 'string' ?
        ShapeFlags.ELEMENT :
        ShapeFlags.STATEFUL_COMPONENT;
}
