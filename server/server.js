const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const app = express();

app.use(fileUpload());
app.use(cors({
    origin: "https://www.littlereadingrays.com"
}));

const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
    cors: {
        origin: "https://www.littlereadingrays.com"
    }
});

const fs = require('fs');
const Parser = require('./parserInterface');
const RoomCode = require('./generateRoomCode');
const { SocketAddress } = require('net');

const rooms = {};

// Test endpoint
app.get('/', (req, res) => {
    res.send('<h1>Hello world</h1>');
});

// Handles uploading of files
// Uploads files to a temp folder, then calls the parsing interface to parse
// Attempts to send back the parsed files as well as a room code
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

// Generates a room code for the client
// Use case: When a user has a previous session they wish to re-open
app.post('/generateCode', async (req, res) => {
    const roomCode = RoomCode.generate();
    res.send({
        roomCode: roomCode
    });
});

// Socket.io work
// Events to listen to: [connection, enter-room, update-room, disconnect]
// Events emitting: [update-event, successful-room-entrance, invalid-room]
io.on('connection', (socket) => {
    
    // Whenever a user enters a room, check if they are the first person (if so, they would have a config)
    // If not, they would not have a config and would need to receive the config
    socket.on('enter-room', configObject => {
        const {config, roomCode} = configObject
        if (config) {
            socket.join(roomCode);
            rooms[roomCode] = {
                config: config,
                population: 1
            };
            socket.emit('successful-room-entrance', {room: roomCode, id: socket.id});
        } else {
            // Checks if the room is valid first
            if (!rooms[roomCode]) {
                socket.emit('invalid-room', roomCode);
            } else {
                socket.join(roomCode);
                socket.emit('successful-room-entrance', {room: roomCode, id: socket.id});
                rooms[roomCode].population = rooms[roomCode].population + 1;
                socket.to(roomCode).emit('update-event', rooms[roomCode].config);
            }
        }
    });

    // Updates room config
    socket.on('update-room', configObject => {
        const {config, roomCode} = configObject
        rooms[roomCode].config = config;
        socket.to(roomCode).emit('update-event', rooms[roomCode].config);
    });

    // On disconnect, check if room is empty
    // If so, tear down the config info
    socket.on('disconnect', (reason) => {
        for (const room of socket.rooms) {
            if (room !== socket.id) {
                if (rooms[room].population === 1) {
                    delete rooms[room];
                } else {
                    rooms[room].population = rooms[room].population;
                }
            }
        }
    })
});

server.listen(process.env.PORT || 3000, () => {
    console.log(`listening on *:${process.env.PORT}`);
});