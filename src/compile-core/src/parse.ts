import { NodeTypes } from "./ast"

const enum TagType {
    Start,
    End
}

export function baseParse(content: string) {
    const context = createParserContext(content)
    return createRoot(parseChildren(context, []))
}

function parseChildren(context, ancestors) {
    const nodes: any[] = []

    while (!isEnd(context, ancestors)) {

        let node: any;
        const s = context.source;
        if (s.startsWith("{{")) {
            node = parseInterpolation(context)
        } else if (s[0] === "<") {
            if (/[a-z]/i.test(s[1])) {
                node = parseElement(context, ancestors)
            }
        }

        if (!node) {
            node = parseText(context)
        }

        nodes.push(node)

    }

    console.log(nodes)

    return nodes;
}

function isEnd(context, ancestors) {
    // 2. 当遇到结束的时候
    const s = context.source;
    // </div>
    if (s.startsWith("</")) {
        for (let i = ancestors.length - 1; i >= 0; i--) {
            const tag = ancestors[i].tag;
            if (startWithEndTagOpen(s, tag)) {
                return true;
            }
        }
    }

    // if (paremtTag && s.startsWith(`<${paremtTag}>`)) {
    //     return true;
    // }

    // // 1. source 有值的时候
    return !s;
}

function parseText(context: any) {
    let endIndex = context.source.length;
    let endToken = ["<", "{{"]

    for (let i = 0; i < endToken.length; i++) {
        let index = context.source.indexOf(endToken[i]);
        if (index !== -1 && endIndex > index) {
            endIndex = index;
        }

    }

    // 获取content
    const content = parseTextData(context, endIndex)

    return {
        type: NodeTypes.TEXT,
        content
    }
}

function parseTextData(context, length) {
    // 1. 获取 content
    const content = context.source.slice(0, length)
    // 2. 推进
    advanceBy(context, length)

    return content;
}


function parseElement(context, ancestors) {
    // 1. 解析 tag
    const element: any = parseTag(context, TagType.Start)

    ancestors.push(element)
    const children = parseChildren(context, ancestors)
    ancestors.pop()

    if (startWithEndTagOpen(context.source, element.tag)) {
        parseTag(context, TagType.End)
    } else {
        throw new Error(`缺失结束标签: ${element.tag}`);
    }

    element.children = children;

    return element;
}

function startWithEndTagOpen(source, tag) {
    return source.startsWith("</") && source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase();
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

    // const rawContent = context.source.slice(0, rawContentLength);
    const rawContent = parseTextData(context, rawContentLength)
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
