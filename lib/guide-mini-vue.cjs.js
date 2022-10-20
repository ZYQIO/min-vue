'use strict';

const isObject = val => {
    return val !== null && typeof val === 'object';
};

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type
    };
    return component;
}
function setupComponent(instance) {
    // TODO
    // initProps
    // initSlots
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.type;
    const { setup } = Component;
    if (setup) {
        // setup 可以返回一个 fn, 也可以返回一个 object
        const setupResult = setup();
        handleSetupResult(instance, setupResult);
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
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    if (Component.render) {
        instance.render = Component.render;
    }
}

function render(vnode, container) {
    // 去调用 patch 方法
    patch(vnode, container);
}
function patch(vnode, container) {
    // TODO 判断 vnode 是不是一个 element 
    // 是 element 那么就应该处理 element
    // 思考题: 如何去区分是 element 类型 还是 component 类型 ?
    console.log(vnode.type);
    if (typeof vnode.type === 'string') {
        processelement(vnode, container);
    }
    else if (isObject(vnode.type)) {
        processComponent(vnode, container);
    }
}
function processelement(vnode, container) {
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    const el = document.createElement(vnode.type);
    const { children, props } = vnode;
    if (typeof children === 'string') {
        el.textContent = children;
    }
    else if (Array.isArray(children)) {
        // vnode
        mountChildren(vnode, el);
    }
    // props
    for (const key in props) {
        const val = props[key];
        el.setAttribute(key, val);
    }
    container.appendChild(el);
}
function mountChildren(vnode, container) {
    vnode.children.forEach(v => {
        patch(v, container);
    });
}
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
function mountComponent(vnode, container) {
    const instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance, container);
}
function setupRenderEffect(instance, container) {
    const subTree = instance.render();
    console.log('subTree', subTree);
    // vnode
    patch(subTree, container);
}

function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children
    };
    return vnode;
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // 先转换成 vnode
            // 后续的所有逻辑操作都会基于 vnode 做处理
            const vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
        }
    };
}

function h(type, props, children) {
    // createVNode 返回的数据结构
    // const vnode = {
    //     type,
    //     props,
    //     children
    // }
    return createVNode(type, props, children);
}

exports.createApp = createApp;
exports.h = h;
