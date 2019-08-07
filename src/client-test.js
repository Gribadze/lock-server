const Mutex = require('../../server/src/server/blockchain/mutex').default;

const mutex = new Mutex();

async function someFunc() {
    const unlock = await mutex.lock();
    console.log('setting lock');
    setTimeout(() => {
        unlock();
        console.log('time to unlock');
    }, 3000);
}

async function test() {
    await someFunc();
    await someFunc();
}

// test();
someFunc();
someFunc();