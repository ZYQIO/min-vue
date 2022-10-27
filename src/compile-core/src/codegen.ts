import { NodeTypes } from "./ast"
import { helperMapName, TO_DISPLAY_STRING } from "./runtimeHelper"

export function generate(ast) {
    const context = createCodegenContext()
    const { push } = context

    genFunctionPreamble(ast, context)

    const functionName = "render"
    const args = ["_ctx", "_cache"]
    const signature = args.join(", ")

    push(`function ${functionName}(${signature}){`)

    push("return ")

    genNode(ast.codegenNode, context)

    push("}")

    console.log('context ======code', context.code)

    return {
        code: context.code
    }
}

function createCodegenContext() {
    const context = {
        code: "",
        push(source) {
            context.code += source;
        },
        helper(key) {
            return `_${helperMapName[key]}`
        }
    }

    return context
}

function genNode(node: any, context) {

    switch (node.type) {
        case NodeTypes.TEXT:
            genText(node, context)
            break;
        case NodeTypes.INTERPOLATION:
            geninterpolation(node, context)
        case NodeTypes.SIMPLE_EXPRESSION:
            genExpression(node, context)

        default:
            break;
    }
}

function genExpression(node, context) {
    const { push } = context

    push(`${node.content}`)
}

function genText(node, context) {
    const { push } = context;
    push(`'${node.content}'`)
}

function geninterpolation(node, context) {
    const { push, helper } = context;
    console.log('===============', node)
    push(`_${helper(TO_DISPLAY_STRING)}(`)
    genNode(node.content, context)
    push(")")
}

function genFunctionPreamble(ast: any, context) {
    const { push } = context;
    const VueBinging = "Vue";
    const helper = ["toDisplayString"];
    const aliasHelper = (s) => `${helperMapName[s]}:_${helperMapName[s]}`;
    if (ast.helpers.length > 0) {
        push(`const {${helper.map(aliasHelper).join(", ")} } = ${VueBinging}`);
    }
    push('\n')
    push("return ");
}

