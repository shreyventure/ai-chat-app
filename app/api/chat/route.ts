import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { message } = await req.json();

  const delay = () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(NextResponse.json({ reply: `Echo: ${message}` }));
      }, 2000);
    });
  };
  const res = await delay();
  // Temporary mock response
  return res;
}
