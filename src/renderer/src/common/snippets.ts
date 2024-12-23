export type SnippetType =
  | 'requestBody'
  | 'requestHeaders'
  | 'responseStatus200'
  | 'expectedHeaders'
  | 'asyncTest'
  | 'printRequestBody'
  | 'printResponseStatus'
  | 'printAllResponseHeaders'

export function getSnippet(type: SnippetType) {
  switch (type) {
    case 'requestBody':
      return `at.test('Request body', function() {
  const body = JSON.parse(request.body)
  expect(body.result).to.equal('success')
})`
    case 'requestHeaders':
      return `at.test('Request headers', function() {
  expect(request.headers).to.deep.equal({
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Host': 'example.com'
  });
})`
    case 'responseStatus200':
      return `at.test('Response status code is 200', function() {
  expect(response.status).to.equal(200);
})`
    case 'expectedHeaders':
      return `at.test("Response includes expected headers", function() {
  const expectedHeaders = ['User-Agent', 'Host', 'X-Forwarded-From-Apitune'];
  expectedHeaders.forEach(header => {
    expect(response.headers[header]).to.not.be.null;
  })
})`
    case 'asyncTest':
      return `at.test('Should pass in async script', function(done) {
  setTimeout(function() {
    expect(1).to.equal(1);
    done();
  }, 1000);
})`

    case 'printRequestBody':
      return `const body = JSON.parse(request.body)
at.print(\`Request payload result: $\{body.result}\`)`
    case 'printResponseStatus':
      return `at.print.debug('100')
at.print.info('200')
at.print.log('300')
at.print.warn('400')
at.print.error('500')`
    case 'printAllResponseHeaders':
      return `const list = []
for(let header of Object.keys(response.headers)) {
    list.push({
      value: \`Response Header: $\{header} => $\{response.headers[header]}\`,
      type: getRandomType()
    })
}

at.print.list(list);`
    default:
      return ''
  }
}
