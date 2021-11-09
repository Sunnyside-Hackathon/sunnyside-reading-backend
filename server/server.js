const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const app = express();

app.use(fileUpload());
app.use(cors({
    origin: ['*'],
    credentials: false,
    methods: ['GET', 'POST']
}));

const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
    cors: {
        origin: ['*'],
        credentials: false,
        methods: ['GET', 'POST']
    }
});

const fs = require('fs');
const Parser = require('./parserInterface');
const RoomCode = require('./lib/generateRoomCode');

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

    if (!fs.existsSync(`${__dirname}/temp`)) {
        fs.mkdirSync(`${__dirname}/temp`)
    }

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
    const roomCode = RoomCode.generate();
    res.send({
        roomCode: roomCode,
        data: data
    });
});

app.post('/generateCode', async (req, res) => {
    const roomCode = RoomCode.generate();
    res.send({
        roomCode: roomCode
    });
});

io.on('connection', (socket) => {
    socket.on('enter-room', roomCode => {
        socket.join(roomCode);
    });

    socket.on('update-room', (roomCode, config) => {
        socket.to(roomCode).emit('update-event', config);
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});