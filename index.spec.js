'use strict'

const fs = require('fs')
const { join, basename } = require('path')
const { fs: memfs, vol } = require('memfs')
const sinon = require('sinon')
const { stub } = sinon
const { expect } = require('code')
const proxy = require('./require-proxy')
const loadAll = require('.')

function createFilesystem (layout, usesRequire = false) {
  const root = `/test/resources/${Math.random().toString(36).substring(2, 8)}`
  vol.fromJSON(layout, root)

  stub(fs, 'readdirSync').callsFake(memfs.readdirSync)
  stub(fs, 'statSync').callsFake(memfs.statSync)
  if (usesRequire) {
    stub(proxy, 'load').callsFake(arg => ({ [basename(arg)]: 'loaded!' }))
  } else {
    stub(proxy, 'load').callsFake(arg => `loaded ${arg}!`)
  }
  return root
}

function destroyFilesystem () {
  fs.readdirSync.restore()
  fs.statSync.restore()
  proxy.load.restore()
}

describe('load-all', () => {
  describe('#includeDir()', () => {
    context('with three directories', () => {
      let root
      beforeEach(() => {
        root = createFilesystem({
          './dir1/index.js': '',
          './dir2/index.js': '',
          './dir3/index.js': '',
        })
      })

      afterEach(() => {
        destroyFilesystem()
      })

      it('sees dirs', () => {
        expect(
          loadAll.includeDir(root)
        ).to.equal([
          `loaded ${join(root, 'dir1!')}`,
          `loaded ${join(root, 'dir2!')}`,
          `loaded ${join(root, 'dir3!')}`
        ])
      })
    })

    context('with modifier', () => {
      let root
      beforeEach(() => {
        root = createFilesystem({
          './dir1/index.js': '',
          './dir2/index.js': '',
          './dir3/index.js': '',
        })
      })

      afterEach(() => {
        destroyFilesystem()
      })

      it('sees dirs', () => {
        expect(
          loadAll.includeDir(root, undefined, m => ({ filename: m }))
        ).to.equal([
          { filename: `loaded ${join(root, 'dir1')}!` },
          { filename: `loaded ${join(root, 'dir2')}!` },
          { filename: `loaded ${join(root, 'dir3')}!` }
        ])
      })
    })

    context('two directories and a file', () => {
      let root
      beforeEach(() => {
        root = createFilesystem({
          './dir1/index.js': '',
          './file2.js': '',
          './dir3/index.js': '',
        })
      })

      afterEach(() => {
        destroyFilesystem()
      })

      it('sees dirs', () => {
        expect(
          loadAll.includeDir(root)
        ).to.equal([
          `loaded ${join(root, 'dir1')}!`,
          `loaded ${join(root, 'dir3')}!`
        ])
      })
    })
  })

  describe('#exportDir()', () => {
    context('with three directories', () => {
      let root
      beforeEach(() => {
        root = createFilesystem({
          './dir1/index.js': '',
          './dir2/index.js': '',
          './dir3/index.js': '',
        }, true)
      })

      afterEach(() => {
        destroyFilesystem()
      })

      it('sees dirs', () => {
        expect(
          loadAll.exportDir(root)
        ).to.equal({
          dir1: 'loaded!',
          dir2: 'loaded!',
          dir3: 'loaded!'
        })
      })
    })

    context('with modifier', () => {
      let root
      beforeEach(() => {
        root = createFilesystem({
          './dir1/index.js': '',
          './dir2/index.js': '',
          './dir3/index.js': '',
        }, true)
      })

      afterEach(() => {
        destroyFilesystem()
      })

      it('sees dirs', () => {
        expect(
          loadAll.exportDir(root, undefined, m => {
            const filename = Object.keys(m)
            return { [filename]: { filename: m[filename] } }
          })
        ).to.equal({
          dir1: { filename: 'loaded!' },
          dir2: { filename: 'loaded!' },
          dir3: { filename: 'loaded!' }
        })
      })
    })

    context('two directories and a file', () => {
      let root
      beforeEach(() => {
        root = createFilesystem({
          './dir1/index.js': '',
          './file2.js': '',
          './dir3/index.js': '',
        }, true)
      })

      afterEach(() => {
        destroyFilesystem()
      })

      it('sees dirs', () => {
        expect(
          loadAll.exportDir(root)
        ).to.equal({
          dir1: 'loaded!',
          dir3: 'loaded!'
        })
      })
    })
  })
})
