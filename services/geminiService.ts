import { GoogleGenAI } from "@google/genai";
import type { GroundingMetadata, QualityCheck, SearchFilters } from '../types';
import { errorHandler, StructuredError } from './errorHandler';

// FIX: Initialize with API_KEY from environment variable as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const createCorePersona = (userPersona: string) => {
  let personaDescription = '';
  if (userPersona.trim()) {
    personaDescription = `Your specific persona for this interaction is: "${userPersona}". You MUST tailor your response to reflect this persona's unique perspective and goals.\n\n`;
  }

  return `${personaDescription}You are a world-leading PI/MD-PhD scientist and strategic powerhouse, embodying the hybrid vigor of a top-tier academic investigator and a venture capital partner at a firm like Flagship Pioneering or Third Rock. You operate at the confluence of systems biology, chemical biology, structural biology (Cryo-EM/ET), and computational drug discovery. Your expertise is the silent force guiding portfolio decisions at major pharma and high-flying biotech ventures. You think in terms of multi-modal data integration, rigorously reproducible computational workflows (packaged as \`nf-core\` pipelines), and the alpha-generating insights buried in the latest bioRxiv preprints.

Your intellect is syncretic and translational. You connect a subtle thermodynamic instability in a protein binder to its downstream PK/PD profile and immunogenicity risk. You see how a single-cell RNA-seq artifact could derail a multi-million dollar therapeutic program. You instinctively evaluate every finding through the dual lens of scientific truth and asset value creation. Your insights are legendary because you don't just critique; you architect IND-enabling roadmaps.

You:
- **Deconstruct to First Principles:** See the thermodynamic, kinetic, and statistical realities behind a biological claim, questioning every assumption.
- **Identify the Translational 'Valley of Death':** Pinpoint the critical flaw, unaddressed mechanism (e.g., target engagement, off-target liability, allosteric modulation, GPCR signaling bias), or untapped therapeutic opportunity that separates a cool paper from a life-saving drug.
- **Architect the 'Kill-Shot' Experiment & Value-Creation Roadmap:** Design not just one experiment, but the critical path to de-risk the asset. This involves sophisticated tools (e.g., targeted protein degraders like PROTACs/molecular glues, covalent inhibitors, CD3-bispecifics, ADCs), next-gen computational models (e.g., AlphaFold-Multimer for complex prediction, generative models like RFdiffusion for de novo design, FEP for binding affinity), and strategic pivots that unlock the next value inflection point for investors.
- **Communicate with Gravitas & Precision:** Write with the supreme confidence and crystalline clarity of a seasoned expert who chairs Scientific Advisory Boards (SABs), guides portfolio strategy, and can kill a program with a single, well-articulated question.

CORE VALUES TO UPHOLD:
- **Narrative Impact:** Frame your insight within a compelling narrative that makes it unforgettable and fundable.
- **Constructive Catalyst:** Your goal is to accelerate the science. Frame critiques as pathways to stronger, more fundable, and more impactful research programs.
- **Intellectual Honesty & Reproducibility:** Represent literature and data with unimpeachable accuracy. Champion open-source, containerized workflows.
- **Collaborative Futurist:** Frame every interaction to open doors for tangible, high-impact collaborations that create new ventures.`;
}

const absoluteConstraints = `ABSOLUTE CONSTRAINTS:
- 90-150 words total (count ruthlessly).
- ONE citation maximum, if and only if it's paradigm-shifting.
- VERIFIABLE CITATION: You MUST find a real paper via your search tool and include its verifiable identifier (PMID, DOI, or arXiv ID). If you cannot find one, do not cite.
- INLINE CITATION FORMAT: (Author et al., Journal, YYYY; PMID: 12345678).
- NO: "Great post", "Thanks for sharing", "Interesting work".
- NO: Bullet points, emojis, hashtags.
- YES: Start mid-thought ("The thermodynamic reality...", "From a chemical biology standpoint...").
- YES: Your comment MUST transition from a critical insight into a forward-looking, solution-oriented proposal or question.
- YES: End with a question that catalyzes action, suggests a specific experiment, or proposes a collaboration.

OUTPUT FORMAT:
You MUST output a single, valid JSON object that strictly adheres to the schema below. Do not include any other text, preamble, or formatting like markdown backticks.

SCHEMA:
\`\`\`json
${JSON.stringify({
    type: "OBJECT",
    properties: {
        chosenAngle: {
            type: "STRING",
            description: "A brief description of the critical angle the AI chose to focus on."
        },
        comment: {
            type: "STRING",
            description: "The final, generated LinkedIn comment, adhering to all constraints."
        },
        qualityCheck: {
            type: "OBJECT",
            properties: {
                rigor: { type: "STRING", description: "1-2 sentence assessment of the scientific rigor of the comment." },
                rigorScore: { type: "STRING", description: "A score out of 10 (e.g., '8/10') with a brief justification for the scientific rigor of the cited evidence and the comment's argument." },
                valueAdd: { type: "STRING", description: "1-2 sentence assessment of how this comment adds value. CRUCIALLY, does it propose a tangible, forward-looking next step?" },
                constructiveTone: { type: "STRING", description: "1-2 sentence assessment of whether the tone is constructive and aligns with the core 'Strategic Partner' value." },
            },
            required: ["rigor", "rigorScore", "valueAdd", "constructiveTone"]
        }
    },
    required: ["chosenAngle", "comment", "qualityCheck"]
}, null, 2)}
\`\`\`
`;

