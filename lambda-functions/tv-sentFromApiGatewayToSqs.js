const AWS = require('aws-sdk');
const sqs = new AWS.SQS();
const sqsQueueUrl = process.env.SQS_QUEUE_URL;
const lambdaName = process.env.AWS_LAMBDA_FUNCTION_NAME;

const successResponse = {
    error: false,
    message: "Success",
};

const errorResponse = {
    error: true,
    message: "Internal server error",
};
    
exports.handler = async (body, event) => {
    
    var sqsMessage = JSON.stringify(body);

    var params = {
        MessageBody: sqsMessage,
        QueueUrl: sqsQueueUrl,
        MessageDeduplicationId: event.awsRequestId,
        MessageGroupId: lambdaName
    };
    
    await sqs.sendMessage(params).promise();
    
    return successResponse;
};