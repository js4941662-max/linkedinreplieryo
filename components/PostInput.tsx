import React from 'react';
import { SparklesIcon } from './icons';
import { DOCUMENT_TEXT } from '../constants';

interface PostInputProps {
  question: string;
  setQuestion: (text: string) => void;
  onAsk: () => void;
  isLoading: boolean;
}

const PostInput: React.FC<PostInputProps> = ({ 
  question, setQuestion, onAsk, isLoading 
}) => {
  return (
    <div className="w-full bg-navy-900 p-6 rounded-xl shadow-2xl border border-navy-700/50 space-y-6">
      <div>
        <label className="block text-lg font-semibold text-slate-300 mb-2">
          Knowledge Base: Nipah Virus Protein Design
        </label>
        <div className="w-full h-96 bg-navy-950 border border-navy-700 rounded-md p-3 text-slate-300 text-sm overflow-y-auto font-serif">
          <p className="whitespace-pre-wrap">{DOCUMENT_TEXT}</p>
        </div>
        <p className="text-xs text-slate-500 mt-2">The AI will only answer questions based on the content of this document.</p>
      </div>

      <div className="space-y-4 pt-4 border-t border-navy-700">
        <label htmlFor="question-input" className="block text-lg font-semibold text-slate-300">
          Ask a Question
        </label>
        <textarea
          id="question-input"
          rows={3}
          className="w-full bg-navy-950 border border-navy-700 rounded-md shadow-sm p-3 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition placeholder:text-slate-500"
          placeholder="e.g., What is the submission deadline?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          aria-label="Ask a question about the document"
        />
        <div className="flex justify-end">
          <button
            onClick={onAsk}
            disabled={isLoading || !question.trim()}
            className="inline-flex items-center px-8 py-3 border border-transparent text-base font-semibold rounded-md shadow-lg text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-navy-900 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </>
            ) : (
                <>
                  <SparklesIcon className="-ml-1 mr-2 h-5 w-5" />
                  Ask
                </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostInput;