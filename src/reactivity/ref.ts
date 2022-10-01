import { hasChange, isObject } from "../../shared";
import { isTracking, trackEffects, triggerEffects } from "./effect";
import { reactive } from "./reactive";

// ref值有点不一样
// 有时候传入 ref(x) 中的值 x 可能是 true , 1 , "1" 等类型的值
// 怎么才能知道这些值被 get/set ?
// proxy 只针对于对象 -> object
// 所以这里要用一个对象包裹一下 {}
// 给 对象里面的 value 定义 get/set , 这样就能做正常的依赖收集的触发依赖了...

class RefImpl {
    private _value: any;
    dep: Set<unknown>;
    private _rawValue: any;

    constructor(value) {
        this._rawValue = value
        this._value = convert(value)
        // value --> reactive
        // 1. 看看 value 是不是 对象


        this.dep = new Set()
    }
    get value() {
        trackRefValue(this)

        return this._value;
    }

    set value(ndwValue) {
        // 一定是先去修改了 value 的zhi 

        // hasChange
        if (hasChange(ndwValue, this._rawValue)) {
            this._rawValue = ndwValue;
            this._value = convert(ndwValue)

            triggerEffects(this.dep)
        }
    }
}

function convert(value) {
    return isObject(value) ? reactive(value) : value
}

function trackRefValue(ref) {
    if (isTracking()) {
        trackEffects(ref.dep)
    }
}

export function ref(value) {
    return new RefImpl(value)
}
