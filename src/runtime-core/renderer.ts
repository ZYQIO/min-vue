import { isObject } from "../shared/index";
import { createComponentInstance, setupComponent } from "./component"

export function render(vnode, container) {
    // 去调用 patch 方法
    patch(vnode, container)
}

function patch(vnode, container) {

    // TODO 判断 vnode 是不是一个 element 
    // 是 element 那么就应该处理 element
    // 思考题: 如何去区分是 element 类型 还是 component 类型 ?
    console.log(vnode.type);
    if (typeof vnode.type === 'string') {
        processelement(vnode, container)
    } else if (isObject(vnode.type)) {
        processComponent(vnode, container)
    }
}

function processelement(vnode: any, container: any) {
    mountElement(vnode, container)
}

function mountElement(vnode: any, container: any) {
    const el = vnode.el = document.createElement(vnode.type)

    const { children, props } = vnode;

    if (typeof children === 'string') {

        el.textContent = children;
    } else if (Array.isArray(children)) {
        // vnode
        mountChildren(vnode, el)
    }

    // props
    for (const key in props) {
        const val = props[key]
        el.setAttribute(key, val)
    }

    container.appendChild(el)
}

function mountChildren(vnode, container) {
    vnode.children.forEach(v => {
        patch(v, container)
    })
}

function processComponent(vnode, container) {
    mountComponent(vnode, container)
}

function mountComponent(initialVNode, container) {
    const instance = createComponentInstance(initialVNode)

    setupComponent(instance)
    setupRenderEffect(instance, initialVNode, container)
}

function setupRenderEffect(instance, initialVNode, container) {
    const { proxy } = instance
    const subTree = instance.render.call(proxy)
    console.log('subTree', subTree);


    // vnode
    patch(subTree, container)

    initialVNode.el = subTree.el
}


