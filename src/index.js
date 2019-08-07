const net = require('net');
const Mutex = require('await-mutex').default;

const glMutex = new Mutex();
let lockOwner = null;
let unlockFn = null;

const lockedResponse = 'locker';
const unlockedResponse = 'unlocked';

const command = {
    lock: (senderId) => glMutex.lock()
        .then((unlock) => {
            lockOwner = senderId;
            unlockFn = unlock;
            return lockedResponse;
        }),
    unlock: (senderId) => {
        if (unlockFn !== null) {
            unlockFn();
            unlockFn = null;
            return 'unlocked';
        }
    }
};

async function execCommand(commandType) {
    try {
        command[commandType]();
    } catch (e) {

    }
}

const server = net.createServer(connection => {
    console.log('new connection');
    connection.on('data', (data) => {
        execCommand(data.toString()).then((result) => connection.write(result + '\n\r'));
    });
    connection.on('end', () => { console.log('connection closed') })
});

server.on('error', (err) => {
    throw err;
});

server.listen(9000);