const vm = require('node:vm')
const Mocha = require('mocha')
const { expect } = require('chai')

const { workerData } = require('worker_threads')

const mochaInstance = new Mocha()
const testMap = []

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

function testRunner(matchedRuleDetails) {
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
    }

    try {
      mochaInstance.allowUncaught(false)

      mochaInstance.uncaught = function (err) {
        console.error('mocha test error', err)
      }
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
    } catch (error) {
      console.error('mocha run error', error)
    }
  }
}

if (workerData.matchedRuleDetails) {
  testRunner(workerData.matchedRuleDetails)
}
