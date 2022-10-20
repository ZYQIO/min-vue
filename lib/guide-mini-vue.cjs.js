'use strict';

var ShapeFlags;
(function (ShapeFlags) {
    ShapeFlags[ShapeFlags["ELEMENT"] = 1] = "ELEMENT";
    ShapeFlags[ShapeFlags["STATEFUL_COMPONENT"] = 2] = "STATEFUL_COMPONENT";
    ShapeFlags[ShapeFlags["TEXT_CHILDREN"] = 4] = "TEXT_CHILDREN";
    ShapeFlags[ShapeFlags["ARRAY_CHILDREN"] = 8] = "ARRAY_CHILDREN"; // '1000'
})(ShapeFlags || (ShapeFlags = {}));
// 如果补齐数位, 就是以下的情况
// element = 1, // '0001'
// stateful_component = 1 << 1, // '0010'
// text_children = 1 << 2, // '0100'
// array_children = 1 << 3 // '1000'
// 0001
// 0100
// ------
// 0101
// 0001
// 1000
// ----
// 1001

const publicPropertiesMap = {
    $el: (i) => i.vnode.el
};
const publicInstanceProxyHandles = {
    get({ _: instance }, key) {
        const { setupState } = instance;
        if (key in setupState) {
            return setupState[key];
        }
        // 优化前: 
        // if (key === '$el') {
        //     return instance.vnode.el
        // }
        // 优化后:
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
        // $data
    }
};

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {}
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
    // ctx
    instance.proxy = new Proxy({
        _: instance
    }, publicInstanceProxyHandles);
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
    // 改造前
    // if (typeof vnode.type === 'string') {
    //     processelement(vnode, container)
    // } else if (isObject(vnode.type)) {
    //     processComponent(vnode, container)
    // }
    const { shapeFlag } = vnode;
    // 改造后
    if (shapeFlag & ShapeFlags.ELEMENT) {
        processelement(vnode, container);
    }
    else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        processComponent(vnode, container);
    }
}
function processelement(vnode, container) {
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    const el = vnode.el = document.createElement(vnode.type);
    const { children, props, shapeFlag } = vnode;
    // 改造前
    // if (typeof children === 'string') {
    //     el.textContent = children;
    // } else if (Array.isArray(children)) {
    //     // vnode
    //     mountChildren(vnode, el)
    // }
    // 改造后
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        el.textContent = children;
    }
    else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // vnode
        mountChildren(vnode, el);
    }
    // props
    for (const key in props) {
        console.log('key', key);
        const val = props[key];
        // 具体的 click --> 重构成通用的
        // on + Event name
        // onMousedown
        const isOn = (key) => /^on[A-Z]/.test(key);
        if (isOn(key)) {
            const event = key.slice(2).toLocaleLowerCase();
            el.addEventListener(event, val);
        }
        else {
            el.setAttribute(key, val);
        }
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
function mountComponent(initialVNode, container) {
    const instance = createComponentInstance(initialVNode);
    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container);
}
function setupRenderEffect(instance, initialVNode, container) {
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);
    console.log('subTree', subTree);
    // vnode
    patch(subTree, container);
    initialVNode.el = subTree.el;
}

function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        shapeFlag: getShapeFlg(type),
        el: null
    };
    // children
    if (typeof children === 'string') {
        vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
    }
    return vnode;
}
function getShapeFlg(type) {
    return typeof type === 'string' ?
        ShapeFlags.ELEMENT :
        ShapeFlags.STATEFUL_COMPONENT;
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
