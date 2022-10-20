export enum ShapeFlags {
    ELEMENT = 1, // '01'
    STATEFUL_COMPONENT = 1 << 1, // toString(2); --> '10' 默认十进制转换二进制
    TEXT_CHILDREN = 1 << 2, // '100'
    ARRAY_CHILDREN = 1 << 3, // '1000'
    SLOT_CHILDREN = 1 << 4
}

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

