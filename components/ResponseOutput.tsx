import React from 'react';
import type { ErrorResponse } from '../types';
import { LightbulbIcon, ExclamationTriangleIcon } from './icons';

interface ResponseOutputProps {
  isLoading: boolean;
  error: ErrorResponse | string | null;
  answer: string;
}

const LoadingSkeleton: React.FC = () => (
    <div className="space-y-4 animate-pulse">
      <div className="h-4 bg-navy-700 rounded w-3/4"></div>
      <div className="h-4 bg-navy-700 rounded"></div>
      <div className="h-4 bg-navy-700 rounded"></div>
      <div className="h-4 bg-navy-700 rounded w-1/2"></div>
    </div>
);

const ResponseOutput: React.FC<ResponseOutputProps> = ({ 
  isLoading, error, answer
}) => {
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="w-full">
            <h3 className="text-center text-slate-400 font-semibold mb-4">Searching for answers...</h3>
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
    if (answer) {
      return (
        <div className="w-full space-y-6">
          <div className="relative">
            <h3 className="text-lg font-semibold text-slate-200 mb-3">Answer</h3>
            <div className={`transition-opacity duration-300 bg-navy-950/50 p-4 rounded-lg border border-navy-700`}>
                <p className="whitespace-pre-wrap font-serif text-lg leading-relaxed text-slate-300">
                  {answer}
                </p>
            </div>
          </div>
        </div>
      );
    }
    return (
        <div className="text-center text-slate-500">
            <p>The answer to your question will appear here.</p>
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