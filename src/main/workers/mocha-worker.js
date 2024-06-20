const vm = require('node:vm')
const Mocha = require('mocha')
const { expect } = require('chai')
const { workerData, parentPort } = require('worker_threads')

const mochaInstance = new Mocha()
const testCaseList = []
const testResult = []
const titleRuleMap = {}
let startTime = null

const at = {
  test: function (title, testFunc) {
    testCaseList.push({
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
        if (testCaseList && testCaseList.length) {
          const testResultItem = {
            ruleId: rule.id,
            cases: [],
            results: {
              passed: [],
              failed: []
            }
          }
          for (const testItem of testCaseList) {
            if (testItem && testItem.title && testItem.testFunc) {
              shouldRun = true
              // To make the test title unique
              const testTitle = `Rule: ${rule.id} - ${testItem.title}`
              mochaInstance.suite.addTest(new Mocha.Test(testTitle, testItem.testFunc))
              // testResultItem.cases.push({
              //   title: testItem.title,
              //   testFunc: testItem.testFunc.toString()
              // })
              titleRuleMap[testTitle] = rule.id
            }
          }
          testResult.push(testResultItem)
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
      startTime = new Date().getTime()
      // Run the Mocha instance
      const runner = mochaInstance.run()
      runner.on('pass', (test) => {
        results.passed.push(test.title)
        const targetRuleId = titleRuleMap[test.title]
        const targetResult = testResult.find((result) => result.ruleId === targetRuleId)
        if (targetResult) {
          const title = test.title.split(' - ')[1]
          targetResult.cases.push({
            title: title
          })
          targetResult.results.passed.push({
            title: title
          })
        }
      })

      runner.on('fail', (test, err) => {
        results.failed.push({
          title: test.title,
          error: err.message
        })
        const targetRuleId = titleRuleMap[test.title]
        const targetResult = testResult.find((result) => result.ruleId === targetRuleId)
        if (targetResult) {
          const title = test.title.split(' - ')[1]
          targetResult.cases.push({
            title: title,
            error: err.message
          })
          targetResult.results.passed.push({
            title: title,
            error: err.message
          })
        }
      })

      runner.on('end', () => {
        parentPort.postMessage({
          logId: workerData.logId,
          tests: testResult,
          startTime,
          endTime: new Date().getTime()
        })

        console.log('---- Test Results: ----')
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
