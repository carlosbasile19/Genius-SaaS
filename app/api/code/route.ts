import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import OpenAI from "openai";
const openai = new OpenAI();
import { increaseApiLimit, checkApiLimit } from "@/lib/api-limit";

interface ChatCompletionRequestMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    name?: string;
  }

const instructionMessage: ChatCompletionRequestMessage = {
    role: 'system',
    content: 'You are a code generator. You must answer only in markdown code snippets. Use code comments for explanations.',
}


export async function POST(
    req: Request
) {
    try{
        const { userId} = auth();
        const body = await req.json();
        const {messages} = body;

        if(!userId)
            return new NextResponse("Unauthorized", {status: 401})
        
        if(!messages)
            return new NextResponse("Message is required", {status: 400})

        const freeTrial = await checkApiLimit();

        if (!freeTrial)
            return new NextResponse("You have reached the free limit", {status: 403})

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [instructionMessage, ...messages],
          });

        await increaseApiLimit();

        return NextResponse.json(response.choices[0].message)

    }catch (e) {
        console.error("[CODE_ERROR]",e);
        return new NextResponse("Internal error", {status: 500})
    }
}