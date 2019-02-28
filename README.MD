<p align="center">
  <img width="186" height="90" src="https://user-images.githubusercontent.com/218949/44782765-377e7c80-ab80-11e8-9dd8-fce0e37c235b.png" alt="Beyonk" />
</p>

## Load All

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com) [![CircleCI](https://circleci.com/gh/beyonk-adventures/load-all.svg?style=shield)](https://circleci.com/gh/beyonk-adventures/load-all)

Loads the contents of sub-directories of a specified directory into an object or an array, suitable for mass loading of small modules from a filesystem.

This library is used extensively at Beyonk for loading route mappings, validations, error objects, and anywhere where a large number of small modules needs to be loaded.

## Installation

```js
npm i -D @beyonk/load-all
```

## Usage

The library only has two methods, both of which amalgamate all exported items from a list of files.

### exportDir

`exportDir` which results in a hash of `export name -> function ()`, so that a directory structured thusly:

```
/my-dir
|-- library1
|   `-- index.js
|-- library2and3
|   `-- index.js
| ...
```

can be imported with:

```
const exported = exportDir('/my-dir')

// {
// library1: (exported as `library` from library1.js),
// library2: (exported as `library2` from library2and3.js),
// library3: (exported as `library3` from library2and3.js)
// }
``

### includeDir

`includeDir` results in a concatenated array of the contents of files (which should export an array themselves), so that a directory structured thusly:

```
/routes
|-- routes1
|   `-- index.js
|-- routes2and3
|   `-- index.js
| ...
```

can be imported with:

```
const routes = includeDir('/my-dir')

// [ route1, route2, route3 ]
```

## Advanced usage

### Logging

The library will let you know every file it is loading, if you specify the second parameter to any method:

```
includeDir('/some-dir', 'route')

will result in log messages similar to the following:

// Adding route from ./some-dir/my-route
```

### Modifying file content

You can modify the content of the files you load before it is put into the final hash or array, if you, for instance, would like to capitalise the key names, or add metadata or similar.

```
const { capitalize } = require('lodash')

includeDir('/some-dir', 'some-label', exported => {
  return Object.keys(exported).reduce((acc, exportName) {
    acc[capitalize(exportName)] = exported[exportName]
    return acc
  }, {})
})
```

## Developing

You can run the suite of unit tests with

```
npm run test
```

code is linted according to [@beyonk/eslint-config](https://npmjs.com/@beyonk/eslint-config)
