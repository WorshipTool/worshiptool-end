const { parentPort } = require('worker_threads'); // přizpůsobte si to podle vaší verze Node.js

console.log('Child thread started', parentPort);

if (parentPort) {
    parentPort.on('message', async (message) => {
        console.log('Child thread received message:', message)
        const { index, data, threadFunction } = message;
        const thread = eval(threadFunction);

        try {
            const result = await thread(index, data);
            parentPort.postMessage(result);
        } catch (error) {
            console.error(error);
            process.exit(1);
        }
    });
}else{
    console.error('Parent port not found');
    process.exit(1);
}