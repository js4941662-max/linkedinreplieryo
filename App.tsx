import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import PostInput from './components/PostInput';
import ResponseOutput from './components/ResponseOutput';
import { answerQuestion } from './services/geminiService';
import type { ErrorResponse } from './types';
import { StructuredError } from './services/errorHandler';

const App: React.FC = () => {
  const [question, setQuestion] = useState<string>('');
  const [answer, setAnswer] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<ErrorResponse | string | null>(null);

  const handleAskQuestion = useCallback(async () => {
    if (!question.trim()) {
      setError('Please enter a question.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnswer('');

    try {
      const result = await answerQuestion(question);
      setAnswer(result);
    } catch (err) {
      if (err instanceof StructuredError) {
        setError(err.response);
      } else {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [question]);


  return (
    <div className="min-h-screen flex flex-col bg-navy-950">
      <Header />
      <main className="flex-grow container mx-auto p-4 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-8">
          {/* Left Panel: Inputs */}
          <div className="space-y-6">
            <PostInput
              question={question}
              setQuestion={setQuestion}
              onAsk={handleAskQuestion}
              isLoading={isLoading}
            />
          </div>

          {/* Right Panel: Outputs */}
          <div className="mt-8 lg:mt-0">
            <ResponseOutput
              isLoading={isLoading}
              error={error}
              answer={answer}
            />
          </div>
        </div>
      </main>
      <footer className="text-center p-4 text-sm text-slate-500">
        <p>Powered by Google Gemini</p>
      </footer>
    </div>
  );
};

export default App;