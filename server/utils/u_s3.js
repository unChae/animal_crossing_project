// lib
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');

// config
const aws_crediential = require("../config/aws");

const s3 = new AWS.S3(aws_crediential);

let params = {
  Bucket: 'deac-project',
  ACL: 'public-read-write'
};

let i = 1;

let s3Storage = multerS3({
  s3: s3,
  bucket: params.Bucket,
  key: function(req, file, cb) {
    var bo_id = req.headers.bo_id;
    console.log(file);
    var type = file.mimetype;
    type = type.split('/')[1];
    // let extension = path.extname(file.originalname);
    // let basename = path.basename(file.originalname, extension);
    cb(null, `images/${bo_id}/${i}.${type}`);
    i ++;
  },
  acl: 'public-read-write',
  contentDisposition: 'attachment',
  serverSideEncryption: 'AES256'
});

exports.upload = multer({ storage: s3Storage });
