import http from 'http'
import url from 'url'
import { proxyLog } from './communicator'

export function startServer(): void {
  http
    .createServer(function (req, res) {
      console.log('server request url', req.url)

      if (!req.url) {
        return
      }
      proxyLog(req.url)

      const options = {
        ...url.parse(req.url),
        headers: req.headers
      }

      const proxyRequest = http.request(options, function (proxyResponse) {
        proxyResponse.on('data', function (chunk) {
          console.log('proxyResponse length:', chunk.length)
          res.write(chunk, 'binary')
        })

        proxyResponse.on('end', function () {
          console.log('proxyResponse end')
          res.end()
        })

        res.writeHead(proxyResponse.statusCode as number, proxyResponse.headers)
      })

      req.on('data', function (chunk) {
        console.log('in request length:', chunk.length)
        proxyRequest.write(chunk, 'binary')
      })

      req.on('end', function () {
        console.log('in request end')
        proxyRequest.end()
      })
    })
    .listen(8898)
}
