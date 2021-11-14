const fs = require('fs');
const path = require('path');
const aws = require('aws-sdk');
const s3 = new aws.S3();

module.exports.uploadGif = async (word) => {
    const imagePath = path.join('/tmp', 'test.gif');
    const fileContent = fs.readFileSync(imagePath);

    const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: `${word}.gif`,
        Body: fileContent
    };

    const data = await s3.upload(params).promise();

    return data.Location;
}