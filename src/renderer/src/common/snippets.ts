export type SnippetType = 'responseStatus200' | 'expectedHeaders' | 'asyncTest'

export function getSnippet(type) {
  switch (type) {
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
    default:
      return ''
  }
}
