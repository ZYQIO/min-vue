import { createComponentInstance, setupComponent } from "./component"

export function render(vnode, container) {
    // 去调用 patch 方法
    patch(vnode, container)
}

function patch(vnode, container) {

    // TODO 判断 vnode 是不是一个 element 
    // 是 element 那么就应该处理 element
    // 思考题: 如何去区分是 element 类型 还是 component 类型 ?
    // processelement()

    // 去处理组件

    // 判断是不是 element 
    processComponent(vnode, container)
}

function processComponent(vnode, container) {
    mountComponent(vnode, container)
}

function mountComponent(vnode, container) {
    const instance = createComponentInstance(vnode)

    setupComponent(instance)
    setupRenderEffect(instance, container)
}

function setupRenderEffect(instance, container) {
    const subTree = instance.render()

    // vnode
    patch(subTree, container)
}

