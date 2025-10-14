'use client';

import { useState, useEffect } from 'react';

interface StreamingResponseProps {
  response: string;
  isStreaming?: boolean;
}

export function StreamingResponse({ response, isStreaming = false }: StreamingResponseProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!isStreaming) {
      setDisplayedText(response);
      return;
    }

    // Reset when new response starts
    if (response.length < displayedText.length) {
      setDisplayedText('');
      setCurrentIndex(0);
    }

    // Stream the text character by character if it's longer than what we're displaying
    if (response.length > displayedText.length) {
      const timer = setTimeout(() => {
        setDisplayedText(response.slice(0, currentIndex + 1));
        setCurrentIndex((prev) => prev + 1);
      }, 20); // Adjust speed here (lower = faster)

      return () => clearTimeout(timer);
    }
  }, [response, isStreaming, displayedText.length, currentIndex]);

  if (!response && !displayedText) {
    return null;
  }

  return (
    <div className="mt-4 p-4 bg-gray-900 rounded-lg border border-gray-800">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-300 mb-1">AI Assistant</div>
          <div className="text-white whitespace-pre-wrap break-words">
            {displayedText}
            {isStreaming && displayedText.length < response.length && <span className="inline-block w-2 h-5 bg-blue-500 ml-1 animate-pulse" />}
          </div>
        </div>
      </div>
    </div>
  );
}
