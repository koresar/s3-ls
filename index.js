const trimStart = (s, ch) => (s[0] === ch ? trimStart(s.substr(1), ch) : s);
const trimEnd = (s, ch) =>
  s[s.length - 1] === ch ? trimEnd(s.substr(0, s.length - 1), ch) : s;

module.exports = function S3LS(options) {
  if (!options || typeof options.bucket !== "string") {
    throw new Error("Bad 'bucket'");
  }

  const bucket = options.bucket;
  const s3 =
    options.s3 || new (require("aws-sdk")).S3({ apiVersion: "2006-03-01" });

  return {
    ls(path) {
      const prefix = trimStart(trimEnd(path, "/") + "/", "/");
      const result = { files: [], folders: [] };

      function s3ListCheckTruncated(data) {
        result.files = result.files.concat(
          (data.Contents || [])
        );
        result.folders = result.folders.concat(
          (data.CommonPrefixes || [])
        );

        if (data.IsTruncated) {
          return s3
            .listObjectsV2({
              Bucket: bucket,
              MaxKeys: 2147483647, // Maximum allowed by S3 API
              Delimiter: "/",
              Prefix: prefix,
              ContinuationToken: data.NextContinuationToken
            })
            .promise()
            .then(s3ListCheckTruncated);
        }

        return result;
      }

      return s3
        .listObjectsV2({
          Bucket: bucket,
          MaxKeys: 2147483647, // Maximum allowed by S3 API
          Delimiter: "/",
          Prefix: prefix,
          StartAfter: prefix // removes the folder name from listing
        })
        .promise()
        .then(s3ListCheckTruncated);
    }
  };
};
