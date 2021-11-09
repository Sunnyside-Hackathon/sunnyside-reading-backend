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
        try {
            const spawn = require("child_process").spawn;
            const pythonProcess = spawn('python3', ['./parser.py', filename]);

            const result = await asyncProcessData(pythonProcess);
            const data = {
                name: filename,
                text: result.toString('utf8')
            }
            parsedData.push(data);
        } catch (e) {
            parsedData.push({
                name: filename,
                text: e
            });
        }
    }

    return parsedData;
}