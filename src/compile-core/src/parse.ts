import { NodeTypes } from "./ast"

const enum TagType {
    Start,
    End
}

export function baseParse(content: string) {
    const context = createParserContext(content)
    return createRoot(parseChildren(context))
}

function parseChildren(context) {
    const nodes: any[] = []

    let node: any;
    const s = context.source;
    if (s.startsWith("{{")) {
        node = parseInterpolation(context)
    } else if (s[0] === "<") {
        if (/[a-z]/i.test(s[1])) {
            node = parseElement(context)
        }
    }

    nodes.push(node)

    return nodes;
}

function parseElement(context) {
    // 1. 解析 tag
    const element = parseTag(context, TagType.Start)

    parseTag(context, TagType.End)

    // console.log('--------, ', context)

    return element;
}

function parseTag(context: any, type: TagType) {
    const match: any = /^<\/?([a-z]+)/i.exec(context.source)
    // console.log(match)
    const tag = match[1]
    // 2. 删除处理完成的代码
    advanceBy(context, match[0].length)
    advanceBy(context, 1)
    // console.log(context)

    if (type === TagType.End) return;

    return {
        type: NodeTypes.ELEMENT,
        tag: tag
    }
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
    // console.log(content)

    // context.source = context.source.slice(rawContentLength + closeDelomiter.length)
    advanceBy(context, rawContentLength + closeDelomiter.length)
    // console.log(context)

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
