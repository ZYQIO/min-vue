import pkg from './package.json' assert { type: "json" };
import typescript from '@rollup/plugin-typescript'

export default {
    input: './src/index.ts',
    output: [
        {
            format: "cjs",
            file: pkg.main
        },
        {
            format: "es",
            file: pkg.module
        }
    ],

    // rollup 打包时不支持识别ts, 需要用官方提供的插件 npm i @rollup/plugin-typescript
    plugins: [typescript()]
}

