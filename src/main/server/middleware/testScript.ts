import { Context, Next } from 'koa'
import Mocha from 'mocha'
import { expect } from 'chai'
import vm from 'node:vm'
import { RuleData } from '../../../shared/contract'

// Create a Mocha instance
const mochaInstance = new Mocha()
const testMap = [] as Array<{
  title: string
  testFunc: () => void
}>

const at = {
  test: function (title, testFunc) {
    testMap.push({
      title,
      testFunc
    })
  }
}

const scriptParseContext = vm.createContext({
  expect,
  setTimeout,
  at
})

export default async function testScriptMiddleware(ctx: Context, next: Next) {
  next()

  const matchedRuleDetails: Array<RuleData> = ctx.matchedRuleDetails

  let shouldRun = false

  for (const rule of matchedRuleDetails) {
    if (rule.testScript) {
      try {
        vm.runInNewContext(rule.testScript, scriptParseContext)
        if (testMap && testMap.length) {
          for (const testItem of testMap) {
            if (testItem && testItem.title && testItem.testFunc) {
              shouldRun = true
              mochaInstance.suite.addTest(new Mocha.Test(testItem.title, testItem.testFunc))
            }
          }
        }
      } catch (error) {
        console.error('An error occurred:', error)
      }
    }
  }

  if (shouldRun) {
    const results = {
      passed: [],
      failed: []
    } as any

    // Run the Mocha instance
    const runner = mochaInstance.run()
    runner.on('pass', (test) => {
      results.passed.push(test.title)
    })

    runner.on('fail', (test, err) => {
      results.failed.push({ title: test.title, error: err.message })
    })

    runner.on('end', () => {
      console.log('Test Results:')
      console.log('Passed:', results.passed.length, 'tests')
      results.passed.forEach((testTitle) => console.log(`✓ ${testTitle}`))

      console.log('Failed:', results.failed.length, 'tests')
      results.failed.forEach(({ title, error }) => console.log(`✕ ${title}: ${error}`))
    })
  }
}
