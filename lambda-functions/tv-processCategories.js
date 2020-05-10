const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const bucketName = process.env.S3_BUCKET_NAME;
const prefix = process.env.S3_PREFIX;

exports.handler = (event) => {
    
    var date = new Date();
    var month = date.getUTCMonth() + 1;
    var day = date.getUTCDate();
    var year = date.getUTCFullYear();

    var dateKey = year + "/" + month + "/" + day;
    
    event.Records.map(async (record) => {
        var category = JSON.parse(record.body);
    
        var params = {
            Body: record.body, 
            Bucket: bucketName, 
            Key: `${prefix}/${dateKey}/arquivoProcessadoCategoria${category.title}.json`
        };
        await s3.putObject(params).promise();
    })
};