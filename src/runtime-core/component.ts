import { proxyRefs } from "../reactivity";
import { shallowReadonly } from "../reactivity/reactive";
import { emit } from "./componentEmit";
import { initProps } from "./componentProps";
import { publicInstanceProxyHandles } from "./componentPublicInstance";
import { initSlots } from "./componentSlots";

export function createComponentInstance(vnode, parent) {

    // console.log('createComponentInstance: ', parent)

    const component = {
        vnode,
        type: vnode.type,
        next: null,
        setupState: {},
        props: {},
        slots: {},
        providers: parent ? parent.providers : {},
        parent,
        isMounted: false,
        subTree: {},
        emit: () => { }
    }

    component.emit = emit.bind(null, component) as any;

    return component
}

export function setupComponent(instance) {
    // TODO
    // initProps
    initProps(instance, instance.vnode.props)
    // console.log('instance', instance);

    initSlots(instance, instance.vnode.children)

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
        serCurrentInstance(instance)
        // setup 可以返回一个 fn, 也可以返回一个 object
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit
        })

        serCurrentInstance(null)

        handleSetupResult(instance, setupResult)
    }

}

function handleSetupResult(instance, setupResult) {
    // 这里有两个情况要实现
    // 1. function 2.object
    // TODO function

    // 先实现 object
    if (typeof setupResult === 'object') {
        instance.setupState = proxyRefs(setupResult);
    }

    finishComponentSetup(instance)
}

function finishComponentSetup(instance) {
    const Component = instance.type;

    if (Component.render) {
        instance.render = Component.render
    }
}

let currentInstance = null
export function getCurrentInstance() {
    return currentInstance;
}

export function serCurrentInstance(instance) {
    currentInstance = instance;
}

