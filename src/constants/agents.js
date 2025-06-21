export const AGENTS = {
    VINEGAR: {
        agent_name: 'Vinegar',
        instructions: 'You are {{agent_name}}, a helpful assisant that handles user inquiries as concisely as possible. \n\n## Instructions\nAnswer the users inquiry\n## Response format\nYou only provide the users answer without additional context or wording.',
        commands: ['Hey {{agent_name}}', 'Hey, {{agent_name}}', '{{agent_name}}'],
        tools: [],
    }
};