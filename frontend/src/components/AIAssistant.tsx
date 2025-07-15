import React, { useState } from 'react';
import { AIMessage } from '../types';
import { Send, Bot, User } from 'lucide-react';

interface AIAssistantProps {
  currentPageIndex: number;
  currentCode: string;
  onCodeUpdate: (code: string) => void;
  selectedElement?: string | null;
  selectedElementCode?: string | null;
}

const AIAssistant: React.FC<AIAssistantProps> = ({
  currentPageIndex,
  currentCode,
  onCodeUpdate,
  selectedElement,
  selectedElementCode,
}) => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: AIMessage = {
      role: 'user',
      content: input,
      pageIndex: currentPageIndex,
    };

    setMessages([...messages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const requestBody = {
        page_index: currentPageIndex,
        code: currentCode,
        instruction: selectedElement 
          ? `${input} (Focus on the selected element: ${selectedElement})`
          : input,
      };
      
      const response = await fetch('http://localhost:8000/api/rewrite_page', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      const assistantMessage: AIMessage = {
        role: 'assistant',
        content: 'I\'ve updated the code based on your request.',
        pageIndex: currentPageIndex,
      };

      setMessages([...messages, userMessage, assistantMessage]);
      onCodeUpdate(data.code);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: AIMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        pageIndex: currentPageIndex,
      };
      setMessages([...messages, userMessage, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Bot className="w-5 h-5 mr-2" />
          AI Assistant
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          Ask me to modify page {currentPageIndex + 1}
          {selectedElement && (
            <span className="block text-blue-600 mt-1">
              Selected: {selectedElement}
            </span>
          )}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <Bot className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">
              I can help you modify this page.
            </p>
            <p className="text-xs mt-2">
              Try: "Make the headings larger" or "Add a blue background"
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <div className="flex items-center mb-1">
                  {message.role === 'user' ? (
                    <User className="w-4 h-4 mr-1" />
                  ) : (
                    <Bot className="w-4 h-4 mr-1" />
                  )}
                  <span className="text-xs font-medium">
                    {message.role === 'user' ? 'You' : 'AI Assistant'}
                  </span>
                </div>
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                <span className="text-sm text-gray-600">Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me to modify this page..."
            className="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default AIAssistant;