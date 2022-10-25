import { getCurrentInstance } from "./component";


// 存数据
export function provider(key, value) {
    // key --> value

    const currentInstance: any = getCurrentInstance()
    if (currentInstance) {
        let { providers } = currentInstance

        // console.log('providers000', providers);

        const parentProviders = currentInstance.parent.providers;

        // init 初始化
        if (providers === parentProviders) {
            providers = currentInstance.providers = Object.create(parentProviders)
            // console.log('providers', providers);

        }

        providers[key] = value
    }
}


// 取值
export function inject(key, defaultValue) {
    const currentInstance: any = getCurrentInstance()
    if (currentInstance) {
        const parentProviders = currentInstance.parent.providers;

        if (key in parentProviders) {
            return parentProviders[key]
        } else {
            if (typeof defaultValue === 'function') {
                return defaultValue()
            }
            return defaultValue
        }
    }
}
