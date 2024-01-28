import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import OpenAI from "openai";
const openai = new OpenAI();


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

        const response = await openai.chat.completions.create({
            messages,
            model: "gpt-3.5-turbo",
          });

        return NextResponse.json(response.choices[0].message)

    }catch (e) {
        console.error("[CONVERSATION_ERROR]",e);
        return new NextResponse("Internal error", {status: 500})
    }
}