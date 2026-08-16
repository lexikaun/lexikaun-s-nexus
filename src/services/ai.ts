import { GoogleGenAI, Type, FunctionDeclaration, Content } from '@google/genai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Initialize the Google Gen AI SDK
export const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key' });

export const OS_TOOLS: FunctionDeclaration[] = [
  {
    name: 'createGoal',
    description: 'Create a new high-level goal or project.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: 'The title of the goal' },
        category: { type: Type.STRING, description: 'The category (e.g., Music, Health, Career, Personal)' },
        deadline: { type: Type.STRING, description: 'Optional deadline in YYYY-MM-DD format' },
      },
      required: ['title', 'category'],
    },
  },
  {
    name: 'scheduleTask',
    description: 'Schedule a time-blocked task for the user.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: 'The title of the task' },
        startTime: { type: Type.STRING, description: 'Start time in HH:mm format (24-hour)' },
        endTime: { type: Type.STRING, description: 'End time in HH:mm format (24-hour)' },
        date: { type: Type.STRING, description: 'Target date in YYYY-MM-DD format' },
        associatedGoalId: { type: Type.STRING, description: 'Optional ID of the goal this task belongs to' },
      },
      required: ['title', 'startTime', 'endTime', 'date'],
    },
  },
  {
    name: 'createHabit',
    description: 'Create a new recurring habit.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: 'Name of the habit' },
        frequency: { type: Type.STRING, description: 'Frequency: daily, weekdays, or weekly' },
        preferredTime: { type: Type.STRING, description: 'Optional preferred time (e.g., Morning, 07:00)' },
      },
      required: ['name', 'frequency'],
    },
  },
  {
    name: 'playMusic',
    description: 'Play a specific genre or mood of music from the user\'s library.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING, description: 'Genre, mood, or beat title to play (e.g., lofi, focus, hip-hop)' },
      },
      required: ['query'],
    },
  }
];

export const SYSTEM_INSTRUCTION = `
You are Lexikaun, the intelligent operating system for the user's life.
You are not a generic chatbot. You are deeply integrated into the Lexikaun OS.
Your personality is calm, minimal, highly competent, and concise.

You have access to tools that allow you to modify the user's OS:
- createGoal
- scheduleTask
- createHabit
- playMusic

When the user asks you to do something that matches these tools, use the tool. 
ALWAYS ask for clarification if times or dates are missing when scheduling a task.
Keep your conversational responses extremely brief. You do not need to explain that you are using a tool, just use it and confirm briefly.

Context will be provided in each user prompt regarding their current state (time, active tasks, goals).
`;

export async function chatWithLexikaun(
  history: Content[],
  userMessage: string,
  contextData: any
) {
  const contextPrompt = `
[SYSTEM CONTEXT INJECTION]
Current Date/Time: ${new Date().toLocaleString()}
Active Task: ${contextData.currentTask ? contextData.currentTask.title : 'None'}
Today's Goals: ${contextData.goals.map((g: any) => g.title).join(', ') || 'None'}
[END SYSTEM CONTEXT]

User: ${userMessage}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [...history, { role: 'user', parts: [{ text: contextPrompt }] }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ functionDeclarations: OS_TOOLS }],
        temperature: 0.2,
      }
    });
    
    return response;
  } catch (error) {
    console.error("AI Error:", error);
    throw error;
  }
}
