import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { errorHandler, StructuredError } from './errorHandler';
import { KNOWLEDGE_BASE_MARKDOWN, LINKEDIN_REPLY_STYLE_GUIDE } from '../constants';
import type { QualityScore, QualityMetrics, GroundingSource, StatusCallback } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const callAI = async (
    modelName: string, 
    prompt: string, 
    config: any,
    isJson: boolean = false
): Promise<GenerateContentResponse> => {
    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: config,
        });
        if (isJson) {
            // Basic check for JSON structure
            const text = response.text.trim();
            if (!text.startsWith('{') && !text.startsWith('[')) {
                 throw new Error("AI response is not valid JSON.");
            }
        }
        return response;
    } catch (error) {
        throw error; // Rethrow to be handled by the orchestrator
    }
};

const generateResearchPlan = async (postContent: string): Promise<string> => {
    const prompt = `Based on the following LinkedIn post, create a concise research plan. The plan should identify 2-3 key concepts and suggest specific, high-quality sources to search for each (e.g., "Search PubMed for...", "Search Google Scholar for...", "Search bioRxiv for...").

    LinkedIn Post:
    ---
    "${postContent}"
    ---
    
    Research Plan:`;
    const response = await callAI("gemini-2.5-flash", prompt, { temperature: 0.1 });
    return response.text;
};

const draftReplyWithResearch = async (postContent: string, replyMode: string, researchPlan: string): Promise<GenerateContentResponse> => {
    const systemInstruction = `You are an AI embodiment of "Abraham Trueba," a strategic thought partner at the intersection of deep science and venture capital.
    Your task is to generate an expert-level comment on a LinkedIn post, guided by the provided research plan.
    You MUST use Google Search, prioritizing the source types mentioned in the research plan (PubMed, bioRxiv, high-impact journals).
    Your response MUST strictly adhere to the provided "LinkedIn Reply Style Guide," including the "Business & VC Perspective" and "Content Rules".
    Your insight must connect the science to concepts like "value inflection points," "de-risking," and "competitive differentiators."
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
    RESEARCH PLAN:
    ---
    ${researchPlan}
    ---
    USER-PROVIDED LINKEDIN POST:
    ---
    "${postContent}"
    ---
    SELECTED REPLY MODE: ${replyMode}
    `;

    return callAI("gemini-2.5-pro", prompt, {
        systemInstruction,
        temperature: 0.4,
        tools: [{ googleSearch: {} }],
    });
};

const validateAndRefineDraft = async (postContent: string, draft: string, sources: GroundingSource[]): Promise<string> => {
    const prompt = `You are a ruthless quality assurance editor. Your task is to review a draft reply and its sources, then refine it to perfection.
    
    CRITERIA:
    1.  **Source Validation:** Are the claims in the draft directly supported by the provided sources? Flag any statement that is not supported.
    2.  **Citation Accuracy:** Are the sources high-quality (journals, pre-prints)?
    3.  **Depth & Insight:** Is the insight sufficiently deep? Does it go beyond the original post?
    4.  **Clarity & Style:** Does it adhere perfectly to the "Abraham Trueba" style guide? Is the final question strategic and thought-provoking?

    Original Post:
    ---
    "${postContent}"
    ---
    Draft Reply:
    ---
    "${draft}"
    ---
    Sources Found:
    ---
    ${sources.length > 0 ? JSON.stringify(sources, null, 2) : "None"}
    ---
    Style Guide for Persona "Abraham Trueba":
    ---
    ${LINKEDIN_REPLY_STYLE_GUIDE}
    ---

    Perform your review, then provide the final, refined version of the reply. The refined version must be PERFECT. Do not add any commentary, just the final text.`;

    const response = await callAI("gemini-2.5-pro", prompt, { temperature: 0.2 });
    return response.text;
};


export const generateLinkedInReply = async (postContent: string, replyMode: 'balanced' | 'technical' | 'collaborative', statusCallback: StatusCallback): Promise<{ reply: string; sources: GroundingSource[] }> => {
    if (!postContent.trim()) {
        throw new Error("Post content cannot be empty.");
    }

    try {
        statusCallback("Formulating research plan...");
        const researchPlan = await generateResearchPlan(postContent);

        statusCallback("Executing research & drafting reply...");
        const draftResponse = await draftReplyWithResearch(postContent, replyMode, researchPlan);
        const initialDraft = draftResponse.text;
        const groundingChunks = draftResponse.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
        const sources: GroundingSource[] = groundingChunks
            .filter(chunk => chunk.web && chunk.web.uri)
            .map(chunk => ({
                uri: chunk.web.uri,
                title: chunk.web.title || 'Untitled Source',
            }));

        if (!initialDraft || !initialDraft.trim()) {
            throw new Error("The AI returned an empty response during the drafting stage.");
        }

        statusCallback("Validating sources & citations...");
        const finalReply = await validateAndRefineDraft(postContent, initialDraft, sources);

        statusCallback("Finalizing response...");

        return { reply: finalReply, sources };

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