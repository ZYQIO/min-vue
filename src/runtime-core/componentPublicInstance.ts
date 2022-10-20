import { hasOwn } from "../shared/index"

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots
}

export const publicInstanceProxyHandles = {
    get({ _: instance }, key) {
        const { setupState, props } = instance
        // if (key in setupState) {
        //     return setupState[key]
        // }

        if (hasOwn(setupState, key)) {
            return setupState[key]
        } else if (hasOwn(props, key)) {
            return props[key]
        }

        // 优化前: 
        // if (key === '$el') {
        //     return instance.vnode.el
        // }

        // 优化后:
        const publicGetter = publicPropertiesMap[key]
        if (publicGetter) {
            return publicGetter(instance)
        }



        // $data
    }
}
