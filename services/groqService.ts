import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function getGroqChatCompletion(
  formattedMessages: any,
  input: string
) {
  return groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You're a friendly, helpful assistant who speaks casually like a human.",
      },
      ...formattedMessages,
      {
        role: "user",
        content: input,
      },
    ],
    model: "llama-3.3-70b-versatile",
  });
}
