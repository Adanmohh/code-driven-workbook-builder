import React, { useState } from 'react';
import { Play, Terminal, X } from 'lucide-react';

interface CodeExecutorProps {
  code: string;
  language?: string;
}

const CodeExecutor: React.FC<CodeExecutorProps> = ({ code, language = 'javascript' }) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [output, setOutput] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeCode = async () => {
    setIsExecuting(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8000/api/execute-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to execute code');
      }

      const result = await response.json();
      setOutput(result.output);
      setIsExpanded(true);
      
      if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setOutput('Failed to execute code');
      setIsExpanded(true);
    } finally {
      setIsExecuting(false);
    }
  };

  const extractCodeSnippet = (code: string): string => {
    // Try to extract executable code from React component
    // This is a simple heuristic - in a real app, you'd want more sophisticated parsing
    const lines = code.split('\n');
    const codeLines = lines.filter(line => 
      !line.trim().startsWith('import') && 
      !line.trim().startsWith('export') &&
      !line.trim().startsWith('//') &&
      !line.includes('React.FC') &&
      !line.includes('interface') &&
      !line.includes('return (') &&
      !line.includes('</div>') &&
      !line.includes('<div') &&
      line.trim() !== ''
    );
    
    return codeLines.join('\n') || 'console.log("Hello from workbook!");';
  };

  return (
    <div className="border rounded-lg bg-gray-50">
      <div className="flex items-center justify-between p-3 border-b bg-white">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Code Executor</span>
        </div>
        <button
          onClick={executeCode}
          disabled={isExecuting}
          className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
        >
          {isExecuting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          <span>{isExecuting ? 'Running...' : 'Run Code'}</span>
        </button>
      </div>

      {isExpanded && (
        <div className="p-3 bg-gray-900 text-gray-100 font-mono text-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-400">Output:</span>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <pre className="whitespace-pre-wrap">
            {error ? (
              <span className="text-red-400">Error: {error}</span>
            ) : (
              output || 'No output'
            )}
          </pre>
        </div>
      )}

      <div className="p-3 text-xs text-gray-600 bg-gray-50 border-t">
        <p>
          <strong>Note:</strong> This will execute JavaScript code in a secure sandbox. 
          Complex React components may not run directly - consider extracting pure JS logic.
        </p>
      </div>
    </div>
  );
};

export default CodeExecutor;