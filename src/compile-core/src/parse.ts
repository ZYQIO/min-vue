import { NodeTypes } from "./ast"

export function baseParse(content: string) {
    const context = createParserContext(content)
    return createRoot(parseChildren(context))
}

function parseChildren(context) {
    const nodes: any[] = []

    let node: any
    if (context.source.startsWith("{{")) {
        node = parseInterpolation(context)
    }

    nodes.push(node)

    return nodes;
}

function parseInterpolation(context) {
    // context.source --> {{message}}

    const opendDelomiter = "{{"
    const closeDelomiter = "}}"

    const closeIndex = context.source.indexOf(closeDelomiter, opendDelomiter.length)

    // console.log(closeIndex)

    // context.source = context.source.slice(opendDelomiter.length)
    advanceBy(context, opendDelomiter.length)

    const rawContentLength = closeIndex - opendDelomiter.length;

    const rawContent = context.source.slice(0, rawContentLength);
    const content = rawContent.trim()
    console.log(content)

    // context.source = context.source.slice(rawContentLength + closeDelomiter.length)
    advanceBy(context, rawContentLength + closeDelomiter.length)
    console.log(context)

    return {
        type: NodeTypes.INTERPOLATION,
        content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: content
        }
    }
}

function advanceBy(context: any, length: number) {
    context.source = context.source.slice(length)
}

function createRoot(children) {
    return {
        children
    }
}

function createParserContext(content: string) {
    return {
        source: content
    }
}
