import { NodeTypes } from "./ast";
import { TO_DISPLAY_STRING } from "./runtimeHelper";

export function transform(root, options = {}) {
    const context = createTransformContext(root, options)
    // 1. 遍历, 深度优先搜索
    traverseNode(root, context)
    // 2. 修改 text content

    createRootCodegen(root)

    root.helpers = [...context.helpers.keys()]
}

function createRootCodegen(root: any) {
    root.codegenNode = root.children[0];
}

function createTransformContext(root: AnimationTimeline, options) {
    const context = {
        root,
        nodeTransforms: options.nodeTransforms || [],
        helpers: new Map(),
        helper(key) {
            context.helpers.set(key, 1)
        }
    }

    return context;
}

function traverseNode(node, context) {
    const nodeTransforms = context.nodeTransforms;
    for (let i = 0; i < nodeTransforms.length; i++) {
        const transform = nodeTransforms[i];
        transform(node)
    }

    switch (node.type) {
        case NodeTypes.INTERPOLATION:
            context.helper(TO_DISPLAY_STRING)
            break;
        case NodeTypes.ROOT:
        case NodeTypes.ELEMENT:
            traverseChildren(node, context)

        default:
            break;
    }
}

function traverseChildren(node, context) {
    const children = node.children;

    for (let i = 0; i < children.length; i++) {
        const nodeChild = children[i];
        traverseNode(nodeChild, context)
    }
}
