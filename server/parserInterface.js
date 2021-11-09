module.exports.process = async (filenames) => {
    const processData = (pProcess) => {
        return new Promise(resolve => {
            pProcess.stdout.on('data', (data) => resolve(data));
        })
    }

    const asyncProcessData = async (pProcess) => {
        return await processData(pProcess);
    }

    const parsedData = [];

    for (const filename of filenames) {
        const spawn = require("child_process").spawn;
        const pythonProcess = spawn('python', ['./parser.py', filename]);

        const result = await asyncProcessData(pythonProcess);
        const data = {
            name: filename,
            text: result.toString('utf8')
        }
        parsedData.push(data);
    }

    return parsedData;
}