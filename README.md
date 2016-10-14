# s3-ls [![Build Status](https://travis-ci.org/koresar/s3-ls.svg?branch=master)](https://travis-ci.org/koresar/s3-ls)
List contents of an S3 bucket 'folder' 

# Install
```sh
npm i -S s3-ls
```

# Usage
```js
var s3ls = require('s3-ls');

var lister = s3ls({bucket: 'my-bucket-name'});

lister.ls('/my-folder/subfolder/', function (data) {
  console.log(data.files); // ['my-folder/subfolder/file1','my-folder/subfolder/file2']
  console.log(data.folders); // ['my-folder/subfolder/subsub1/','my-folder/subfolder/subsub2/']
});
```

# API

The `s3ls` accepts two options:
* `bucket` - Obligatory. The S3 bucket name
* `s3` - Optional. The `aws-sdk` S3 class instance. For example: `new AWS.S3({apiVersion: '2006-03-01')` 

The `s3ls.ls(path, callback)` function takes:
* `path` - any string. E.g. 
  *  `"/"`, `""`, or
  * `"/folder"`, `"folder/"`, `"folder"`, or
  * `"/1/2/3/4"`, `"1/2/3/4/"`, `"1/2/3/4"`, etc.
* `callback` - node-style callback which resolves to `{files: String[], folders: String[]}` object.

# CLI

## Install
```sh
$ npm i -g s3-ls
```

Usage:
```
s3-ls BUCKET [PATH]
```

Example
```sh
$ s3-ls my-bucket-name my-folder/subfolder/
f1/
f2/
new folder/
funny-cat-gifs-001.gif
$ 
```
