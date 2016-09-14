const http = require('http')
const execFile = require('child_process').execFile
const fs = require('fs')
const wkhtmltopdf = require('wkhtmltopdf-installer')
const uuid = require('uuid').v1
const async = require('async')

const temp = process.env.tempDirectory || ''
console.log(`temp directory ${temp}`)

const processPart = (opts, id, partName, cb) => {
  if (!opts[partName]) {
    return cb()
  }

  fs.writeFile(`${temp}${id}-${partName}.html`, opts[partName], (err) => {
    if (err) {
      return cb(err)
    }

    opts.args.push(`--${partName}`)
    opts.args.push(`${id}-${partName}.html`)
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
    console.log(data)
    const opts = JSON.parse(data)

    const id = uuid()

    async.waterfall([
      (cb) => fs.writeFile(`${temp}${id}.html`, opts.html, cb),
      (cb) => processPart(opts, id, 'header-html', cb),
      (cb) => processPart(opts, id, 'footer-html', cb),
      (cb) => processPart(opts, id, 'cover', cb),
      (cb) => {
        opts.args.push(`${temp}${id}.html`)
        opts.args.push(`${temp}${id}.pdf`)
        console.log(opts.args)
        cb()
      },
      (cb) => execFile(wkhtmltopdf.path, opts.args, cb)], (err) => {
      console.log('done')
      if (err) {
        res.statusCode = 500
        res.setHeader('Content-Type', 'text/plain')
        return res.end('Error when executing wkhtmltopdf ' + err.stack)
      }

      const stream = fs.createReadStream(`${temp}${id}.pdf`)
      stream.pipe(res)
    })
  })
})

server.listen(5000)