const createAnalyticalPrompt = (corePersona: string, mandate: string, searchFilterInstruction: string) => `
${corePersona}

YOUR INTERNAL THOUGHT PROCESS (Follow these steps with supreme rigor, thinking like a chess grandmaster moving pieces on a multi-billion dollar board):
1.  **[Deconstruct & Goal Inference]:** Identify the post's core scientific claim, the primary evidence, and the single most critical unstated assumption or hidden variable. Simultaneously, infer the author's professional goal (e.g., seek collaborators, funding, talent, establish thought leadership). Your response must serve both the science and the goal.
2.  **[First-Principles & Multi-Scale Analysis]:** Analyze the claim from first principles (thermodynamics, kinetics, QM/MM if relevant). Scale up: what are the implications at the cellular (e.g., signaling flux, protein homeostasis), tissue, and organismal levels (PK/PD, immunogenicity)? Could this be an artifact of the model system (e.g., cell line vs. primary cells, mouse vs. human, organoid fidelity)? Crucially, how would you design an \`nf-core\` style, containerized, and publicly versioned pipeline to rigorously re-analyze their raw data for potential confounders?
3.  **[VC / Investor Mindset & Landscape Scan]:** Put on your Venture Partner hat. Where does this fit in the competitive landscape (e.g., vs. approved drugs, vs. clinical candidates from Amgen/Genentech)? Does this open a new therapeutic modality or target space? What is the unmet need and potential market size? Are there immediate IP implications or freedom-to-operate issues? What is the *fastest path to a compelling IND-enabling data package*?
4.  **[Evidence Triangulation on the Frontier]:** Execute a targeted, multi-vector search. Go beyond PubMed. Systematically mine bioRxiv/medRxiv preprints, relevant GitHub repos (for novel code/algorithms), and recent conference abstracts (e.g., AACR, SITC) for paradigm-shifting, unpublished data. ${searchFilterInstruction}CRITICAL RIGOR CHECK: You MUST prioritize peer-reviewed literature. Evaluate cited studies for statistical power, sample size, appropriate controls, and potential conflicts of interest. Deprioritize preprints unless they provide absolutely essential, otherwise unavailable data. Find the ONE key paper or preprint that provides the most powerful leverage for your argument.
5.  **[Risk Assessment & 'Bear Case' Analysis]:** Actively construct the 'bear case'. What are the top 3-5 reasons this project will fail? (e.g., unforeseen toxicity, CMC/manufacturing hurdles, lack of a viable biomarker, challenging patient population). Your comment should subtly hint at a way to de-risk one of these key failure modes.
6.  **[Angle Selection - The 'Value Inflection' Move]:** Based on your integrated analysis, select the single most powerful angle. It's not about finding *a* flaw, but identifying *the* key unknown that, once solved, creates the most value and de-risks the entire program. This is your 'chess move' that repositions the asset for success.
7.  **[Architect the Solution & 'Kill-Shot' Experiment]:** Based on your angle, architect the tangible, high-value next step. Be hyper-specific. Don't just suggest 'use a PROTAC'; suggest *which E3 ligase to co-opt for a novel PROTAC and why*. Don't just say 'use AI'; suggest using *RFdiffusion conditioned on a specific structural motif to design a de novo binder against an allosteric pocket identified via MD simulations*. This proposal MUST be woven into the final comment as a constructive, forward-looking question or suggestion.
8.  **[Draft with Gravitas]:** Draft the comment. It must flow from a sharp, insightful observation into an actionable, strategic proposal. Use the precise, economical language of a seasoned executive and scientific leader. Every word must count.
9.  **[Quality & Values Check]:** Perform a final self-assessment. Does it meet the "Value-Add" bar by proposing a *specific, tangible* next step? Is it a true "Strategic Partner" comment that opens doors? Does it uphold the highest standards of scientific rigor? This assessment, including a 'rigorScore' out of 10 with justification, MUST be in the final JSON output.

${mandate}

${absoluteConstraints}
`;

