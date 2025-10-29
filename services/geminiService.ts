import { GoogleGenAI, Type } from "@google/genai";
import { errorHandler, StructuredError } from './errorHandler';
import { KNOWLEDGE_BASE_MARKDOWN, LINKEDIN_REPLY_STYLE_GUIDE } from '../constants';
import type { QualityScore, QualityMetrics, GroundingSource } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateLinkedInReply = async (postContent: string, replyMode: 'balanced' | 'technical' | 'collaborative'): Promise<{ reply: string; sources: GroundingSource[] }> => {
    if (!postContent.trim()) {
        throw new Error("Post content cannot be empty.");
    }

    const systemInstruction = `You are an AI embodiment of "Abraham Trueba," a strategic thought partner at the intersection of deep science and venture capital. You hold a PhD in Chemical Biology and Bioinformatics and specialize in accelerating drug discovery.
    Your task is to generate an expert-level comment on a LinkedIn post, analyzing the science for its technical merit AND its business/investment implications.
    Your response MUST strictly adhere to the provided "LinkedIn Reply Style Guide," including the "Business & VC Perspective" and "Content Rules".
    Your insight must connect the science to concepts like "value inflection points," "de-risking for acquirers," "competitive differentiators," and "reimbursement pathways."
    You will use Google Search to find the most recent, relevant information. When searching, you MUST prioritize sourcing from high-impact, peer-reviewed journals (e.g., NEJM, Nature, Cell, Science, PubMed), and reputable preprint servers (e.g., bioRxiv, medRxiv).
    You will also use your foundational "Scientific Knowledge Base" for core concepts.
    Your final output must follow the style guide's blueprint: Acknowledge, add a deep insight (fusing technical and business perspectives), and pose a strategic, forward-looking question.
    The 'Reply Mode' will subtly influence the tone:
    - 'technical': Emphasize mechanistic details and quantitative data.
    - 'collaborative': The final question should be more open-ended, inviting partnership or discussion.
    - 'balanced': A standard application of the style guide.
    Do NOT invent information or citations. If you cannot find relevant information, state that you cannot provide a specific insight. Do not apologize.
    Generate ONLY the reply text, without any preamble or explanation.`;

    const prompt = `
    SCIENTIFIC KNOWLEDGE BASE:
    ---
    ${KNOWLEDGE_BASE_MARKDOWN}
    ---
    LINKEDIN REPLY STYLE GUIDE:
    ---
    ${LINKEDIN_REPLY_STYLE_GUIDE}
    ---
    USER-PROVIDED LINKEDIN POST:
    ---
    "${postContent}"
    ---
    SELECTED REPLY MODE: ${replyMode}
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.4,
                tools: [{googleSearch: {}}],
            }
        });

        const text = response.text;
        if (!text || !text.trim()) {
             throw new Error("The AI returned an empty response. The topic might be outside the knowledge base.");
        }
        
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
        const sources: GroundingSource[] = groundingChunks
            .filter(chunk => chunk.web && chunk.web.uri)
            .map(chunk => ({
                uri: chunk.web.uri,
                title: chunk.web.title || 'Untitled Source',
            }));

        return { reply: text, sources };

    } catch (error) {
        const context = {
            operation: 'generateLinkedInReply',
            timestamp: Date.now(),
            userAction: 'generateReply',
        };
        const handledError = errorHandler.handleError(error, context);
        throw new StructuredError(handledError);
    }
};


export const evaluateReplyQuality = async (postContent: string, generatedReply: string, sources: GroundingSource[]): Promise<QualityScore> => {
    const prompt = `
    Analyze the generated LinkedIn reply based on the original post, a set of quality metrics, and provided sources. Provide a score from 0 to 100 for each metric.

    Original Post:
    ---
    "${postContent}"
    ---
    Generated Reply:
    ---
    "${generatedReply}"
    ---
    Sources Found:
    ---
    ${sources.length > 0 ? JSON.stringify(sources, null, 2) : "None"}
    ---

    Evaluate the following metrics:
    - scientificAccuracy: How well does the reply use scientific concepts correctly?
    - citationRelevance: If citations (e.g., NEJM, bioRxiv) are used, how relevant are they? Score high for recent, high-impact citations.
    - technicalDepth: How deep is the technical insight? Score high for discussing specific mechanisms, quantitative data, or nuanced comparisons.
    - noveltyOfInsight: Does the reply introduce a new, interesting angle that adds significant value?
    - professionalTone: Does the reply maintain a collaborative, expert-level tone suitable for LinkedIn?
    - sourceRelevance: How well are the web sources integrated? Score high if high-quality sources (journals, pre-prints) support the insight.
    - mechanisticClarity: How well does the reply explain the 'how' or 'why' behind a scientific point?
    - strategicInsight: How well does the reply connect the science to business or investment concepts (e.g., market need, value inflection, de-risking)? Score high for clear connections to commercial or strategic implications.
    - communicationClarity: How clear and well-structured is the reply? Is the logical flow from point to question easy to follow for an expert audience?
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        scientificAccuracy: { type: Type.NUMBER },
                        citationRelevance: { type: Type.NUMBER },
                        technicalDepth: { type: Type.NUMBER },
                        noveltyOfInsight: { type: Type.NUMBER },
                        professionalTone: { type: Type.NUMBER },
                        sourceRelevance: { type: Type.NUMBER },
                        mechanisticClarity: { type: Type.NUMBER },
                        strategicInsight: { type: Type.NUMBER },
                        communicationClarity: { type: Type.NUMBER },
                    },
                     required: ['scientificAccuracy', 'citationRelevance', 'technicalDepth', 'noveltyOfInsight', 'professionalTone', 'sourceRelevance', 'mechanisticClarity', 'strategicInsight', 'communicationClarity']
                },
                temperature: 0.2,
            }
        });
        
        const jsonText = response.text.trim();
        const metrics = JSON.parse(jsonText) as QualityMetrics;
        
        const overall = Object.values(metrics).reduce((a, b) => a + b, 0) / Object.keys(metrics).length;

        return {
          overall,
          metrics,
        };

    } catch (error) {
        console.error("Error evaluating reply quality:", error);
        // Fail gracefully by returning a default score
        const defaultMetrics: QualityMetrics = {
            scientificAccuracy: 0,
            citationRelevance: 0,
            technicalDepth: 0,
            noveltyOfInsight: 0,
            professionalTone: 0,
            sourceRelevance: 0,
            mechanisticClarity: 0,
            strategicInsight: 0,
            communicationClarity: 0,
        };
        return {
            overall: 0,
            metrics: defaultMetrics
        };
    }
};