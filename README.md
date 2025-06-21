# Voice Note API

This API allows you to upload voice notes, transcribe them using OpenAI Whisper, and get AI responses when the transcript starts with "Hey Lisa" or similar phrases.

## Features

- Voice note upload and processing
- Audio transcription using OpenAI Whisper
- AI-powered responses based on transcript content
- Support for multiple AI agents (Lisa, Assistant, etc.)
- Docker support for easy deployment

## Prerequisites

- Node.js (v14 or higher)
- OpenAI API key
- Docker (optional, for containerized deployment)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
OPENAI_API_KEY=your_openai_api_key
PORT=3000
NODE_ENV=development
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```

## Docker Deployment

1. Build the Docker image:
   ```bash
   docker-compose build
   ```

2. Run the container:
   ```bash
   docker-compose up
   ```

## API Endpoints

### POST /process-voice

Upload a voice note for processing.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body:
  - `file`: Audio file (WAV, MP3, etc.)
  - `agent_name` (optional): Name of the agent to use for response
  - `agents` (optional): for tools calls
  - `selection` (optional): Any selected text to include in the request

**Response:**
```json
{
    "transcription": "Transcribed text from the audio",
    "agent_response": "AI response based on the transcription",
    "tool_calls": "The tools calls that are used during the execution"
}
```

## License

Apache License 2.0