import React from 'react';
import { SparklesIcon } from './icons';
import { COMMENT_STYLES } from '../constants';
import type { SearchFilters } from '../types';

interface PostInputProps {
  postText: string;
  setPostText: (text: string) => void;
  userPersona: string;
  setUserPersona: (text: string) => void;
  commentStyle: string;
  setCommentStyle: (style: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  searchFilters: SearchFilters;
  setSearchFilters: (filters: SearchFilters) => void;
}

const PostInput: React.FC<PostInputProps> = ({ 
  postText, setPostText, 
  userPersona, setUserPersona,
  commentStyle, setCommentStyle, 
  onGenerate, isLoading,
  searchFilters, setSearchFilters
}) => {
  return (
    <div className="w-full bg-navy-900 p-6 rounded-xl shadow-2xl border border-navy-700/50 space-y-6">
      <div>
        <label htmlFor="post-textarea" className="block text-sm font-medium text-slate-300 mb-2">
          <span className="text-cyan-400 font-semibold">Step 1:</span> Paste LinkedIn Post
        </label>
        <textarea
          id="post-textarea"
          rows={8}
          className="w-full bg-navy-950 border border-navy-700 rounded-md shadow-sm p-3 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition placeholder:text-slate-500"
          placeholder="Paste the full text of the scientific LinkedIn post here..."
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
          aria-label="LinkedIn Post Text"
        />
      </div>
      
      <div>
         <label htmlFor="persona-textarea" className="block text-sm font-medium text-slate-300 mb-2">
          <span className="text-cyan-400 font-semibold">Step 2:</span> Define Your Persona & Goal (Optional)
        </label>
        <textarea
          id="persona-textarea"
          rows={2}
          className="w-full bg-navy-950 border border-navy-700 rounded-md shadow-sm p-3 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition placeholder:text-slate-500"
          placeholder="e.g., I'm a postdoc in immunology looking to open a door for collaboration."
          value={userPersona}
          onChange={(e) => setUserPersona(e.target.value)}
          aria-label="Your Persona and Goal"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
            <span className="text-cyan-400 font-semibold">Step 2.5:</span> Advanced Search Filters (Optional)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-navy-950 p-4 rounded-lg border border-navy-700">
            <div>
                <label htmlFor="start-date" className="block text-xs font-medium text-slate-400 mb-1">Start Date</label>
                <input type="text" id="start-date" placeholder="YYYY-MM-DD" className="w-full bg-navy-800 border border-navy-600 rounded-md shadow-sm p-2 text-sm text-slate-200 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition placeholder:text-slate-500" value={searchFilters.startDate} onChange={e => setSearchFilters({...searchFilters, startDate: e.target.value})} />
            </div>
            <div>
                <label htmlFor="end-date" className="block text-xs font-medium text-slate-400 mb-1">End Date</label>
                <input type="text" id="end-date" placeholder="YYYY-MM-DD" className="w-full bg-navy-800 border border-navy-600 rounded-md shadow-sm p-2 text-sm text-slate-200 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition placeholder:text-slate-500" value={searchFilters.endDate} onChange={e => setSearchFilters({...searchFilters, endDate: e.target.value})} />
            </div>
            <div className="md:col-span-2">
                <label htmlFor="journals" className="block text-xs font-medium text-slate-400 mb-1">Specific Journals</label>
                <input type="text" id="journals" placeholder="e.g., Nature, Cell, Science (comma-separated)" className="w-full bg-navy-800 border border-navy-600 rounded-md shadow-sm p-2 text-sm text-slate-200 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition placeholder:text-slate-500" value={searchFilters.journals} onChange={e => setSearchFilters({...searchFilters, journals: e.target.value})} />
            </div>
        </div>
      </div>

      <div>
         <label className="block text-sm font-medium text-slate-300 mb-3">
          <span className="text-cyan-400 font-semibold">Step 3:</span> Choose Strategy
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {COMMENT_STYLES.map((style) => {
            const Icon = style.icon;
            return (
              <button
                  key={style.id}
                  type="button"
                  onClick={() => setCommentStyle(style.id)}
                  className={`text-left p-4 border rounded-lg transition-all duration-200 flex items-start space-x-4 ${
                      commentStyle === style.id
                      ? 'bg-cyan-500/10 border-cyan-500 ring-2 ring-cyan-500/50'
                      : 'bg-navy-800 hover:bg-navy-700/50 border-navy-700'
                  }`}
                  aria-pressed={commentStyle === style.id}
              >
                  <Icon className={`w-6 h-6 mt-0.5 flex-shrink-0 ${commentStyle === style.id ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <div>
                    <p className="font-semibold text-slate-100">{style.title}</p>
                    <p className="text-xs text-slate-400 mt-1">{style.description}</p>
                  </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-navy-700">
        <button
          onClick={onGenerate}
          disabled={isLoading || !postText.trim()}
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
                Generate
              </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PostInput;