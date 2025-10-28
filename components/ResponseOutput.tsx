import React, { useState, useEffect } from 'react';
import type { GroundingChunk, QualityCheck, ErrorResponse } from '../types';
import { CopyIcon, CheckIcon, LinkIcon, TargetIcon, LightbulbIcon, ShieldCheckIcon, ExclamationTriangleIcon } from './icons';
import { REFINEMENT_OPTIONS } from '../constants';

interface ResponseOutputProps {
  isLoading: boolean;
  isRefining: boolean;
  error: ErrorResponse | string | null;
  warning: string | null;
  comment: string;
  sources: GroundingChunk[];
  onRefine: (instruction: string) => void;
  chosenAngle: string;
  qualityCheck: QualityCheck | null;
}

const LoadingSkeleton: React.FC = () => (
    <div className="space-y-4 animate-pulse">
      <div className="h-4 bg-navy-700 rounded w-3/4"></div>
      <div className="h-4 bg-navy-700 rounded"></div>
      <div className="h-4 bg-navy-700 rounded"></div>
      <div className="h-4 bg-navy-700 rounded w-1/2"></div>
    </div>
);

const ResponseOutput: React.FC<ResponseOutputProps> = ({ isLoading, isRefining, error, warning, comment, sources, onRefine, chosenAngle, qualityCheck }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (comment) {
      setCopied(false);
    }
  }, [comment]);

  const handleCopy = () => {
    navigator.clipboard.writeText(comment).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="w-full">
            <h3 className="text-center text-slate-400 font-semibold mb-4">Performing deep analysis...</h3>
            <LoadingSkeleton />
        </div>
      )
    }
    if (error) {
       if (typeof error === 'string') {
        return (
            <div className="w-full text-center p-4 bg-red-900/50 border border-red-700 rounded-lg">
                <ExclamationTriangleIcon className="w-10 h-10 text-red-400 mx-auto mb-4" />
                <p className="text-red-300">{error}</p>
            </div>
        );
      }

      // It's an ErrorResponse object
      return (
        <div className="w-full text-left p-6 bg-red-900/50 border border-red-700 rounded-lg">
          <div className="flex items-center mb-4">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-400 mr-4 flex-shrink-0" />
            <h3 className="text-xl font-semibold text-red-200">Action Required</h3>
          </div>
          <p className="text-red-300 mb-6">{error.userMessage}</p>
          
          {error.suggestions && error.suggestions.length > 0 && (
            <div>
              <h4 className="font-semibold text-slate-200 mb-3 border-t border-red-700/50 pt-4">Suggestions</h4>
              <ul className="space-y-3 text-slate-300 text-sm">
                {error.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start">
                    <LightbulbIcon className="w-5 h-5 mr-3 mt-0.5 text-yellow-400 flex-shrink-0" />
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }
    if (comment) {
      return (
        <div className="w-full space-y-6">
           {warning && (
            <div className="flex items-start p-4 bg-yellow-900/50 border border-yellow-700 rounded-lg text-yellow-300 text-sm">
              <ExclamationTriangleIcon className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-yellow-400" />
              <div><strong className="font-semibold">Notice:</strong> {warning}</div>
            </div>
          )}

          <div className="relative">
            <button
              onClick={handleCopy}
              className="absolute top-0 right-0 p-2 text-slate-400 bg-navy-800 border border-navy-700 hover:text-cyan-400 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500"
              aria-label="Copy to clipboard"
            >
              {copied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
            </button>
            <h3 className="text-lg font-semibold text-slate-200 mb-3">Generated Comment</h3>
            <div className={`transition-opacity duration-300 bg-navy-950/50 p-4 rounded-lg border border-navy-700 ${isRefining ? 'opacity-50' : 'opacity-100'}`}>
                <p className="whitespace-pre-wrap font-serif text-lg leading-relaxed text-slate-300">
                  {comment}
                </p>
            </div>
          </div>
          
          {isRefining && <div className="text-center text-sm text-cyan-400 pt-2">Refining...</div>}

          {chosenAngle && (
             <div className="border-t border-navy-700 pt-4">
              <h3 className="text-sm font-semibold text-slate-400 mb-2">
                AI's Approach
              </h3>
              <p className="text-sm text-slate-300 italic">"{chosenAngle}"</p>
            </div>
          )}

          {qualityCheck && (
            <div className="border-t border-navy-700 pt-4">
               <h3 className="text-sm font-semibold text-slate-400 mb-3">
                Quality & Values Check
              </h3>
              <ul className="space-y-3 text-sm">
                 <li className="flex items-start">
                  <ShieldCheckIcon className="w-5 h-5 mr-3 mt-0.5 text-cyan-400 flex-shrink-0" />
                  <div><strong className="text-slate-300">Rigor Score:</strong> {qualityCheck.rigorScore}</div>
                </li>
                <li className="flex items-start">
                  <TargetIcon className="w-5 h-5 mr-3 mt-0.5 text-cyan-400 flex-shrink-0" />
                  <div><strong className="text-slate-300">Rigor Assessment:</strong> {qualityCheck.rigor}</div>
                </li>
                 <li className="flex items-start">
                  <LightbulbIcon className="w-5 h-5 mr-3 mt-0.5 text-cyan-400 flex-shrink-0" />
                  <div><strong className="text-slate-300">Value-Add:</strong> {qualityCheck.valueAdd}</div>
                </li>
                 <li className="flex items-start">
                  <ShieldCheckIcon className="w-5 h-5 mr-3 mt-0.5 text-cyan-400 flex-shrink-0" />
                  <div><strong className="text-slate-300">Constructive Tone:</strong> {qualityCheck.constructiveTone}</div>
                </li>
              </ul>
            </div>
          )}

          {sources.length > 0 && (
            <div className="border-t border-navy-700 pt-4">
              <h3 className="text-sm font-semibold text-slate-400 mb-3">
                Verification Sources Found:
              </h3>
              <ul className="space-y-3">
                {sources.map((source, index) => (
                  <li key={index} className="flex items-start">
                    <LinkIcon className="w-4 h-4 mr-3 mt-1 text-slate-500 flex-shrink-0" />
                    <div>
                      <a
                        href={source.web?.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:underline text-sm font-medium"
                      >
                        {source.web?.title}
                      </a>
                       <p className="text-xs text-slate-500 truncate mt-0.5" aria-label="Source URI">
                        {source.web?.uri}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="border-t border-navy-700 pt-4">
            <h3 className="text-sm font-semibold text-slate-400 mb-3">
              Refine
            </h3>
            <div className="flex flex-wrap gap-2">
                {REFINEMENT_OPTIONS.map(opt => (
                    <button key={opt.id} onClick={() => onRefine(opt.instruction)} disabled={isRefining || isLoading}
                        className="px-3 py-1 text-sm bg-navy-700 hover:bg-navy-600 rounded-full text-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
          </div>

        </div>
      );
    }
    return (
        <div className="text-center text-slate-500">
            <p>Your AI-generated, MD/PhD-level comment will appear here.</p>
        </div>
    );
  };

  return (
    <div className="w-full min-h-[500px] lg:min-h-full bg-navy-900 p-6 rounded-xl shadow-2xl border border-navy-700/50 flex justify-center items-center sticky top-8">
        {renderContent()}
    </div>
  );
};

export default ResponseOutput;