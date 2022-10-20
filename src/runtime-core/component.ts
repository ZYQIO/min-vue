import { publicInstanceProxyHandles } from "./componentPublicInstance";

export function createComponentInstance(vnode) {


    const component = {
        vnode,
        type: vnode.type,
        setupState: {}
    }

    return component
}

export function setupComponent(instance) {
    // TODO
    // initProps
    // initSlots

    setupStatefulComponent(instance)
}

function setupStatefulComponent(instance) {

    const Component = instance.type;

    // ctx
    instance.proxy = new Proxy(
        {
            _: instance
        },
        publicInstanceProxyHandles
    )

    const { setup } = Component;

    if (setup) {
        // setup 可以返回一个 fn, 也可以返回一个 object
        const setupResult = setup()

        handleSetupResult(instance, setupResult)
    }

}

function handleSetupResult(instance, setupResult) {
    // 这里有两个情况要实现
    // 1. function 2.object
    // TODO function

    // 先实现 object
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
    }

    finishComponentSetup(instance)
}

function finishComponentSetup(instance) {
    const Component = instance.type;

    if (Component.render) {
        instance.render = Component.render
    }
}

