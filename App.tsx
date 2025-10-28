import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import PostInput from './components/PostInput';
import ResponseOutput from './components/ResponseOutput';
import { generateLinkedInComment, refineLinkedInComment } from './services/geminiService';
import type { GroundingChunk, QualityCheck, SearchFilters, ErrorResponse } from './types';
import { GOOGLE_SEARCH_SUGGESTIONS, COMMENT_STYLES } from './constants';
import { StructuredError } from './services/errorHandler';

const App: React.FC = () => {
  const [postText, setPostText] = useState<string>('');
  const [userPersona, setUserPersona] = useState<string>('');
  const [commentStyle, setCommentStyle] = useState<string>(COMMENT_STYLES[0].id);
  const [generatedComment, setGeneratedComment] = useState<string>('');
  const [sources, setSources] = useState<GroundingChunk[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [error, setError] = useState<ErrorResponse | string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [chosenAngle, setChosenAngle] = useState<string>('');
  const [qualityCheck, setQualityCheck] = useState<QualityCheck | null>(null);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({ startDate: '', endDate: '', journals: '' });

  const handleGenerateComment = useCallback(async () => {
    if (!postText.trim()) {
      setError('Please enter the post text.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setWarning(null);
    setGeneratedComment('');
    setSources([]);
    setChosenAngle('');
    setQualityCheck(null);

    try {
      const result = await generateLinkedInComment(postText, commentStyle, userPersona, searchFilters);
      setGeneratedComment(result.comment);
      setSources(result.sources);
      setChosenAngle(result.chosenAngle);
      setQualityCheck(result.qualityCheck);
      if (result.warning) {
        setWarning(result.warning);
      }
    } catch (err) {
      if (err instanceof StructuredError) {
        setError(err.response);
      } else {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [postText, commentStyle, userPersona, searchFilters]);
  
  const handleRefineComment = useCallback(async (refinementInstruction: string) => {
    if (!generatedComment) return;

    setIsRefining(true);
    setError(null);
    setWarning(null);

    try {
      const result = await refineLinkedInComment(postText, generatedComment, refinementInstruction, userPersona, searchFilters);
       setGeneratedComment(result.comment);
      setSources(result.sources);
      setChosenAngle(result.chosenAngle);
      setQualityCheck(result.qualityCheck);
      if (result.warning) {
        setWarning(result.warning);
      }
    } catch (err) {
       if (err instanceof StructuredError) {
        setError(err.response);
      } else {
        setError(err instanceof Error ? `Refinement failed: ${err.message}`: 'An unknown refinement error occurred.');
      }
    } finally {
      setIsRefining(false);
    }
  }, [postText, generatedComment, userPersona, searchFilters]);


  return (
    <div className="min-h-screen flex flex-col bg-navy-950">
      <Header />
      <main className="flex-grow container mx-auto p-4 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-8">
          {/* Left Panel: Inputs */}
          <div className="space-y-6">
            <PostInput
              postText={postText}
              setPostText={setPostText}
              userPersona={userPersona}
              setUserPersona={setUserPersona}
              commentStyle={commentStyle}
              setCommentStyle={setCommentStyle}
              onGenerate={handleGenerateComment}
              isLoading={isLoading}
              searchFilters={searchFilters}
              setSearchFilters={setSearchFilters}
            />
          </div>

          {/* Right Panel: Outputs */}
          <div className="mt-8 lg:mt-0">
            <ResponseOutput
              isLoading={isLoading}
              isRefining={isRefining}
              error={error}
              warning={warning}
              comment={generatedComment}
              sources={sources}
              onRefine={handleRefineComment}
              chosenAngle={chosenAngle}
              qualityCheck={qualityCheck}
            />
          </div>
        </div>
        
        {/* Search Suggestions Footer */}
        {sources.length > 0 && (
            <div className="w-full max-w-5xl mx-auto mt-8 bg-navy-900 p-4 rounded-lg text-xs text-slate-400 border border-navy-700">
              <p className="font-semibold mb-2">Google Search Suggestions:</p>
              <ul className="list-disc list-inside space-y-1">
                {GOOGLE_SEARCH_SUGGESTIONS.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                ))}
              </ul>
              <p className="mt-4">Display of Search Suggestions is required when using Grounding with Google Search. <a href="https://developers.google.com/gemini-api/docs/grounding" target="_blank" rel="noopener noreferrer" className="underline hover:text-cyan-400">Learn more</a>.</p>
            </div>
          )}
      </main>
      <footer className="text-center p-4 text-sm text-slate-500">
        <p>Powered by Google Gemini 2.5 Pro with Thinking Budget</p>
      </footer>
    </div>
  );
};

export default App;