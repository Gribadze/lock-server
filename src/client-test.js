const net = require('net');
const Mutex = require('await-mutex').default;

const socket = net.createConnection(9000);
const mutex = new Mutex();
let currentSender = 0;
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
}

async function sendUnlock(senderId) {
    socket.write(getUnlockCommand(senderId));
    socket.once('data', (data) => {
        unlock();
    })
}

async function someFunc() {
    const senderId = currentSender++;
    await sendLock(senderId);
    console.log('setting lock');
    setTimeout(() => {
        sendUnlock(senderId);
        console.log('time to unlock');
    }, 3000);
}

// test();
someFunc();
someFunc();