const fs = require('fs').promises;
const path = require('path'); 
const { IPATABLE } = require('./ipaTable');

const imagesFolder = path.join(__dirname, 'img', 'Phonemes');
const buildFolder = '/tmp';

module.exports.buildFolder = async (ipa) => {
    console.log(ipa);
    // const files = await fs.readdir(imagesFolder);
    // for (const file of files) {
    //     console.log(file);
    // }
    let count = 1;
    for (let i = 0; i < ipa.length; i++) {
        if (IPATABLE.hasOwnProperty(ipa[i])) {
            const imageNames = IPATABLE[ipa[i]];
            for (const imageName of imageNames) {
                try {
                    const filepath = path.join(imagesFolder, `${imageName}.png`);
                    await fs.copyFile(filepath, path.join(buildFolder, `${count}.png`));
                    count = count + 1;
                } catch (e) {
                    console.log(e);
                }
            }
        }
    }
};