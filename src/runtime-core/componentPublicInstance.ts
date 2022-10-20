
const publicPropertiesMap = {
    $el: (i) => i.vnode.el
}

export const publicInstanceProxyHandles = {
    get({ _: instance }, key) {
        const { setupState } = instance
        if (key in setupState) {
            return setupState[key]
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
