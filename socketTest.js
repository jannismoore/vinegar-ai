import { io } from 'socket.io-client';
import fs from 'fs';

// Connect to the Socket.IO server
const socket = io('http://localhost:3000'); // Replace with your server URL and port

// Read audio file and convert to base64 in chunks
const audioFilePath = "./jannis.wav"; // Replace with your audio file path
const CHUNK_SIZE = 1024; // Define the size of each chunk

if (socket) {
    console.log("socket connected");
    // Emit startStreaming event with any necessary data
    socket.emit('startStreaming', {
        agents: [], // Add any agent configurations if needed
        agent_name: 'lisa',
        selection: ''
    });

    // Listen for responses from the server
    socket.on('transcriptionChunk', (data) => {
        console.log('Received transcription chunk:', data);
    });

    socket.on('transcriptionComplete', (data) => {
        console.log('Transcription complete:', data);
    });

    socket.on('connectionEstablishedOpenAI', () => {
        console.log('Connection established, sending audio data...');

        // Create a read stream for the audio file
        const readStream = fs.createReadStream(audioFilePath, { highWaterMark: CHUNK_SIZE });

        readStream.on('data', (chunk) => {
            const base64Chunk = chunk.toString('base64');
            socket.emit('audioChunk', base64Chunk);
        });

        readStream.on('end', () => {
            console.log('All audio chunks sent');
        });

        readStream.on('error', (error) => {
            console.error('Error reading audio file:', error);
        });
    });

    socket.on('error', (error) => {
        console.error('Error:', error);
    });
}