'use strict'

const fs = require('fs')
const { join } = require('path')
const { fs: memfs, vol } = require('memfs')
const sinon = require('sinon')
const { stub } = sinon
const { expect } = require('@hapi/code')
const proxy = require('./require-proxy')
const { patchRequire } = require('fs-monkey')

const loadAll = require('.')

function createFilesystem (layout, usesRequire = false) {
  const root = `/test/resources/${Math.random().toString(36).substring(2, 8)}`
  vol.fromJSON(layout, root)

  stub(fs, 'readdirSync').callsFake(memfs.readdirSync)
  stub(fs, 'statSync').callsFake(memfs.statSync)
  if (usesRequire) {
    patchRequire(vol)
  } else {
    stub(proxy, 'load').callsFake(arg => [ `loaded ${arg}!` ])
  }
  return root
}

function destroyFilesystem () {
  fs.readdirSync.restore()
  fs.statSync.restore()
  proxy.load.restore && proxy.load.restore()
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
          './dir1/index.js': 'module.exports={ dir1: "loaded!" }',
          './dir2/index.js': 'module.exports={ dir2: "loaded!" }',
          './dir3/index.js': 'module.exports={ dir3: "loaded!" }',
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
      afterEach(() => {
        destroyFilesystem()
      })

      it('sees dirs', () => {
        const root = createFilesystem({
          './dir1/index.js': 'module.exports={ dir1: "loaded!" }',
          './dir2/index.js': 'module.exports={ dir2: "loaded!" }',
          './dir3/index.js': 'module.exports={ dir3: "loaded!" }',
        }, true)

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

      it('is passed previous', () => {
        const root = createFilesystem({
          './dir1/index.js': 'module.exports={ dir1: "loaded!", sameKey: 1 }',
          './dir2/index.js': 'module.exports={ dir2: "loaded!", sameKey: 1 }',
          './dir3/index.js': 'module.exports={ dir3: "loaded!", sameKey: 1 }',
        }, true)

        expect(
          loadAll.exportDir(root, undefined, (m, prev) => {
            return { ...m, sameKey: m.sameKey + (prev.sameKey || 0) }
          })
        ).to.equal({
          dir1: 'loaded!',
          dir2: 'loaded!',
          dir3: 'loaded!',
          sameKey: 3
        })
      })
    })

    context('two directories and a file', () => {
      let root
      beforeEach(() => {
        root = createFilesystem({
          './dir1/index.js': 'module.exports={ dir1: "loaded!" }',
          './file2.js': 'module.exports={ dir2: "loaded!" }',
          './dir3/index.js': 'module.exports={ dir3: "loaded!" }',
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
