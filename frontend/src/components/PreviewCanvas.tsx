import React, { useEffect, useRef, useState } from 'react';
import { Page, BrandKit } from '../types';
import { Printer, Download } from 'lucide-react';
import ElementSelector from './ElementSelector';

interface PreviewCanvasProps {
  page: Page;
  brandKit: BrandKit;
  allPages?: Page[];
  onElementSelected?: (element: string, code: string) => void;
}

const PreviewCanvas: React.FC<PreviewCanvasProps> = ({ page, brandKit, allPages = [page], onElementSelected }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  const handleElementSelected = (element: string, code: string) => {
    if (onElementSelected) {
      onElementSelected(element, code);
    }
  };

  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        // Inject brand styles and page content
        const html = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                :root {
                  --color-primary: ${brandKit.primaryColor};
                  --color-secondary: ${brandKit.secondaryColor};
                  --color-accent: ${brandKit.accentColor};
                  --font-primary: '${brandKit.fontPrimary}', sans-serif;
                  --font-secondary: '${brandKit.fontSecondary}', sans-serif;
                }
                
                * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                }
                
                body {
                  font-family: var(--font-primary);
                  color: var(--color-text, #1f2937);
                  background-color: var(--color-background, #ffffff);
                  padding: 2rem;
                }
                
                @media print {
                  body {
                    padding: 0;
                  }
                }
              </style>
            </head>
            <body>
              <div id="root"></div>
              <script type="module">
                ${page.code}
              </script>
            </body>
          </html>
        `;
        
        doc.open();
        doc.write(html);
        doc.close();
      }
    }
  }, [page.code, brandKit]);

  const handlePrint = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.print();
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('http://localhost:8000/api/export-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pages: allPages,
          brandKit: brandKit,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to export PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'workbook.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="h-12 bg-gray-100 flex items-center justify-between px-4 border-b">
        <h3 className="font-medium text-gray-800">Preview</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrint}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Print"
          >
            <Printer className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="p-2 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
            title="Export PDF"
          >
            {isExporting ? (
              <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </div>
      </div>
      
      {/* Element Selector */}
      {onElementSelected && (
        <div className="px-4 py-2 bg-white border-b">
          <ElementSelector
            iframeRef={iframeRef}
            onElementSelected={handleElementSelected}
          />
        </div>
      )}
      
      <div className="flex-1 bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-sm h-full">
          <iframe
            ref={iframeRef}
            className="w-full h-full rounded-lg"
            title="Preview"
            sandbox="allow-scripts"
          />
        </div>
      </div>
    </div>
  );
};

export default PreviewCanvas;