var test = require('tape');
var s3ls = require('..');

test('should use aws-sdk if no s3 object instance provided', function (t) {
  var proxyquire = require('proxyquire');
  var s3ls = proxyquire('..', {
    'aws-sdk': {
      S3: function S3(options) {
        t.equal(options.apiVersion, '2006-03-01');
        t.end();
      }
    }
  });

  s3ls({bucket: '1'})
});

test('should throw if bucket name was not provided', function (t) {
  t.throws(s3ls);
  t.throws(s3ls.bind({}));
  t.throws(s3ls.bind({bucket: 123}));
  t.end();
});

test('should pass proper argument to the aws-sdk', function (t) {
  s3ls({
    bucket: 'b',
    s3: {
      listObjectsV2: function listObjectsV2(options, callback) {
        t.equal(options.Bucket, 'b');
        t.equal(options.MaxKeys, 2147483647);
        t.equal(options.Delimiter, '/');
        t.equal(options.Prefix, '');
        t.equal(options.StartAfter, '');
        callback(null, {
          Contents: [],
          CommonPrefixes: [],
          IsTruncated: false
        });
      }
    }
  }).ls('/', t.end);
});

test('should pass proper argument to the aws-sdk for long folders', function (t) {
  var counter = 0;
  s3ls({
    bucket: 'b',
    s3: {
      listObjectsV2: function listObjectsV2(options, callback) {
        counter++;
        if (counter === 2) {
          t.equal(options.Bucket, 'b');
          t.equal(options.MaxKeys, 2147483647);
          t.equal(options.Delimiter, '/');
          t.equal(options.Prefix, 'folder/');
          t.equal(options.ContinuationToken, 'my continuation token');
          return callback(null, {
            Contents: [],
            CommonPrefixes: [],
            IsTruncated: false
          });
        }

        callback(null, {
          Contents: [],
          CommonPrefixes: [{Prefix: 'folder/'}],
          NextContinuationToken: 'my continuation token',
          IsTruncated: false
        });
      }
    }
  }).ls('/', t.end);
});

test('should generate proper tree object', function (t) {
  var counter = 0;
  s3ls({
    bucket: 'b',
    s3: {
      listObjectsV2: function listObjectsV2(options, callback) {
        counter++;
        if (counter === 2) {
          return callback(null, {
            Contents: [{Key: 'folder/file1'}, {Key: 'folder/file2'}],
            CommonPrefixes: [],
            IsTruncated: false
          });
        }

        callback(null, {
          Contents: [],
          CommonPrefixes: [{Prefix: 'folder/'}],
          NextContinuationToken: 'my continuation token',
          IsTruncated: true
        });
      }
    }
  }).ls('/', function (error, data) {
    t.notOk(error);
    t.deepEqual(data, {
      folders: ['folder/'],
      files: ['folder/file1', 'folder/file2']
    });
    t.end();
  });
});
