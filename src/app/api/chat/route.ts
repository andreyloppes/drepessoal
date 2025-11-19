import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { message, context } = await req.json();
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: "API Key not configured" },
                { status: 500 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
      Você é um assistente financeiro pessoal inteligente e amigável.
      
      CONTEXTO FINANCEIRO DO USUÁRIO (JSON):
      ${JSON.stringify(context)}

      PERGUNTA DO USUÁRIO:
      "${message}"

      DIRETRIZES:
      1. Analise os dados fornecidos (transações, saldo, etc) para responder.
      2. Seja direto, mas educado.
      3. Se o usuário perguntar sobre gastos, some os valores das categorias relevantes.
      4. Dê dicas financeiras curtas se apropriado.
      5. Responda em português do Brasil.
      6. Não invente dados que não estão no contexto.
    `;

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        return NextResponse.json({ response });
    } catch (error) {
        console.error("Error calling Gemini:", error);
        return NextResponse.json(
            { error: "Failed to generate response" },
            { status: 500 }
        );
    }
}
