const net = require('net');
const Mutex = require('await-mutex').default;

const socket = net.createConnection(9000);
socket.on('data', (data) => {
  console.log('global data listener', data.toString());
});
const mutex = new Mutex();
let unlock = null;

function getLockCommand(senderId) {
    return JSON.stringify({
        type: 'lock', senderId
    });
}

function getUnlockCommand(senderId) {
    return JSON.stringify({
        type: 'unlock', senderId
    });
}

async function sendLock(senderId) {
    unlock = await mutex.lock();
    socket.write(getLockCommand(senderId));
    return new Promise((resolve) => {
        socket.once('data', (data) => {
            if (/^locked/mg.test(data.toString()) && data.toString().substring(senderId))
                resolve();
        });
    });
}

async function sendUnlock(senderId) {
    socket.write(getUnlockCommand(senderId));
    socket.once('data', (data) => {
        if (/^unlocked/mg.test(data.toString()) && data.toString().substring(senderId))
            unlock();
    })
}

async function someFunc() {
    const senderId = Math.random();
    await sendLock(senderId);
    console.log('setting lock', senderId);
    setTimeout(() => {
        sendUnlock(senderId);
        console.log('time to unlock', senderId);
    }, 10000);
}

// test();
someFunc();
someFunc();