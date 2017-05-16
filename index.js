const http = require('http')
const execFile = require('child_process').execFile
const fs = require('fs')
const path = require('path')
const wkhtmltopdf = require('wkhtmltopdf-installer')
const uuid = require('uuid').v1
const async = require('async')

const temp = process.env.temp || ''

const processPart = (opts, id, partName, cb) => {
  if (!opts[partName]) {
    return cb()
  }

  fs.writeFile(path.join(temp, `${id}-${partName}.html`), opts[partName], (err) => {
    if (err) {
      return cb(err)
    }

    opts.args.push(`--${partName}`)
    opts.args.push(path.join(temp, `${id}-${partName}.html`))
    cb()
  })
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET') {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/plain')
    return res.end('OK')
  }
  var data = ''
  req.on('data', function (chunk) {
    data += chunk.toString()
  })

  req.on('end', function () {
    const opts = JSON.parse(data)

    const id = uuid()

    async.waterfall([
      (cb) => fs.writeFile(path.join(temp, `${id}.html`), opts.html, cb),
      (cb) => processPart(opts, id, 'header-html', cb),
      (cb) => processPart(opts, id, 'footer-html', cb),
      (cb) => processPart(opts, id, 'cover', cb),
      (cb) => {
        opts.args.push(path.join(temp, `${id}.html`))
        opts.args.push(path.join(temp, `${id}.pdf`))
        cb()
      },
      (cb) => execFile(wkhtmltopdf.path, opts.args, cb)], (err) => {
      if (err) {
        console.error(err)
        res.statusCode = 400
        res.setHeader('Content-Type', 'application/json')
        return res.end(JSON.stringify({
          error: {
            message: err.message,
            stack: err.stack
          }
        }))
      }

      const stream = fs.createReadStream(path.join(temp, `${id}.pdf`))
      stream.pipe(res)
    })
  })
})

server.listen(5000)
