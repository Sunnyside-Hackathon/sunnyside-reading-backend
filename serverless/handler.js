'use strict';

const axios = require('axios');
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

const findIPA = require('./lib/findIPA').find;
const { createGif } = require('./lib/gif_encoder');
const { uploadGif } = require('./lib/uploadGifToS3');

module.exports.main = async (event) => {

  console.log(event);
  const { word } = JSON.parse(event.body);

  try {
    let params = {
      TableName: process.env.TABLE,
      KeyConditionExpression: 'word = :hashKey and begins_with(definitionNum, :sortKey) ',
      ExpressionAttributeValues: {
        ':hashKey': word,
        ':sortKey': 'def'
      }
    };

    let res = await docClient.query(params).promise();

    if (res.Items.length > 0) {
      return {
        statusCode: 200,
        body: JSON.stringify(
          {
            word: word,
            definition: res.Items[0].definition,
            audio: res.Items[0].audio,
            gif: res.Items[0].gif,
          },
          null,
          2
        )
      };
    }

    const url = `https://dictionaryapi.com/api/v3/references/learners/json/${word}?key=${process.env.DICTIONARYKEY}`;

    const dictionaryRes = await axios.get(url);
    const ipa = findIPA(dictionaryRes.data, word);

    let gif = '';
    if (ipa !== '') {
      console.log('Attempting to Create Gif');
      try {
        await createGif(ipa);
      } catch(e) {
        console.log(e);
      }
      

      console.log('Finished creating gif');

      gif = await uploadGif(word);
      console.log(gif);
    }

    const firstDef = dictionaryRes.data[0];
    let audio = firstDef.hwi?.prs[0]?.sound;
    let audioLink = '';
    if (!audio) {
      audioLink = ''
    }
    else {
      audioLink = `https://media.merriam-webster.com/audio/prons/en/us/mp3/${audio.audio[0]}/${audio.audio}.mp3`;
    }

    const wordObj = {
      word: word,
      definitionNum: 'def-1',
      definition: firstDef.shortdef[0],
      audio: audioLink,
      gif: gif
    };

    console.log(wordObj);

    params = {
      TableName: process.env.TABLE,
      Item: wordObj
    };

    res = await docClient.put(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify(wordObj, null, 2),
    };

  } catch (e) {
    console.log(e);
  }
};