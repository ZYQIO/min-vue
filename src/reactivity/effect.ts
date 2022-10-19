import { extend } from "../shared";


let activeEffect;
let shouldTrack;

export class ReactiveEffect {
    private _fn: any
    scheduler: any;
    deps = []
    active = true
    onStop?: () => void

    constructor(fn, scheduler) {
        this._fn = fn
        this.scheduler = scheduler;
    }
    run() {
        // shouldTrack 做区分
        if (!this.active) {
            return this._fn()
        }

        shouldTrack = true
        activeEffect = this

        const result = this._fn()

        // reset
        shouldTrack = false

        return result
    }
    stop() {
        if (this.active) {
            cleanupEffect(this)

            if (this.onStop) this.onStop();

            this.active = false
        }
    }
}

function cleanupEffect(effect) {
    effect.deps.forEach((dep: any) => {
        dep.delete(effect)
    })
    effect.deps.length = 0
}

const targetMap = new Map()
// {
//     target: {
//         key: [activeEffect]
//     }
// }
export function track(target, key) {

    if (!isTracking()) return;

    // target -> key -> dep
    let depsMap = targetMap.get(target)
    if (!depsMap) {
        depsMap = new Map()
        targetMap.set(target, depsMap)
    }

    let dep = depsMap.get(key)
    if (!dep) {
        dep = new Set()
        depsMap.set(key, dep)
    }

    trackEffects(dep)
}

export function trackEffects(dep) {
    // 去重, 防止重复添加
    if (dep.has(activeEffect)) return

    dep.add(activeEffect)
    activeEffect.deps.push(dep)
}

export function isTracking() {
    return shouldTrack && activeEffect !== undefined;
}

export function trigger(target, key) {
    let depsMap = targetMap.get(target)
    let dep = depsMap.get(key)
    triggerEffects(dep)
}

export function triggerEffects(dep) {
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler()
        } else {
            effect.run()
        }
    }
}

export function effect(fn, options: any = {}) {
    const _effect = new ReactiveEffect(fn, options.scheduler)

    // _effect.onStop = options.onStop;
    // Object.assign(_effect, options)
    // extend
    extend(_effect, options)

    _effect.run()

    const runner: any = _effect.run.bind(_effect)
    runner._effect = _effect

    return runner;
}

export function stop(runner) {
    runner._effect.stop()
}
