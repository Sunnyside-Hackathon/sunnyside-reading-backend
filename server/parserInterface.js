const fs = require('fs');

const spawn = require("child_process").spawn;
const pythonProcess = spawn('python', ['./parser.py', 'arg1', 'arg2']);

pythonProcess.stdout.on('data', (data) => {
    console.log(data.toString('utf8'));
});