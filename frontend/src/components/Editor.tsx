import React from 'react';
import { Sandpack } from '@codesandbox/sandpack-react';
import { sandpackDark } from '@codesandbox/sandpack-themes';
import CodeExecutor from './CodeExecutor';

interface EditorProps {
  code: string;
  onChange: (code: string) => void;
}

const Editor: React.FC<EditorProps> = ({ code, onChange }) => {
  const files = {
    '/App.tsx': code,
    '/index.tsx': `
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
    `,
    '/styles.css': `
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-primary, 'Inter', sans-serif);
  color: var(--color-text, #1f2937);
  background-color: var(--color-background, #ffffff);
}
    `,
  };

  return (
    <div className="h-full flex flex-col">
      <div className="h-12 bg-gray-800 flex items-center px-4 border-b">
        <h3 className="text-white font-medium">Code Editor</h3>
      </div>
      
      <div className="flex-1 flex flex-col">
        <div className="flex-1">
          <Sandpack
            template="react-ts"
            files={files}
            theme={sandpackDark}
            options={{
              showNavigator: false,
              showTabs: true,
              showLineNumbers: true,
              showInlineErrors: true,
              wrapContent: true,
              editorHeight: "100%",
              bundlerTimeOut: 30000,
            }}
            customSetup={{
              dependencies: {
                "react": "^18.2.0",
                "react-dom": "^18.2.0",
                "tailwindcss": "^3.4.0",
                "lucide-react": "^0.263.1",
              },
            }}
          />
        </div>
        
        <div className="border-t p-4 bg-white">
          <CodeExecutor code={code} />
        </div>
      </div>
    </div>
  );
};

export default Editor;