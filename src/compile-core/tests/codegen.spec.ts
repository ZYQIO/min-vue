import { generate } from '../src/codegen'
import { baseParse } from '../src/parse'
import { transform } from '../src/transform'

describe("codegen", () => {
    it('string', () => {
        const ast: any = baseParse('hi')

        transform(ast)

        const { code } = generate(ast)

        // 快照(string)
        expect(code).toMatchSnapshot()
    })
})
