import { spawn } from 'child_process';
import * as path from 'path';

// Start Server
const server = spawn('node', [path.join(__dirname, 'server.js')], { stdio: 'inherit' });

// Start Consumer
const consumer = spawn('node', [path.join(__dirname, 'consumer.js')], { stdio: 'inherit' });

// Forward termination signals to children
const cleanup = () => {
    console.log('Shutting down processes...');
    server.kill('SIGTERM');
    consumer.kill('SIGTERM');
    process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

server.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
    cleanup();
});

consumer.on('close', (code) => {
    console.log(`Consumer process exited with code ${code}`);
    cleanup();
});
