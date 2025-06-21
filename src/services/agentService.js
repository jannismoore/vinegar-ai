import { AGENTS } from '../constants/agents.js';

class AgentService {
    constructor() {
        this.defaultAgents = this.processDefaultAgents(AGENTS);
        this.dynamicAgents = [];
    }

    /**
     * Process default agents to replace placeholders
     * @param {Object} agents - The default agents object
     * @param {string} selection - Optional selection text to replace {{selection}} placeholder
     * @returns {Object} - Processed default agents
     */
    processDefaultAgents(agents, selection = '') {
        const processed = {};

        for (const [key, agent] of Object.entries(agents)) {
            processed[key] = {
                ...agent,
                instructions: this.replacePlaceholders(agent.instructions, agent, selection),
                commands: agent.commands.map(cmd => this.replacePlaceholders(cmd, agent, selection))
            };
        }

        return processed;
    }

    /**
     * Replace placeholders in a string with agent properties
     * @param {string} text - The text containing placeholders
     * @param {Object} agent - The agent object with properties to use
     * @param {string} selection - Optional selection text to replace {{selection}} placeholder
     * @returns {string} - Text with placeholders replaced
     */
    replacePlaceholders(text, agent, selection = '') {
        if (!text) return '';
        let processedText = text.replace(/\{\{agent_name\}\}/g, agent.agent_name);
        processedText = processedText.replace(/\{\{selection\}\}/g, selection);
        return processedText;
    }

    /**
     * Parse and load dynamic agents from API response
     * @param {Array} agents - Array of agent objects from the API
     * @param {string} selection - Optional selection text to replace {{selection}} placeholder
     */
    loadDynamicAgents(agents, selection = '') {
        if (!agents || !Array.isArray(agents)) return;

        try {
            this.dynamicAgents = agents.map(agent => {
                const processedInstructions = this.replacePlaceholders(agent.instructions, agent, selection);
                const processedCommands = agent.commands
                    ? agent.commands.map(cmd => this.replacePlaceholders(cmd, agent, selection))
                    : [`${agent.agent_name.toLowerCase()}`];

                return {
                    agent_name: agent.agent_name,
                    instructions: processedInstructions,
                    commands: processedCommands,
                    tools: agent.tools || []
                };
            });

            console.log(`Loaded ${this.dynamicAgents.length} dynamic agents`);
        } catch (error) {
            console.error('Error parsing dynamic agents:', error);
            // Continue with default agents if there's an error
        }
    }

    /**
     * Get all available agents, combining default and dynamic ones
     * @returns {Array} - Combined list of all agents
     */
    getAllAgents() {
        const staticAgents = Object.values(this.defaultAgents);
        return [...staticAgents, ...this.dynamicAgents];
    }

    /**
     * Find an agent by name
     * @param {string} name - The agent name to search for
     * @returns {Object|null} - The found agent or null
     */
    findAgentByName(name) {
        if (!name) return null;

        const lowerName = name.toLowerCase();

        // Check dynamic agents first
        const dynamicAgent = this.dynamicAgents.find(agent =>
            agent.agent_name.toLowerCase() === lowerName
        );

        if (dynamicAgent) return dynamicAgent;

        // Then check default agents
        const defaultAgent = Object.values(this.defaultAgents).find(agent =>
            agent.agent_name.toLowerCase() === lowerName
        );

        return defaultAgent || null;
    }

    /**
     * Find an agent by command in transcription
     * @param {string} transcription - The text to search for commands
     * @returns {Object|null} - The matched agent or null
     */
    findAgentByCommand(transcription) {
        if (!transcription) return null;

        const lowerTranscript = transcription.toLowerCase();

        // Check all agents (dynamic + default)
        const allAgents = this.getAllAgents();

        for (const agent of allAgents) {
            if (agent.commands && agent.commands.some(cmd =>
                lowerTranscript.includes(cmd.toLowerCase())
            )) {
                return agent;
            }
        }

        return null;
    }

    /**
     * Get the default fallback agent (Vinegar)
     * @returns {Object} - Vinegar agent
     */
    getDefaultAgent() {
        return this.defaultAgents.VINEGAR;
    }

    /**
     * Format tools for OpenAI API function calling
     * @param {Array} tools - The tools from the agent
     * @returns {Array} - Formatted tools for OpenAI
     */
    formatToolsForOpenAI(tools) {
        if (!tools || !Array.isArray(tools)) return [];

        return tools.map(tool => {
            if (tool.function) {
                return {
                    type: "function",
                    function: {
                        name: tool.function.name,
                        description: tool.function.description,
                        parameters: tool.function.parameters
                    },
                    server: {
                        url: tool.server.url,
                        headers: tool.server.headers,
                        timeoutSeconds: tool.server.timeoutSeconds,
                        method: tool.server.method || 'post'
                    }
                };
            }
            return null;
        }).filter(Boolean);
    }
}

export const agentService = new AgentService();