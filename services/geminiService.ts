import { GoogleGenAI } from "@google/genai";
import { errorHandler, StructuredError } from './errorHandler';
import { DOCUMENT_TEXT } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const answerQuestion = async (question: string): Promise<string> => {
    if (!question.trim()) {
        throw new Error("Question cannot be empty.");
    }

    const systemInstruction = `You are an Elite Science Responder, an AI expert specializing in the provided document about the Adaptyv Nipah Virus Protein Design Competition. Your knowledge is strictly limited to the information within this document. Answer the user's questions based ONLY on the provided text. If the answer is not in the document, state that the information is not available in the provided context. Do not use any external knowledge. Be concise and accurate.`;

    const prompt = `DOCUMENT CONTEXT:\n---\n${DOCUMENT_TEXT}\n---\n\nUSER QUESTION: "${question}"`;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
            }
        });

        const text = response.text;
        if (!text || !text.trim()) {
             throw new Error("The AI returned an empty response. The answer may not be in the document.");
        }
        return text;

    } catch (error) {
        const context = {
            operation: 'answerQuestion',
            timestamp: Date.now(),
            userAction: 'askQuestion',
        };
        const handledError = errorHandler.handleError(error, context);
        throw new StructuredError(handledError);
    }
};
