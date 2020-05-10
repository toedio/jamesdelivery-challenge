const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const sqs = new AWS.SQS();
const sqsQueueUrl = process.env.SQS_QUEUE_URL;

exports.handler = (event) => {
    
    event.Records.forEach(async (record) => {
        var key = record.s3.object.key;
        
        if(key.indexOf('/') >= 0)
            return;
        
         var params = {
            Bucket: record.s3.bucket.name, 
            Key: record.s3.object.key, 
            
        };
        var file = await s3.getObject(params).promise();
        var store = JSON.parse(file.Body.toString())
        
        store.categories.forEach(async (category) => {
             var params = {
                MessageBody: JSON.stringify(category),
                QueueUrl: sqsQueueUrl,
                MessageDeduplicationId: category.gpaId.toString(),
                MessageGroupId: store.storeId.toString()
            };
    
            await sqs.sendMessage(params).promise();
        });
    });
};
