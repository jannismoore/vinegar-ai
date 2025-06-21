import OpenAI from 'openai';
import { appConfig } from '../config/config.js';
import axios from 'axios';

class OpenAIService {
    constructor() {
        this.openai = new OpenAI({
            apiKey: appConfig.openai.apiKey
        });
    }

    async getChatCompletion(transcript, systemPrompt = appConfig.openai.systemPrompt, tools = [], selection = '') {
        try {
            const messages = [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: selection && selection.trim()
                        ? `${transcript}\n\n### Content\n${selection}`
                        : transcript
                }
            ];

            const requestOptions = {
                model: appConfig.openai.model,
                messages: messages
            };

            if (tools && tools.length > 0) {
                requestOptions.tools = tools;
                requestOptions.tool_choice = "auto";
            }

            console.log(requestOptions, 'requestOptions');

            const completion = await this.openai.chat.completions.create(requestOptions);

            const message = completion.choices[0].message;

            if (message.tool_calls && message.tool_calls.length > 0) {
                const toolCalls = message.tool_calls;
                const toolResponses = await this.executeToolCalls(toolCalls, tools);

                messages.push(message);

                messages.push(...toolResponses);

                const followUpCompletion = await this.openai.chat.completions.create({
                    model: appConfig.openai.model,
                    messages: messages
                });

                return {
                    content: followUpCompletion.choices[0].message.content,
                    tool_calls: toolCalls
                };
            }

            return message.content;
        } catch (error) {
            console.error('OpenAI completion error:', error);
            throw new Error('Failed to get AI response');
        }
    }

    /**
     * Execute tool calls by sending requests to the appropriate servers
     * @param {Array} toolCalls - Array of tool calls from OpenAI
     * @param {Object} agentTools - The agent's tools configuration
     * @returns {Array} - Array of tool response messages
     */
    async executeToolCalls(toolCalls, agentTools = []) {
        const toolResponses = [];

        for (const toolCall of toolCalls) {
            try {
                const { id, function: { name, arguments: args } } = toolCall;
                const parsedArgs = JSON.parse(args);


                const toolConfig = agentTools.find(tool =>
                    tool.function && tool.function.name === name
                );

                const response = await this.callRemoteFunction(
                    name,
                    parsedArgs,
                    toolConfig ? toolConfig.server : null
                );

                toolResponses.push({
                    role: "tool",
                    tool_call_id: id,
                    name: name,
                    content: JSON.stringify(response)
                });

            } catch (error) {
                console.error(`Error executing tool call:`, error);
                toolResponses.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    name: toolCall.function.name,
                    content: JSON.stringify({ error: `Failed to execute tool call: ${error.message}` })
                });
            }
        }

        return toolResponses;
    }

    /**
     * Make a remote function call to the specified server
     * @param {string} functionName - Name of the function to call
     * @param {Object} args - Arguments for the function
     * @param {Object} serverInfo - Server information (URL, headers)
     * @returns {Object} - Response from the remote function
     */
    async callRemoteFunction(functionName, args, serverInfo = null) {
        try {

            console.log(serverInfo, 'serverInfo');
            if (serverInfo && serverInfo.url) {
                const response = await axios({
                    method: serverInfo.method || 'post',
                    url: serverInfo.url,
                    headers: serverInfo.headers || {},
                    data: {
                        function: functionName,
                        arguments: args
                    },
                    timeout: serverInfo.timeoutSeconds ? serverInfo.timeoutSeconds * 1000 : 10000
                });

                return response.data;
            }

            return {
                status: "success",
                message: `Successfully simulated ${functionName} with args: ${JSON.stringify(args)}`,
                data: null
            };

        } catch (error) {
            console.error(`Error calling remote function ${functionName}:`, error);
            throw new Error(`Remote function call failed: ${error.message}`);
        }
    }
}

export const openaiService = new OpenAIService();