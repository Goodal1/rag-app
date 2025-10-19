import { NextResponse } from 'next/server';
import OpenAI from "openai";


export async function POST(request: Request) {
    try {
        const { message } = await request.json();

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        const client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });


        const assistantId = process.env.OPENAI_ASSISTANT_ID || 'asst_xxxxxxxxx';


        const thread = await client.beta.threads.create();
        await client.beta.threads.messages.create(thread.id, {
            role: "user",
            content: message
        });


        const stream = client.beta.threads.runs.stream(thread.id, {
            assistant_id: assistantId,
        });

        // Create a ReadableStream for streaming the response
        const encoder = new TextEncoder();
        const readable = new ReadableStream({
            async start(controller) {
                try {
                    for await (const event of stream) {
                        // Handle different types of events from the Assistant stream
                        if (event.event === 'thread.message.delta') {
                            const content = event.data.delta.content?.[0];
                            if (content?.type === 'text' && content.text?.value) {
                                const data = `data: ${JSON.stringify({ content: content.text.value })}\n\n`;
                                controller.enqueue(encoder.encode(data));
                            }
                        }

                        // Handle run completion
                        if (event.event === 'thread.run.completed') {
                            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                            controller.close();
                            return;
                        }

                        // Handle errors
                        if (event.event === 'thread.run.failed') {
                            controller.error(new Error('Assistant run failed'));
                            return;
                        }
                    }
                } catch (error) {
                    controller.error(error);
                }
            },
        });

        return new Response(readable, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked',
            },
        });
    } catch (error) {
        console.error('OpenAI API Error:', error);
        return NextResponse.json({ error: 'Failed to get response from OpenAI' }, { status: 500 });
    }
}
