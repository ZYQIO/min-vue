// import { isObject } from "../shared/index";
import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component"
import { createAppAPI } from "./createApp";
import { Fragment, Text } from "./vnode";

export function createRenderer(options) {

    const { createElement: hostCreateElement, patchProp: hostPatchProp,insert: hostInsert } = options

    function render(vnode, container) {
        // 去调用 patch 方法
        patch(vnode, container, null)
    }

    function patch(vnode, container, parentComponent) {

        // TODO 判断 vnode 是不是一个 element 
        // 是 element 那么就应该处理 element
        // 思考题: 如何去区分是 element 类型 还是 component 类型 ?
        // console.log(vnode.type);
        // 改造前
        // if (typeof vnode.type === 'string') {
        //     processelement(vnode, container)
        // } else if (isObject(vnode.type)) {
        //     processComponent(vnode, container)
        // }

        const { type, shapeFlag } = vnode

        // Fragment --> 只需要渲染 children 内容
        switch (type) {
            case Fragment:
                processFragment(vnode, container, parentComponent)
                break;

            case Text:
                processText(vnode, container)
                break;

            default:
                // 改造后
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    processelement(vnode, container, parentComponent)
                } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    processComponent(vnode, container, parentComponent)
                }
                break;
        }

    }

    function processText(vnode, container) {
        const { children } = vnode
        const textNode = vnode.el = document.createTextNode(children)
        container.appendChild(textNode)
    }

    function processFragment(vnode, container, parentComponent) {
        mountChildren(vnode, container, parentComponent)
    }

    function processelement(vnode: any, container: any, parentComponent) {
        mountElement(vnode, container, parentComponent)
    }

    function mountElement(vnode: any, container: any, parentComponent) {
        const el = vnode.el = hostCreateElement(vnode.type)

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
        } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            // vnode
            mountChildren(vnode, el, parentComponent)
        }

        // props
        for (const key in props) {
            // console.log('key', key);

            const val = props[key]
            // 具体的 click --> 重构成通用的
            // on + Event name
            // onMousedown

            // const isOn = (key: string) => /^on[A-Z]/.test(key)

            // if (isOn(key)) {
            //     const event = key.slice(2).toLocaleLowerCase()
            //     el.addEventListener(event, val)
            // } else {
            //     el.setAttribute(key, val)
            // }
            hostPatchProp(el, key, val)
        }

        // container.appendChild(el)
        hostInsert(el, container)
    }

    function mountChildren(vnode, container, parentComponent) {
        vnode.children.forEach(v => {
            patch(v, container, parentComponent)
        })
    }

    function processComponent(vnode, container, parentComponent) {
        mountComponent(vnode, container, parentComponent)
    }

    function mountComponent(initialVNode, container, parentComponent) {
        const instance = createComponentInstance(initialVNode, parentComponent)

        setupComponent(instance)
        setupRenderEffect(instance, initialVNode, container)
    }

    function setupRenderEffect(instance, initialVNode, container) {
        const { proxy } = instance
        const subTree = instance.render.call(proxy)
        // console.log('subTree', subTree);


        // vnode
        patch(subTree, container, instance)

        initialVNode.el = subTree.el
    }

    return {
        createApp: createAppAPI(render)
    }

}

