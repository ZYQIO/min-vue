// import { isObject } from "../shared/index";
import { effect } from "../reactivity/effect";
import { EMPTY_OBJ } from "../shared";
import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component"
import { createAppAPI } from "./createApp";
import { Fragment, Text } from "./vnode";

export function createRenderer(options) {

    const {
        createElement: hostCreateElement,
        patchProp: hostPatchProp,
        insert: hostInsert,
        remove: hostRemove,
        setElementText: hostSetElementText
    } = options

    function render(vnode, container) {
        // 去调用 patch 方法
        patch(null, vnode, container, null)
    }

    // n1 --> old vnode
    // n2 --> new vnode
    function patch(n1, n2, container, parentComponent) {

        // TODO 判断 vnode 是不是一个 element 
        // 是 element 那么就应该处理 element
        // 思考题: 如何去区分是 element 类型 还是 component 类型 ?
        // console.log(vnode.type);
        // 改造前
        // if (typeof vnode.type === 'string') {
        //     processElement(vnode, container)
        // } else if (isObject(vnode.type)) {
        //     processComponent(vnode, container)
        // }

        const { type, shapeFlag } = n2

        // Fragment --> 只需要渲染 children 内容
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent)
                break;

            case Text:
                processText(n1, n2, container)
                break;

            default:
                // 改造后
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    processElement(n1, n2, container, parentComponent)
                } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    processComponent(n1, n2, container, parentComponent)
                }
                break;
        }

    }

    function processText(n1, n2, container) {
        const { children } = n2
        const textNode = n2.el = document.createTextNode(children)
        container.appendChild(textNode)
    }

    function processFragment(n1, n2, container, parentComponent) {
        mountChildren(n2.children, container, parentComponent)
    }

    function processElement(n1, n2: any, container: any, parentComponent) {
        if (!n1) {
            mountElement(n2, container, parentComponent)
        } else {
            patchElement(n1, n2, container, parentComponent)
        }
    }

    function patchElement(n1, n2, container, parentComponent) {
        console.log('n1', n1);
        console.log('n2', n2);
        console.log('container', container);


        // 对比props
        const oldProps = n1.props || EMPTY_OBJ
        const newProps = n2.props || EMPTY_OBJ

        const el = n2.el = n1.el;

        patchChildren(n1, n2, el, parentComponent)
        patchProps(el, oldProps, newProps)
        // 对比 children

    }

    function patchChildren(n1, n2, container, parentComponent) {
        const preShapeFlag = n1.shapeFlag;
        const { shapeFlag } = n2;
        const c1 = n1.children;
        const c2 = n2.children;

        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            if (preShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                // 1. 把老的 children 清空
                unmountChildren(n1.children)
                // 2. 设置 text
                hostSetElementText(container, c2)
            }

            if (c1 !== c2) {
                hostSetElementText(container, c2)
            }
        } else {
            // new array
            if (preShapeFlag & ShapeFlags.TEXT_CHILDREN) {
                hostSetElementText(container, "")
                mountChildren(c2, container, parentComponent)
            }
        }
    }

    function unmountChildren(children) {
        for (let i = 0; i < children.length; i++) {
            const el = children[i];
            // remove
            hostRemove(el)
        }
    }

    function patchProps(el, oldProps, newProps) {
        if (oldProps !== newProps) {

            for (const key in newProps) {
                const preProp = oldProps[key]
                const nextProp = newProps[key]

                if (preProp !== nextProp) {
                    hostPatchProp(el, key, preProp, nextProp)
                }
            }

            if (oldProps !== EMPTY_OBJ) {

                for (const key in oldProps) {
                    if (!(key in newProps)) {
                        hostPatchProp(el, key, oldProps[key], null)
                    }
                }
            }
        }
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
            mountChildren(vnode.children, el, parentComponent)
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
            hostPatchProp(el, key, null, val)
        }

        // container.appendChild(el)
        hostInsert(el, container)
    }

    function mountChildren(children, container, parentComponent) {
        children.forEach(v => {
            patch(null, v, container, parentComponent)
        })
    }

    function processComponent(n1, n2, container, parentComponent) {
        mountComponent(n2, container, parentComponent)
    }

    function mountComponent(initialVNode, container, parentComponent) {
        const instance = createComponentInstance(initialVNode, parentComponent)

        setupComponent(instance)
        setupRenderEffect(instance, initialVNode, container)
    }

    function setupRenderEffect(instance, initialVNode, container) {
        effect(() => {

            if (!instance.isMounted) {
                // 初始化
                console.log('初始化');

                const { proxy } = instance
                const subTree = instance.subTree = instance.render.call(proxy)
                console.log('subTree', subTree);


                // vnode
                patch(null, subTree, container, instance)

                initialVNode.el = subTree.el

                instance.isMounted = true
            } else {
                // update
                console.log('更新');
                const { proxy } = instance
                const subTree = instance.render.call(proxy)
                const prevSubTree = instance.subTree
                // console.log('prev subTree', prevSubTree);
                // console.log('current subTree', subTree);

                instance.subTree = subTree
                // vnode
                patch(prevSubTree, subTree, container, instance)

                // initialVNode.el = subTree.el

                // instance.isMounted = true
            }
        })
    }

    return {
        createApp: createAppAPI(render)
    }

}

