'use strict';

// Code reused from https://github.com/benjaminadk/gif-encoder-2 example
const GIFEncoder = require('gif-encoder-2');
const { createCanvas, Image } = require('canvas');
const { readdir } = require('fs').promises;
const { createWriteStream } = require('fs');
const path = require('path'); 

const { buildFolder } = require('./preBuildGif');

const imagesFolder = '/tmp';

module.exports.createGif = async (ipa) => {

    console.log('Attempting to build Prefolder');
    await buildFolder(ipa);

    console.log('Attempting to Create Gif from built folder');
    return new Promise(async resolve1 => {
        try {
            const files = await readdir(imagesFolder);

            const [width, height] = [290, 368];

            const dstPath = path.join(imagesFolder, 'test.gif');
            const writeStream = createWriteStream(dstPath);

            writeStream.on('close', () => {
                console.log('Closing building gif now');
                resolve1();
            });

            const encoder = new GIFEncoder(width, height, 'octree');
            encoder.createReadStream().pipe(writeStream);
            encoder.start();
            encoder.setDelay(200);

            const canvas = createCanvas(width, height);
            const ctx = canvas.getContext('2d');

            for (const file of files) {
                await new Promise(resolve2 => {
                    console.log('Building Gif now');
                    const image = new Image();
                    image.onload = () => {
                        console.log('Loaded image');
                        ctx.drawImage(image, 0, 0)
                        encoder.addFrame(ctx);
                        resolve2();
                    }
                    console.log('Adding Source');
                    image.src = path.join(imagesFolder, file);
                })
            }
            encoder.finish();
        } catch (e) {
            console.log(e);
        }
    });
};