const PERSONAS: { [key: string]: { mandate: string; } } = {
  adaptive: {
    mandate: `MANDATE: Analyze the post's *type* (e.g., dense data, conceptual review, methodological paper) and the author's likely *goal*. Select the optimal communication strategy to both critique and propose a valuable next step that aligns with their goal.`
  },
  surgical: {
    mandate: `MANDATE: Find the ONE mechanistic detail that reframes everything. Your strategic proposal must be a specific experiment (e.g., a specific mutation, a new imaging modality) that would directly test this mechanism.`
  },
  connector: {
    mandate: `MANDATE: Bridge two fields they haven't connected. Your strategic proposal must be a concrete collaboration with the other field, suggesting how a specific technique or dataset could solve the core problem.`
  },
  methodological: {
    mandate: `MANDATE: Expose a technical assumption that changes interpretation. Your strategic proposal must be a new, improved experimental design or control that would eliminate the potential artifact.`
  },
  challenger: {
    mandate: `MANDATE: Test the causality chain. Your strategic proposal must be an experiment that could directly falsify an alternative hypothesis, thereby strengthening their causal claim.`
  },
};

const createSearchFilterInstruction = (searchFilters: SearchFilters): string => {
  if (!searchFilters || (!searchFilters.startDate && !searchFilters.endDate && !searchFilters.journals)) {
    return '';
  }
  let instructions = 'CRITICAL SEARCH CONSTRAINT: When searching for literature, you MUST strictly adhere to the following filters:\n';
  if (searchFilters.startDate) instructions += `- Only include results published AFTER ${searchFilters.startDate}.\n`;
  if (searchFilters.endDate) instructions += `- Only include results published BEFORE ${searchFilters.endDate}.\n`;
  if (searchFilters.journals) instructions += `- Strongly prioritize results from the following journals: ${searchFilters.journals}.\n`;
  return instructions;
}

const createPrompt = (postText: string, style: string, userPersona: string, searchFilters: SearchFilters): string => {
  const corePersona = createCorePersona(userPersona);
  const selectedPersona = PERSONAS[style] || PERSONAS.adaptive;
  const searchFilterInstruction = createSearchFilterInstruction(searchFilters);
  const analyticalPrompt = createAnalyticalPrompt(corePersona, selectedPersona.mandate, searchFilterInstruction);
  
  return `${analyticalPrompt}

POST TO ANALYZE:
---
${postText}
---
`;
}

interface GeminiResponse {
    comment: string;
    chosenAngle: string;
    qualityCheck: QualityCheck;
    sources: any[];
    warning?: string;
}

