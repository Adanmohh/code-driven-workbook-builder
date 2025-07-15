import React from 'react';
import { Page } from '../types';
import { FileText } from 'lucide-react';

interface PageNavigatorProps {
  pages: Page[];
  currentPageIndex: number;
  onPageSelect: (index: number) => void;
}

const PageNavigator: React.FC<PageNavigatorProps> = ({
  pages,
  currentPageIndex,
  onPageSelect,
}) => {
  return (
    <div className="w-64 bg-gray-100 border-r flex flex-col">
      <div className="p-4 border-b bg-white">
        <h2 className="text-lg font-semibold text-gray-800">Pages</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {pages.map((page, index) => (
          <div
            key={index}
            onClick={() => onPageSelect(index)}
            className={`
              p-3 rounded-lg cursor-pointer transition-all
              ${index === currentPageIndex
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-white hover:bg-gray-50 text-gray-700'
              }
            `}
          >
            <div className="flex items-center space-x-3">
              <FileText className={`w-5 h-5 ${
                index === currentPageIndex ? 'text-white' : 'text-gray-400'
              }`} />
              <div className="flex-1">
                <p className="font-medium text-sm">Page {index + 1}</p>
                <p className={`text-xs ${
                  index === currentPageIndex ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {page.title || 'Untitled'}
                </p>
              </div>
            </div>
            
            {/* Thumbnail Preview */}
            <div className="mt-2 h-32 bg-gray-50 rounded border overflow-hidden">
              <div className="transform scale-50 origin-top-left w-[200%] h-[200%]">
                <div className="p-4 bg-white text-gray-800 text-xs">
                  {page.code.substring(0, 150)}...
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PageNavigator;