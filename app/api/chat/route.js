import { NextResponse } from 'next/server';
import Groq from "groq-sdk";

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
          state: { type: "boolean", description: "true to open, false to close." }
        },
        required: ["state"]
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
          state: { type: "boolean", description: "true to open, false to close." }
        },
        required: ["state"]
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

    const messages = [
      {
        role: "system",
        content: "You are Doora, a highly advanced AI assistant for a luxury hotel suite. You have access to tools to control the room environment. If the user asks for something, use the appropriate tool. Always respond politely and concisely to the guest."
      },
      {
        role: "user",
        content: userMessage
      }
    ];

    const completion = await groq.chat.completions.create({
      messages,
      model: "llama-3.3-70b-versatile", 
      tools: TOOLS,
      tool_choice: "auto",
      max_tokens: 150,
    });

    const responseMessage = completion.choices[0].message;
    const toolCalls = responseMessage.tool_calls;

    let reply = responseMessage.content || "";
    let extractedTools = [];

    if (toolCalls) {
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

      const finalCompletion = await groq.chat.completions.create({
        messages,
        model: "llama-3.3-70b-versatile",
      });
      reply = finalCompletion.choices[0].message.content;
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
