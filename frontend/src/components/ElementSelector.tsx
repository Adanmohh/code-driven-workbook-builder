import React, { useState, useRef, useEffect } from 'react';
import { MousePointer, Code } from 'lucide-react';

interface ElementSelectorProps {
  iframeRef: React.RefObject<HTMLIFrameElement>;
  onElementSelected: (element: string, code: string) => void;
}

const ElementSelector: React.FC<ElementSelectorProps> = ({ iframeRef, onElementSelected }) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [highlightedElement, setHighlightedElement] = useState<Element | null>(null);
  
  useEffect(() => {
    if (!iframeRef.current || !isSelecting) return;

    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument;
    if (!iframeDoc) return;

    const handleMouseOver = (e: MouseEvent) => {
      e.preventDefault();
      const target = e.target as Element;
      
      // Remove previous highlights
      iframeDoc.querySelectorAll('.element-highlight').forEach(el => {
        el.classList.remove('element-highlight');
      });
      
      // Add highlight to current element
      target.classList.add('element-highlight');
      setHighlightedElement(target);
    };

    const handleClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      const target = e.target as Element;
      const selector = generateSelector(target);
      const code = target.outerHTML;
      
      setSelectedElement(selector);
      setIsSelecting(false);
      onElementSelected(selector, code);
      
      // Remove highlight
      target.classList.remove('element-highlight');
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSelecting(false);
        // Remove all highlights
        iframeDoc.querySelectorAll('.element-highlight').forEach(el => {
          el.classList.remove('element-highlight');
        });
      }
    };

    // Add styles for highlighting
    const style = iframeDoc.createElement('style');
    style.textContent = `
      .element-highlight {
        outline: 2px solid #3b82f6 !important;
        outline-offset: 2px;
        background-color: rgba(59, 130, 246, 0.1) !important;
        cursor: pointer !important;
      }
    `;
    iframeDoc.head.appendChild(style);

    // Add event listeners
    iframeDoc.addEventListener('mouseover', handleMouseOver);
    iframeDoc.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      iframeDoc.removeEventListener('mouseover', handleMouseOver);
      iframeDoc.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
      
      // Remove style
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, [isSelecting, iframeRef, onElementSelected]);

  const generateSelector = (element: Element): string => {
    if (element.id) {
      return `#${element.id}`;
    }
    
    if (element.className) {
      const classes = element.className.split(' ').filter(cls => cls.trim());
      if (classes.length > 0) {
        return `.${classes.join('.')}`;
      }
    }
    
    // Fallback to tag name with nth-child
    const parent = element.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children);
      const index = siblings.indexOf(element) + 1;
      return `${element.tagName.toLowerCase()}:nth-child(${index})`;
    }
    
    return element.tagName.toLowerCase();
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => setIsSelecting(!isSelecting)}
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          isSelecting
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
        title="Select element in preview"
      >
        <MousePointer className="w-4 h-4 mr-1 inline" />
        {isSelecting ? 'Selecting...' : 'Select Element'}
      </button>
      
      {selectedElement && (
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Code className="w-4 h-4" />
          <span className="font-mono">{selectedElement}</span>
        </div>
      )}
      
      {isSelecting && (
        <span className="text-xs text-gray-500">
          Click an element to select it, or press Escape to cancel
        </span>
      )}
    </div>
  );
};

export default ElementSelector;