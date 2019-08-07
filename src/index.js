const net = require('net');
const Mutex = require('await-mutex').default;

const glMutex = new Mutex();
let lockOwner = null;
let unlockFn = null;

const lockedResponse = 'locked';
const unlockedResponse = 'unlocked';

async function lock(senderId) {
    console.log('locking', senderId);
    const unlock = await glMutex.lock();
    console.log('locked', senderId);
    return unlock;
}

const command = {
    lock: (senderId) => lock(senderId)
        .then((unlock) => {
            lockOwner = senderId;
            unlockFn = unlock;
            return lockedResponse + ' ' + senderId;
        }),
    unlock: (senderId) => {
        console.log('unlocking', senderId);
        if (unlockFn !== null && senderId === lockOwner) {
            unlockFn();
            unlockFn = null;
            console.log('unlocked', senderId);
            return unlockedResponse + ' ' + senderId;
        }
    }
};

async function execCommand({ type, senderId }) {
    try {
        return await command[type](senderId);
    } catch (e) {

    }
}

function parseCommand(buffer) {
    return JSON.parse(buffer.toString());
}

const server = net.createServer(connection => {
    console.log('new connection');
    connection.on('data', (data) => {
        execCommand(parseCommand(data)).then((result) => {
            if (result) {
                connection.write(result + '\n\r');
            }
        });
    });
    connection.on('end', () => { console.log('connection closed') })
});

server.on('error', (err) => {
    throw err;
});

server.listen(9000);