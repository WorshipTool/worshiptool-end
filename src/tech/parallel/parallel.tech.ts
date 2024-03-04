const { fork } = require('child_process');


type prepareType<T> = (count: number) => Promise<T> | T;
type threadType<T, M> = (index: number, data: T) => Promise<M> | M;


export const parallel = async <T,M>(prepare: prepareType<T>, thread: threadType<T, M>, count: number) : Promise<M[]> => {
    if(false){
        // doesnt work because project has to be runned with --experimental-worker flag, i guess. Didnt try it.
        return realParallel(prepare, thread, count);
    }else{
        return fakeParallel(prepare, thread, count);
    }
}


export const fakeParallel = async <T,M>(prepare: prepareType<T>, thread: threadType<T, M>, count: number) : Promise<M[]> => {
    const data = await prepare(count);
    const promises = Array(count).fill(0).map((_, index) => thread(index, data));

    const results = await Promise.all(promises);
    return results;
}



export const realParallel = async <T, M>(prepare: prepareType<T>, thread: threadType<T, M>, count: number): Promise<M[]> => {
    const data = await prepare(count);

    const promises = Array(count).fill(0).map((_, index) => {
        return new Promise<M>((resolve, reject) => {
            const childProcess = fork(__dirname + '/child.js');
            childProcess.on('message', (message: M) => {
                resolve(message);
            });
            childProcess.on('error', reject);
            childProcess.send({ index, data, threadFunction: thread.toString() });
        });
    });

    const results = await Promise.all(promises);
    return results;
}
