import { NextResponse } from 'next/server';
import Groq from "groq-sdk";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Groq will be initialized inside the POST handler to ensure environment variables are fresh.

const TOOLS = [
  {
    type: "function",
    function: {
      name: "set_light",
      description: "Turn lights on or off in a specific zone.",
      parameters: {
        type: "object",
        properties: {
          zone: { type: "string", enum: ["master", "kitchen", "bath", "bed", "living", "all"], description: "The room zone." },
          state: { type: "boolean", description: "true to turn on, false to turn off." }
        },
        required: ["zone", "state"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "set_temperature",
      description: "Set the AC temperature.",
      parameters: {
        type: "object",
        properties: {
          temp: { type: "number", description: "Target temperature in Celsius." }
        },
        required: ["temp"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "set_ac_power",
      description: "Turn the AC on or off.",
      parameters: {
        type: "object",
        properties: {
          state: { type: "boolean", description: "true to turn on, false to turn off." }
        },
        required: ["state"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "place_order",
      description: "Order room service or housekeeping.",
      parameters: {
        type: "object",
        properties: {
          item: { type: "string", description: "The item or service to order." }
        },
        required: ["item"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "set_tv",
      description: "Turn the TV on or off.",
      parameters: {
        type: "object",
        properties: {
          state: { type: "boolean" }
        },
        required: ["state"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "set_curtains",
      description: "Open or close the smart curtains.",
      parameters: {
        type: "object",
        properties: {
          zone: { type: "string", enum: ["bed", "living", "all"], description: "The room zone to control curtains." },
          state: { type: "boolean", description: "true to open, false to close." }
        },
        required: ["zone", "state"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "set_door",
      description: "Lock or unlock the main room door.",
      parameters: {
        type: "object",
        properties: {
          state: { type: "boolean", description: "true to lock, false to unlock." }
        },
        required: ["state"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "set_window",
      description: "Open or close the smart window.",
      parameters: {
        type: "object",
        properties: {
          zone: { type: "string", enum: ["bed", "living", "all"], description: "The room zone to control windows." },
          state: { type: "boolean", description: "true to open, false to close." }
        },
        required: ["zone", "state"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "make_coffee",
      description: "Brew a fresh cup of coffee.",
      parameters: {
        type: "object",
        properties: {}
      }
    }
  },
  {
    type: "function",
    function: {
      name: "trigger_smoke",
      description: "Simulate a fire alarm or smoke detection.",
      parameters: {
        type: "object",
        properties: {}
      }
    }
  },
  {
    type: "function",
    function: {
      name: "set_alarm",
      description: "Set the bedroom alarm clock to ring at a specific time. Use 24-hour HH:MM format.",
      parameters: {
        type: "object",
        properties: {
          time: { type: "string", description: "Alarm time in 24-hour HH:MM format, e.g. '07:00' or '08:30'." },
          enabled: { type: "boolean", description: "true to enable the alarm, false to disable it." }
        },
        required: ["time", "enabled"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "dismiss_alarm",
      description: "Dismiss or cancel the currently active or ringing alarm.",
      parameters: { type: "object", properties: {} }
    }
  }
];

export async function POST(req) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ reply: "SYSTEM ERROR: GROQ_API_KEY is missing in .env.local. Please add it and restart the server." });
    }

    const groq = new Groq({ apiKey });

    const body = await req.json();
    const userMessage = body.message;
    const lowerUserMessage = userMessage.toLowerCase().trim();

    const session = await auth();
    let routinesContext = "";
    let extractedTools = [];
    let autoTriggeredRoutine = null;
    
    if (session && session.user) {
      const routines = await prisma.smartRoutine.findMany({
        where: { userId: session.user.id }
      });
      
      // Auto-intercept if exact match (removes LLM parallel tool limits)
      autoTriggeredRoutine = routines.find(r => r.triggerPhrase.toLowerCase() === lowerUserMessage || r.triggerPhrase.toLowerCase() === lowerUserMessage.replace(/[^a-z0-9 ]/g, ''));
      
      if (autoTriggeredRoutine) {
        const actions = autoTriggeredRoutine.actions;
        for (const [key, val] of Object.entries(actions)) {
           if (key === 'tv') extractedTools.push({ name: 'set_tv', args: { state: val === 'on' } });
           if (key === 'door') extractedTools.push({ name: 'set_door', args: { state: val === 'lock' } });
           if (key === 'ac_power') extractedTools.push({ name: 'set_ac_power', args: { state: val === 'on' } });
           if (key === 'ac_temp') extractedTools.push({ name: 'set_temperature', args: { temp: Number(val) } });
           
           if (key.startsWith('light_')) extractedTools.push({ name: 'set_light', args: { zone: key.split('_')[1], state: val === 'on' } });
           if (key.startsWith('curtains_')) extractedTools.push({ name: 'set_curtains', args: { zone: key.split('_')[1], state: val === 'open' } });
           if (key.startsWith('window_')) extractedTools.push({ name: 'set_window', args: { zone: key.split('_')[1], state: val === 'open' } });
           
           // Legacy keys
           if (key === 'lights') extractedTools.push({ name: 'set_light', args: { zone: 'all', state: val === 'on' } });
           if (key === 'curtains') extractedTools.push({ name: 'set_curtains', args: { zone: 'all', state: val === 'open' } });
        }
      } else if (routines.length > 0) {
        routinesContext = `\n\n### SMART ROUTINES ###\nThe user has configured custom routines. If the user says a trigger phrase, you MUST execute ALL corresponding actions immediately by calling ALL necessary tools in parallel. 
DO NOT ask for confirmation before executing. DO NOT partially execute the routine. Just execute all tools and confirm to the user that the routine is complete.
Mapping guide for routine actions:
- "light_ZONE": "on"/"off" -> set_light(zone: ZONE, state: true/false)
- "curtains_ZONE": "open"/"close" -> set_curtains(zone: ZONE, state: true/false)
- "window_ZONE": "open"/"close" -> set_window(zone: ZONE, state: true/false)
- "ac_power": "on"/"off" -> set_ac_power(state: true/false)
- "ac_temp": NUMBER -> set_temperature(temp: NUMBER)
- "tv": "on"/"off" -> set_tv(state: true/false)
- "door": "lock"/"unlock" -> set_door(state: true/lock/false/unlock)

ROUTINES DEFINITION:\n${JSON.stringify(routines.map(r => ({ trigger: r.triggerPhrase, actions: r.actions })), null, 2)}`;
      }
    }

    let messages = [
      {
        role: "system",
        content: `You are Doora, a highly advanced AI assistant for a luxury hotel suite. You have access to tools to control the room environment. If the user asks for something, use the appropriate tool. Always respond politely and concisely to the guest. DO NOT ask for permission to execute a user's request, just execute the tools.${routinesContext}`
      },
      {
        role: "user",
        content: userMessage
      }
    ];

    if (autoTriggeredRoutine) {
        messages = [
            {
                role: "system",
                content: `You are Doora. The user has just triggered their custom routine "${autoTriggeredRoutine.triggerPhrase}". The system has ALREADY executed the actions in the background successfully. Acknowledge the user briefly, tell them the routine is complete, and summarize what was done (based on the routine name). Do not call any tools.`
            },
            {
                role: "user",
                content: userMessage
            }
        ];
    }

    let usingCerebras = false;

    async function getCompletion(apiMessages, useTools = true) {
      if (!usingCerebras) {
        try {
          const params = {
            messages: apiMessages,
            model: "llama-3.3-70b-versatile",
          };
          if (useTools) {
            params.tools = TOOLS;
            params.tool_choice = "auto";
            params.max_tokens = 150;
          }
          return await groq.chat.completions.create(params);
        } catch (groqError) {
          const isRateLimit = groqError.status === 429 || groqError.message?.toLowerCase().includes("rate limit");
          if (isRateLimit && process.env.CEREBRAS_API_KEY) {
            console.warn("Groq rate limited/failed. Switching to Cerebras fallback:", groqError.message);
            usingCerebras = true;
          } else {
            throw groqError;
          }
        }
      }

      // Cerebras fallback
      const cerebrasApiKey = process.env.CEREBRAS_API_KEY;
      if (!cerebrasApiKey) {
        throw new Error("Groq failed and CEREBRAS_API_KEY is not configured.");
      }

      const body = {
        model: "zai-glm-4.7",
        messages: apiMessages,
      };
      if (useTools) {
        body.tools = TOOLS;
        body.tool_choice = "auto";
        body.max_tokens = 150;
      }

      const res = await fetch("https://api.cerebras.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${cerebrasApiKey}`
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Cerebras API call failed with status ${res.status}: ${text}`);
      }

      const data = await res.json();
      return {
        choices: [
          {
            message: data.choices[0].message
          }
        ]
      };
    }

    const completion = await getCompletion(messages, true);

    const responseMessage = completion.choices[0].message;
    const toolCalls = responseMessage.tool_calls || [];

    let reply = responseMessage.content || "";

    // Fallback: Parse leaked XML tool calls if Groq model hallucinates the format
    const functionRegex = /<function=([^>]+)>(.*?)<\/function>/gs;
    let match;
    while ((match = functionRegex.exec(reply)) !== null) {
      const name = match[1];
      try {
        const args = JSON.parse(match[2]);
        extractedTools.push({ name, args });
      } catch (e) {
        console.error("Failed to parse leaked tool args", e);
      }
    }
    // Clean up the reply string
    reply = reply.replace(/<function=[^>]+>.*?<\/function>/gs, '').trim();

    if (toolCalls.length > 0) {
      messages.push(responseMessage); 

      for (const toolCall of toolCalls) {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);
        
        extractedTools.push({ name: functionName, args: functionArgs });
        
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          name: functionName,
          content: `{"success": true}`
        });
      }

      const finalCompletion = await getCompletion(messages, false);
      if (finalCompletion.choices[0].message.content) {
        reply = finalCompletion.choices[0].message.content;
      }
    }

    if (!reply && extractedTools.length > 0) {
      reply = "I've handled that for you.";
    }

    return NextResponse.json({ reply, tools: extractedTools });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
