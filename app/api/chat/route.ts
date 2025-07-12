import { NextResponse } from "next/server";
// import { Configuration, OpenAIApi } from "openai";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    console.log("not authenticated!");
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Save user if not exists
  const user = await prisma.user.upsert({
    where: { email: session.user.email },
    update: {},
    create: {
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
    },
  });

  const body = await req.json();
  const userInput = body.message;
  const sessionId = body.sessionId;

  // Store user message
  await prisma.message.create({
    data: {
      text: userInput,
      sender: "user",
      userId: user.id,
      chatSessionId: sessionId,
    },
  });

  // Call OpenAI (use mock if OpenAI is still down)
  //   const response = await openai.createChatCompletion({
  //     model: 'gpt-3.5-turbo',
  //     messages: [
  //       { role: 'system', content: 'You are a helpful assistant.' },
  //       { role: 'user', content: userInput },
  //     ],
  //   })

  const aiReply = `Echo: ${userInput}`; // response.data.choices[0].message?.content || 'Error'

  // Store AI message
  await prisma.message.create({
    data: {
      text: aiReply,
      sender: "ai",
      userId: user.id,
      chatSessionId: sessionId,
    },
  });

  const delay = () => {
    return new Promise((resolve, _reject) => {
      setTimeout(() => {
        resolve(NextResponse.json({ reply: aiReply }));
      }, 2000);
    });
  };
  const res = await delay();
  return res;
}

// const openai = new OpenAIApi(
//   new Configuration({
//     apiKey: process.env.OPENAI_API_KEY,
//   })
// )

// export async function POST(req: Request) {
//   const session = await getServerSession(authOptions)
//   if (!session?.user?.email) {
//     return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
//   }

//   const body = await req.json()
//   const userInput = body.message

//   // Save user if not exists
//   const user = await prisma.user.upsert({
//     where: { email: session.user.email },
//     update: {},
//     create: {
//       email: session.user.email,
//       name: session.user.name,
//       image: session.user.image,
//     },
//   })

//   // Store user message
//   await prisma.message.create({
//     data: {
//       text: userInput,
//       sender: 'user',
//       userId: user.id,
//     },
//   })

//   // Call OpenAI (use mock if OpenAI is still down)
//   const response = await openai.createChatCompletion({
//     model: 'gpt-3.5-turbo',
//     messages: [
//       { role: 'system', content: 'You are a helpful assistant.' },
//       { role: 'user', content: userInput },
//     ],
//   })

//   const aiReply = response.data.choices[0].message?.content || 'Error'

//   // Store AI message
//   await prisma.message.create({
//     data: {
//       text: aiReply,
//       sender: 'ai',
//       userId: user.id,
//     },
//   })

//   return NextResponse.json({ reply: aiReply })
// }
