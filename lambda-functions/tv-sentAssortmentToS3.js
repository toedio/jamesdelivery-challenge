const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const bucketName = process.env.S3_BUCKET_NAME;

exports.handler = (event) => {
    
    event.Records.map(async (record) => {
        var params = {
            Body: record.body, 
            Bucket: bucketName, 
            Key: record.messageId + '.json'
        };
        await s3.putObject(params).promise();
    })  
};