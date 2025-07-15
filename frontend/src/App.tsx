import { useState } from 'react';
import { Workbook, Page, BrandKit } from './types';
import FileUpload from './components/FileUpload';
import Editor from './components/Editor';
import PageNavigator from './components/PageNavigator';
import BrandPanel from './components/BrandPanel';
import AIAssistant from './components/AIAssistant';
import PreviewCanvas from './components/PreviewCanvas';
import { Upload } from 'lucide-react';

function App() {
  const [workbook, setWorkbook] = useState<Workbook | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [selectedElementCode, setSelectedElementCode] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/api/generate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to generate workbook');
      }

      const data = await response.json();
      const initialBrandKit: BrandKit = {
        primaryColor: '#3b82f6',
        secondaryColor: '#8b5cf6',
        accentColor: '#10b981',
        fontPrimary: 'Inter',
        fontSecondary: 'Roboto',
      };

      setWorkbook({
        pages: data.pages,
        brandKit: initialBrandKit,
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to process file. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageUpdate = (pageIndex: number, newCode: string) => {
    if (!workbook) return;

    const updatedPages = [...workbook.pages];
    updatedPages[pageIndex] = {
      ...updatedPages[pageIndex],
      code: newCode,
    };

    setWorkbook({
      ...workbook,
      pages: updatedPages,
    });
  };

  const handleBrandUpdate = (brandKit: BrandKit) => {
    if (!workbook) return;

    setWorkbook({
      ...workbook,
      brandKit,
    });
  };

  const handleElementSelected = (element: string, code: string) => {
    setSelectedElement(element);
    setSelectedElementCode(code);
  };

  if (!workbook) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Code-Driven Workbook Builder
          </h1>
          <p className="text-gray-600 mb-8">
            Upload a PDF or image to create an editable workbook
          </p>
          <FileUpload onUpload={handleFileUpload} isLoading={isLoading} />
        </div>
      </div>
    );
  }

  const currentPage = workbook.pages[currentPageIndex];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Page Navigator */}
      <PageNavigator
        pages={workbook.pages}
        currentPageIndex={currentPageIndex}
        onPageSelect={setCurrentPageIndex}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex">
          {/* Code Editor */}
          <div className="w-1/2 border-r">
            <Editor
              code={currentPage.code}
              onChange={(code) => handlePageUpdate(currentPageIndex, code)}
            />
          </div>

          {/* Preview Canvas */}
          <div className="w-1/2">
            <PreviewCanvas
              page={currentPage}
              brandKit={workbook.brandKit}
              allPages={workbook.pages}
              onElementSelected={handleElementSelected}
            />
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-80 border-l bg-white flex flex-col">
        {/* Brand Panel */}
        <BrandPanel
          brandKit={workbook.brandKit}
          onUpdate={handleBrandUpdate}
        />

        {/* AI Assistant */}
        <div className="flex-1 border-t">
          <AIAssistant
            currentPageIndex={currentPageIndex}
            currentCode={currentPage.code}
            onCodeUpdate={(code) => handlePageUpdate(currentPageIndex, code)}
            selectedElement={selectedElement}
            selectedElementCode={selectedElementCode}
          />
        </div>
      </div>
    </div>
  );
}

export default App;