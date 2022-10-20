import { camelize, toHandlerKey } from "../shared/index";

export function emit(instance, event, ...args) {
    // console.log('emit', event);

    const { props } = instance;


    // TPP
    // 先去写一个特定的行为, --> 然后重构成通用的行为
    // add -> Add
    // add-foo  -->  onAddFoo

    const handlerName = toHandlerKey(camelize(event))

    const handler = props[handlerName]
    handler && handler(...args)
}
