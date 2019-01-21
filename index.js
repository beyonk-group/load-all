'use strict'

const proxy = require('./require-proxy')
const { join } = require('path')
const fs = require('fs')

exports.includeDir = function (dir, kind, modifier = m => m) {
  return fs.readdirSync(dir)
    .reduce((curr, file) => {
      const absolutePath = join(dir, file)
      const isSubDirectory = fs.statSync(absolutePath).isDirectory()
      if (isSubDirectory) {
        if (kind) {
          console.log(`Adding ${kind} from ${file}`)
        }
        const modified = modifier(proxy.load(absolutePath))
        curr = curr.concat(modified)
      }
      return curr
    }, [])
}

exports.exportDir = function (dir, kind, modifier = m => m) {
  return fs.readdirSync(dir)
    .reduce((curr, file) => {
      const absolutePath = join(dir, file)
      const isSubDirectory = fs.statSync(absolutePath).isDirectory()
      if (isSubDirectory) {
        if (kind) {
          console.log(`Adding ${kind} from ${file}`)
        }
        const exported = proxy.load(absolutePath)
        Object.assign(curr, modifier(exported))
      }
      return curr
    }, {})
}
