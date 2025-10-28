import { BeakerIcon, BrainCircuitIcon, LinkIcon, MicroscopeIcon, ZapIcon } from "./components/icons";

export const GOOGLE_SEARCH_SUGGESTIONS: string[] = [
    "PubMed advanced search strategies for specific topics",
    "how to use bioRxiv to find recent preprints in a field",
    "Google Scholar advanced search tips for scientific literature",
    "how to quickly find relevant papers on PubMed",
    "effective keyword strategies for searching bioRxiv",
    "filtering and sorting search results in Google Scholar"
];

export const COMMENT_STYLES = [
    {
        id: 'adaptive',
        title: 'Adaptive Intelligence (Default)',
        description: 'Dynamically analyzes the post and selects the optimal communication strategy, from surgical critique to narrative storytelling.',
        icon: BrainCircuitIcon
    },
    {
        id: 'surgical',
        title: 'Surgical Insight',
        description: 'A laser-focused mechanistic detail that reframes the entire conversation.',
        icon: MicroscopeIcon
    },
    {
        id: 'connector',
        title: 'Field Connector',
        description: 'Bridge two disparate scientific fields with a novel, transferable insight.',
        icon: LinkIcon,

    },
    {
        id: 'methodological',
        title: 'Methodological Edge',
        description: 'Expose a critical technical assumption that alters data interpretation.',
        icon: BeakerIcon,
    },
    {
        id: 'challenger',
        title: 'Skeptical Peer',
        description: 'Constructively pressure-test the causality chain, not just the conclusion.',
        icon: ZapIcon,
    }
];

export const REFINEMENT_OPTIONS = [
    { id: 'skeptical', label: 'More Skeptical', instruction: 'Rewrite this to be more skeptical and challenging. Question the core assumptions more directly.' },
    { id: 'collaborative', label: 'More Collaborative', instruction: 'Rewrite this with a more collaborative and bridge-building tone. Hint at potential for future work together.' },
    { id: 'shorter', label: 'Shorter', instruction: 'Rewrite this to be even more concise. Cut it down by another 20-30% without losing the core insight.' },
];