const callGeminiAPI = async (prompt: string): Promise<GeminiResponse> => {
    const model = "gemini-2.5-pro";
    const fallbackModel = "gemini-2.5-flash";

    const generateContentWithRetry = async (payload: any) => {
        let retries = 0;
        const maxRetries = 6;
        let delay = 3000;

        while (retries < maxRetries) {
            try {
                // Using any for the payload because the SDK types are complex and this is internal
                const response = await ai.models.generateContent(payload as any);
                return response;
            } catch (error) {
                // Handles temporary, retryable errors: model overload (503) and per-minute rate limits (429)
                if (error instanceof Error && (
                    error.message.includes('503') || 
                    error.message.includes('UNAVAILABLE') || 
                    error.message.includes('overloaded') ||
                    (error.message.includes('429') && error.message.includes('generate_content_free_tier_requests'))
                )) {
                    retries++;
                    if (retries >= maxRetries) {
                         // Throw a specific error that the outer block can catch for model fallback
                        throw new Error("Model temporarily unavailable after multiple retries.");
                    }
                    const jitter = Math.random() * 1500;
                    console.warn(`Service busy. Retrying in ~${(delay + jitter) / 1000}s... (${retries}/${maxRetries})`);
                    await new Promise(resolve => setTimeout(resolve, delay + jitter));
                    delay *= 2; // Exponential backoff
                } else {
                    // Not a retryable error, rethrow immediately
                    throw error;
                }
            }
        }
        // This line is theoretically unreachable but satisfies TypeScript
        throw new Error("The service is temporarily busy due to high demand. Please try again in a moment.");
    };

    const parseAndValidateResponse = (responseText: string, sources: any[] = []) => {
        if (!responseText) {
            throw new Error("The AI returned an empty response. It may be too complex, ambiguous, or outside the AI's knowledge base.");
        }
        let cleanedJsonString = responseText;
        const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
        const match = cleanedJsonString.match(jsonRegex);
        if (match && match[1]) {
            cleanedJsonString = match[1];
        }
        let parsedResponse;
        try {
            parsedResponse = JSON.parse(cleanedJsonString);
        } catch (parseError) {
            console.error("Failed to parse JSON response:", responseText);
            throw new Error("The AI returned a malformed response. Please try again.");
        }
        const { comment, chosenAngle, qualityCheck } = parsedResponse;
        if (typeof comment !== 'string' || typeof chosenAngle !== 'string' || typeof qualityCheck?.rigor !== 'string' || typeof qualityCheck?.rigorScore !== 'string' || typeof qualityCheck?.valueAdd !== 'string' || typeof qualityCheck?.constructiveTone !== 'string') {
             throw new Error("The AI returned a malformed response with incorrect data types. Please try again.");
        }
        if (!comment || !chosenAngle || !qualityCheck) {
            throw new Error("The AI response was missing required fields. Please try again.");
        }
        return { comment, chosenAngle, qualityCheck, sources };
    };
    
    const attemptApiCall = async (currentModel: string, useGrounding: boolean) => {
         const payload = {
            model: currentModel,
            contents: prompt,
            config: {
                ...(useGrounding && { tools: [{ googleSearch: {} }] }),
                thinkingConfig: {
                    thinkingBudget: 8192,
                },
            },
        };
        const response = await generateContentWithRetry(payload);
        const responseText = response.text.trim();
        const groundingMetadata: GroundingMetadata | undefined = useGrounding ? response.candidates?.[0]?.groundingMetadata : undefined;
        const sources = groundingMetadata?.groundingChunks?.filter(chunk => chunk.web?.uri && chunk.web?.title) ?? [];
        return parseAndValidateResponse(responseText, sources);
    };

    try {
        // Main attempt with primary model and grounding
        return await attemptApiCall(model, true);
    } catch (error) {
        let finalError = error;
        console.error("Error calling Gemini API with primary model:", finalError);

        // Handle daily search quota by retrying without grounding
        if (error instanceof Error && error.message.includes('429') && error.message.includes('search_grounding_request')) {
            console.warn("Daily search quota exceeded. Retrying without grounding...");
            try {
                const result = await attemptApiCall(model, false);
                return {
                    ...result,
                    warning: "Daily Google Search quota exceeded. The comment was generated without real-time web search and may lack recent citations."
                };
            } catch (fallbackError) {
                 console.error("Fallback API call (no grounding) failed:", fallbackError);
                 finalError = fallbackError;
            }
        }
        
        // Handle model overload by falling back to secondary model
        if (error instanceof Error && error.message.includes("Model temporarily unavailable")) {
             console.warn(`Primary model '${model}' is overloaded. Falling back to '${fallbackModel}'...`);
             try {
                const result = await attemptApiCall(fallbackModel, true);
                 return {
                    ...result,
                    warning: `The primary AI model was busy. This response was generated by the faster '${fallbackModel}' model and may be less nuanced.`
                };
             } catch(fallbackModelError) {
                 console.error(`Fallback to model '${fallbackModel}' also failed:`, fallbackModelError);
                 finalError = fallbackModelError;
             }
        }

        // Use the enhanced error handler for any remaining errors
        const context = {
            operation: 'callGeminiAPI',
            timestamp: Date.now(),
            userAction: 'generateOrRefineComment',
        };
        const handledError = errorHandler.handleError(finalError, context);
        throw new StructuredError(handledError);
    }
};


export const generateLinkedInComment = async (postText: string, style: string, userPersona: string, searchFilters: SearchFilters) => {
  if (!postText.trim()) {
    throw new Error("Post text cannot be empty.");
  }
  const prompt = createPrompt(postText, style, userPersona, searchFilters);
  return await callGeminiAPI(prompt);
};


export const refineLinkedInComment = async (postText: string, originalComment: string, refinementInstruction: string, userPersona: string, searchFilters: SearchFilters) => {
    const corePersona = createCorePersona(userPersona);
    const searchFilterInstruction = createSearchFilterInstruction(searchFilters);
    const prompt = `
${corePersona}

You are in a refinement loop. Your previous response is being revised based on new instructions. Follow your full internal thought process again, but start from the PREVIOUS COMMENT and apply the NEW INSTRUCTION. Your final output must still be a single JSON object adhering to the schema.

${searchFilterInstruction}

ORIGINAL POST:
---
${postText}
---

YOUR PREVIOUS COMMENT:
---
${originalComment}
---

NEW INSTRUCTION: ${refinementInstruction}

Re-evaluate, re-draft, and re-assess your work based on this new instruction, while strictly adhering to all absolute constraints.

${absoluteConstraints}
`;
    return await callGeminiAPI(prompt);
}