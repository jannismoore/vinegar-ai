import { Server } from 'socket.io';
import { agentService } from './agentService.js';
import { openaiService } from './openaiService.js';
import WebSocket from 'ws';
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { appConfig } from '../config/config.js';

dotenv.config();

class SocketService {
    constructor() {
        this.io = null;
    }

    initialize(server) {
        this.io = new Server(server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });

        this.setupEventHandlers();
    }

    async setupEventHandlers() {
        this.io.on('connection', (socket) => {
            console.log('Client connected:', socket.id);

            socket.on('startStreaming', async (data) => {
                console.log(data, 'data')
                const { agents } = data;
                if (agents) {
                    try {
                        console.log(agents, 'agents')
                        const parsedAgents = typeof agents === 'string'
                            ? JSON.parse(agents)
                            : agents;
                        agentService.loadDynamicAgents(parsedAgents);
                    } catch (error) {
                        socket.emit('error', { message: 'Invalid agents configuration' });
                        return;
                    }
                }

                const sessionId = uuidv4();
                const ws = await this.createRealtimeWebSocket(sessionId, socket);
                console.log(ws, 'ws')
                if (!ws) {
                    socket.emit('error', { message: 'Failed to establish WebSocket connection' });
                    return;
                }

                socket.on('audioChunk', (audioData) => {
                    console.log(ws.readyState, 'ws.readyState')
                    console.log(WebSocket.OPEN, 'WebSocket.OPEN')

                    if (ws.readyState === WebSocket.OPEN) {
                        const helloAudioBase64 = `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`

                        const message = {
                            type: "input_audio_buffer.append",
                            audio: audioData // Ensure this is Base64-encoded PCM16 audio
                        };
                        ws.send(JSON.stringify(message));
                    }
                });

                socket.on('disconnect', () => {
                    console.log('Client disconnected:', socket.id);
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.close();
                    }
                });

                socket.on('connectionEstablishedOpenAI', () => {
                    console.log('Connection established, sending audio data...');
                    socket.emit('audioChunk', base64Audio);
                });
            });
        });
    }

    async createRealtimeWebSocket(sessionId, socket) {
        try {
            console.log(appConfig.openai.apiKey, 'appConfig.openai.apiKey')
            const response = await fetch('https://api.openai.com/v1/realtime/transcription_sessions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${appConfig.openai.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "input_audio_format": "pcm16",
                    "input_audio_transcription": {
                        "model": "whisper-1",
                        "language": "en"
                    }
                })
            });

            if (!response.ok) {
                console.error('Failed to obtain ephemeral token:', await response.text());
                return null;
            }

            const data = await response.json();
            console.log(data, 'data')
            const clientSecret = data.client_secret?.value;
            console.log(clientSecret, 'clientSecret')
            const ws = new WebSocket(`wss://api.openai.com/v1/realtime?intent=transcription`, {
                headers: {
                    'Authorization': `Bearer ${clientSecret}`,
                    'openai-beta': 'realtime=v1'
                }
            });

            ws.on('open', () => {
                console.log('WebSocket connection established');

                setTimeout(() => {
                    if (ws.readyState === WebSocket.OPEN) {
                        console.log('WebSocket connection verified after 1 second');
                        socket.emit('connectionEstablishedOpenAI');
                    } else {
                        console.error('WebSocket connection not ready after 1 second');
                        socket.emit('error', { message: 'WebSocket connection not ready' });
                    }
                }, 3000);

                // const config = {
                //     "type": "transcription_session.update",
                //     "input_audio_format": "pcm16",  // Supported: pcm16, mulaw
                //     "input_audio_transcription": {
                //         "model": "gpt-4o-transcribe",  // Options: whisper-1, gpt-4o-transcribe, gpt-4o-mini-transcribe
                //         "prompt": "Optional context prompt",
                //         "language": "en"  // Optional language code
                //     },
                //     "turn_detection": {
                //         "type": "server_vad",
                //         "threshold": 0.5,
                //         "prefix_padding_ms": 300,
                //         "silence_duration_ms": 500
                //     },
                //     "input_audio_noise_reduction": {
                //         "type": "near_field"  // Options: near_field, far_field
                //     },
                //     "include": [
                //         "item.input_audio_transcription.logprobs"  // Optional
                //     ]
                // };

                // ws.send(JSON.stringify(config));

            });

            ws.on('message', async (data) => {
                const message = JSON.parse(data);
                console.log(JSON.stringify(message, 'message'))

                if (message.type === 'input_audio_buffer.committed') {
                    // Handle committed audio buffer if needed
                } else if (message.type === 'conversation.item.input_audio_transcription.delta') {
                    const transcriptionDelta = message.delta;
                    socket.emit('transcriptionChunk', {
                        chunk: transcriptionDelta,
                        isPartial: true
                    });
                } else if (message.type === 'conversation.item.input_audio_transcription.completed') {
                    const fullTranscription = message.transcript;
                    socket.emit('transcriptionComplete', {
                        transcription: fullTranscription
                    });
                }
            });

            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
                socket.emit('error', { message: 'WebSocket error occurred' });
            });

            ws.on('close', () => {
                console.log('WebSocket connection closed');
            });

            return ws;
        } catch (error) {
            console.error('Error creating WebSocket connection:', error);
            return null;
        }
    }
}

export const socketService = new SocketService();
