const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

app.use(fileUpload());

const http = require('http');
const server = http.createServer(app);

const Parser = require('./parserInterface');

app.get('/', (req, res) => {
    res.send('<h1>Hello world</h1>');
});

app.post('/upload', async (req, res) => {

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    const fileMove = (file, uploadPath) => {
        return new Promise(resolve => {
            file.mv(uploadPath, (err) => resolve(err));
        })
    }
    
    const asyncFileMove = async (file, uploadPath) => {
        return await fileMove(file, uploadPath);
    }

    const filenames = [];

    for (const filename of Object.keys(req.files)) {
        const name = req.files[filename].name;
        filenames.push(name);
        const uploadPath = `${__dirname}/temp/${name}`;
        console.log(uploadPath);

        try {
            const value = await asyncFileMove(req.files[filename], uploadPath);
            console.log(value);
        } catch(e) {
            console.log(e);
        }
    }
    const data = await Parser.process(filenames);
    console.log(data);
    res.send(data);
  });

server.listen(3000, () => {
    console.log('listening on *:3000');
})