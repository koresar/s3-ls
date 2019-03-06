const test = require("tape");
const s3ls = require("..");

test("should use aws-sdk if no s3 object instance provided", t => {
  const proxyquire = require("proxyquire");
  const s3ls = proxyquire("..", {
    "aws-sdk": {
      S3: function S3(options) {
        t.equal(options.apiVersion, "2006-03-01");
        t.end();
      }
    }
  });

  s3ls({ bucket: "1" });
});

test("should throw if bucket name was not provided", t => {
  t.throws(s3ls);
  t.throws(s3ls.bind(null, {}));
  t.throws(s3ls.bind(null, { bucket: 123 }));
  t.end();
});

test("should pass proper argument to the aws-sdk", t => {
  t.plan(5);
  s3ls({
    bucket: "b",
    s3: {
      listObjectsV2(options) {
        t.equal(options.Bucket, "b");
        t.equal(options.MaxKeys, 2147483647);
        t.equal(options.Delimiter, "/");
        t.equal(options.Prefix, "");
        t.equal(options.StartAfter, "");
        return {
          promise() {
            return Promise.resolve({
              Contents: [],
              CommonPrefixes: [],
              IsTruncated: false
            });
          }
        };
      }
    }
  })
    .ls("/")
    .catch(t.end);
});

test("should pass proper argument to the aws-sdk for long folders", t => {
  t.plan(10);
  let counter = 0;
  s3ls({
    bucket: "b",
    s3: {
      listObjectsV2(options) {
        counter++;
        if (counter === 2) {
          t.equal(options.Bucket, "b");
          t.equal(options.MaxKeys, 2147483647);
          t.equal(options.Delimiter, "/");
          t.equal(options.Prefix, "");
          t.equal(options.ContinuationToken, "my continuation token");
          return {
            promise() {
              return Promise.resolve({
                Contents: [],
                CommonPrefixes: [],
                IsTruncated: false
              });
            }
          };
        }

        t.equal(options.Bucket, "b");
        t.equal(options.MaxKeys, 2147483647);
        t.equal(options.Delimiter, "/");
        t.equal(options.Prefix, "");
        t.equal(options.StartAfter, "");

        return {
          promise() {
            return Promise.resolve({
              Contents: [],
              CommonPrefixes: [{ Prefix: "folder/" }],
              NextContinuationToken: "my continuation token",
              IsTruncated: true
            });
          }
        };
      }
    }
  })
    .ls("/")
    .catch(t.end);
});

test("should generate proper tree object", t => {
  t.plan(1);
  let counter = 0;
  s3ls({
    bucket: "b",
    s3: {
      listObjectsV2() {
        counter++;
        if (counter === 2) {
          return {
            promise() {
              return Promise.resolve({
                Contents: [{ Key: "folder/file1" }, { Key: "folder/file2" }],
                CommonPrefixes: [],
                IsTruncated: false
              });
            }
          };
        }
        return {
          promise() {
            return Promise.resolve({
              Contents: [],
              CommonPrefixes: [{ Prefix: "folder/" }],
              NextContinuationToken: "my continuation token",
              IsTruncated: true
            });
          }
        };
      }
    }
  })
    .ls("/")
    .then(data => {
      t.deepEqual(data, {
        folders: ["folder/"],
        files: ["folder/file1", "folder/file2"]
      });
    })
    .catch(t.end);
});
