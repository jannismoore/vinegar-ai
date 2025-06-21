import { openaiWhisperService } from '../services/openaiWhisperService.js';
import { openaiService } from '../services/openaiService.js';
import { agentService } from '../services/agentService.js';
import ApiError from '../utils/ApiError.js';
import { ERROR_MESSAGES } from '../constants/messages.js';


export const voiceController = {
    async processVoiceNote(req, res, next) {
        try {
            if (!req.file) {
                throw ApiError.badRequest('No audio file provided', 'voiceController.processVoiceNote');
            }


            const selection = req.body.selection;
            if (selection !== undefined && typeof selection !== 'string') {
                throw ApiError.badRequest('Selection must be a string', 'voiceController.processVoiceNote');
            }

            if (req.body?.agents) {
                try {
                    const agents = typeof req.body.agents === 'string'
                        ? JSON.parse(req.body.agents)
                        : req.body.agents;

                    if (!Array.isArray(agents)) {
                        throw ApiError.badRequest('Agents must be an array', 'voiceController.processVoiceNote');
                    }

                    agentService.loadDynamicAgents(agents, selection);
                } catch (error) {
                    if (error instanceof ApiError) {
                        throw error;
                    }
                    throw ApiError.badRequest(ERROR_MESSAGES.AGENT.INVALID, 'voiceController.processVoiceNote');
                }
            }

            let transcription = await openaiWhisperService.transcribeAudio(
                req.file.buffer,
                req.file.mimetype
            );
            transcription = typeof transcription === 'string' ? transcription.replace(/[\r\n]+$/g, '') : transcription;

            const allAgentCommands = agentService.getAllAgents()
                .flatMap(agent => agent.commands);

            const transcriptionLower = transcription.toLowerCase().trim();
            const hasAgentReference = allAgentCommands.some(keyword => {
                const keywordLower = keyword.toLowerCase().trim();
                return transcriptionLower.startsWith(keywordLower);
            });

            let response;
            if (hasAgentReference) {
                let matchedAgent;

                if (req.body.agent_name) {
                    matchedAgent = agentService.findAgentByName(req.body.agent_name);
                }

                if (!matchedAgent) {
                    matchedAgent = agentService.findAgentByCommand(transcription);
                }

                if (!matchedAgent) {
                    matchedAgent = agentService.getDefaultAgent();
                }

                const openaiTools = matchedAgent.tools
                    ? agentService.formatToolsForOpenAI(matchedAgent.tools)
                    : [];

                const agentResponse = await openaiService.getChatCompletion(
                    transcription,
                    matchedAgent.instructions,
                    openaiTools,
                    selection
                );

                if (typeof agentResponse === 'object' && agentResponse.content) {
                    response = {
                        transcription,
                        agent_response: agentResponse.content,
                    };
                } else {
                    response = {
                        transcription,
                        agent_response: agentResponse
                    };
                }
            } else {
                response = {
                    transcription,
                };
            }

            res.json(response);
        } catch (error) {
            next(error);
        }
    }
};