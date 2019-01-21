'use strict'

const proxy = require('./require-proxy')
const { join } = require('path')
const fs = require('fs')

function resovleAbsolutePath (dir, file, kind) {
  const absolutePath = join(dir, file)
  const isSubDirectory = fs.statSync(absolutePath).isDirectory()
  if (isSubDirectory) {
    if (kind) {
      console.log(`Adding ${kind} from ${file}`)
    }
    return absolutePath
  }
  return undefined
}

function loadFiles (dir, fn, kind, initial) {
  return fs.readdirSync(dir)
    .reduce((curr, file) => {
      const absolutePath = resovleAbsolutePath(dir, file, kind)
      return absolutePath ? fn(curr, absolutePath) : curr
    }, initial)
}

exports.includeDir = function (dir, kind, modifier = m => m) {
  return loadFiles(dir, (curr, absolutePath) => {
    const modified = modifier(proxy.load(absolutePath))
    return [ ...curr, modified ]
  }, kind, [])
}

exports.exportDir = function (dir, kind, modifier = m => m) {
  return loadFiles(dir, (curr, absolutePath) => {
    const exported = proxy.load(absolutePath)
    return { ...curr, ...modifier(exported) }
  }, kind, {})
}
