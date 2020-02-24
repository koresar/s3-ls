# s3-ls [![Build Status](https://travis-ci.org/koresar/s3-ls.svg?branch=master)](https://travis-ci.org/koresar/s3-ls)

List contents of an S3 bucket 'folder'. Node.js module and command line executable.

For deep recursive listing of an S3 'folder' contents see the sibling project [`s3-tree`](https://github.com/koresar/s3-tree).

# Install

```bash
npm i -S s3-ls
```

# Usage

```js
const s3ls = require("s3-ls");

const lister = s3ls({ bucket: "my-bucket-name" });

const { files, folders } = await lister.ls("/my-folder/subfolder/");
console.log(files); // ['my-folder/subfolder/file1','my-folder/subfolder/file2']
console.log(folders); // ['my-folder/subfolder/subsub1/','my-folder/subfolder/subsub2/']
```

# API

The `s3ls` accepts two options:

- `bucket` - Obligatory. The S3 bucket name
- `s3` - Optional. The `aws-sdk` S3 class instance. For example: `new AWS.S3({apiVersion: '2006-03-01'})`

The `s3ls.ls(path)` function takes:

- `path` - any string. E.g.
  - `"/"`, `""`, or
  - `"/folder"`, `"folder/"`, `"folder"`, or
  - `"/1/2/3/4"`, `"1/2/3/4/"`, `"1/2/3/4"`, etc.

# CLI

## No install

```bash
npx s3-ls my-bucket-name my-folder/subfolder/
```

## Install

```bash
$ npm i -g s3-ls
```

Usage:

```bash
s3-ls BUCKET [PATH]
```

Example

```bash
$ s3-ls my-bucket-name my-folder/subfolder/
f1/
f2/
new folder/
funny-cat-gifs-001.gif
$
```

# CHANGELOG

## v1.0

- Node callbacks interface. No Promises. See README [here](https://github.com/koresar/s3-ls/tree/v1.0.1).
- The optional `aws-sdk` dependency version was `>=2.0.0 <3.0.0`.

## v2.0

- Only promises are supported now. For node callbacks use `s3ls.ls(path).then(r => cb(null, r), cb)`
- The optional `aws-sdk` dependency version is `>=2.3.0 <3.0.0` now.

## v3.0

- Drop node.js 0.10, 4, 5 support. Add node.js 9, 10 support. Remove lodash dependencies.
- No any other changes. Same API as always.
