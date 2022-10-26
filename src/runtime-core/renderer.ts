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
        patch(null, vnode, container, null, null)
    }

    // n1 --> old vnode
    // n2 --> new vnode
    function patch(n1, n2, container, parentComponent, anchor) {

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
                processFragment(n1, n2, container, parentComponent, anchor)
                break;

            case Text:
                processText(n1, n2, container)
                break;

            default:
                // 改造后
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    processElement(n1, n2, container, parentComponent, anchor)
                } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    processComponent(n1, n2, container, parentComponent, anchor)
                }
                break;
        }

    }

    function processText(n1, n2, container) {
        const { children } = n2
        const textNode = n2.el = document.createTextNode(children)
        container.appendChild(textNode)
    }

    function processFragment(n1, n2, container, parentComponent, anchor) {
        mountChildren(n2.children, container, parentComponent, anchor)
    }

    function processElement(n1, n2: any, container: any, parentComponent, anchor) {
        if (!n1) {
            mountElement(n2, container, parentComponent, anchor)
        } else {
            patchElement(n1, n2, container, parentComponent, anchor)
        }
    }

    function patchElement(n1, n2, container, parentComponent, anchor) {
        console.log('n1', n1);
        console.log('n2', n2);
        console.log('container', container);


        // 对比props
        const oldProps = n1.props || EMPTY_OBJ
        const newProps = n2.props || EMPTY_OBJ

        const el = n2.el = n1.el;

        patchChildren(n1, n2, el, parentComponent, anchor)
        patchProps(el, oldProps, newProps)
        // 对比 children

    }

    function patchChildren(n1, n2, container, parentComponent, anchor) {
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
                mountChildren(c2, container, parentComponent, anchor)
            } else {
                // array diff array
                patchKeyedChildren(c1, c2, container, parentComponent, anchor)
            }
        }
    }

    function patchKeyedChildren(c1, c2, container, parentComponent, parentAnchor) {
        const l2 = c2.length;
        let i = 0;
        let e1 = c1.length - 1;
        let e2 = l2 - 1

        function isSomeVNodeType(n1, n2) {
            // type
            // key
            return n1.type === n2.type && n1.key === n2.key
        }

        // 左侧
        while (i <= e1 && i <= e2) {
            const n1 = c1[i]
            const n2 = c2[i]

            if (isSomeVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor)
            } else {
                break;
            }

            i++
        }

        // 右侧
        while (i <= e1 && i <= e2) {
            const n1 = c1[e1]
            const n2 = c2[e2]

            if (isSomeVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor)
            } else {
                break;
            }

            e1--;
            e2--;
        }


        // 3. 新的比老的多 创建
        if (i > e1) {
            if (i <= e2) {
                const nextPos = e2 + 1;
                const anchor = nextPos < l2 ? c2[nextPos].el : null
                while (i <= e2) {
                    patch(null, c2[i], container, parentComponent, anchor)
                    i++;
                }
            }
        } else if (i > e2) {
            while (i <= e1) {
                hostRemove(c1[i].el)
                i++;
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

    function mountElement(vnode: any, container: any, parentComponent, anchor) {
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
            mountChildren(vnode.children, el, parentComponent, anchor)
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
        hostInsert(el, container, anchor)
    }

    function mountChildren(children, container, parentComponent, anchor) {
        children.forEach(v => {
            patch(null, v, container, parentComponent, anchor)
        })
    }

    function processComponent(n1, n2, container, parentComponent, anchor) {
        mountComponent(n2, container, parentComponent, anchor)
    }

    function mountComponent(initialVNode, container, parentComponent, anchor) {
        const instance = createComponentInstance(initialVNode, parentComponent)

        setupComponent(instance)
        setupRenderEffect(instance, initialVNode, container, anchor)
    }

    function setupRenderEffect(instance, initialVNode, container, anchor) {
        effect(() => {

            if (!instance.isMounted) {
                // 初始化
                console.log('初始化');

                const { proxy } = instance
                const subTree = instance.subTree = instance.render.call(proxy)
                console.log('subTree', subTree);


                // vnode
                patch(null, subTree, container, instance, anchor)

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
                patch(prevSubTree, subTree, container, instance, anchor)

                // initialVNode.el = subTree.el

                // instance.isMounted = true
            }
        })
    }

    return {
        createApp: createAppAPI(render)
    }

}

