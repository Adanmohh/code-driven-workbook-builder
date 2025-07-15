import React, { useState } from 'react';
import { BrandKit } from '../types';
import { Palette, Type, Image } from 'lucide-react';

interface BrandPanelProps {
  brandKit: BrandKit;
  onUpdate: (brandKit: BrandKit) => void;
}

const BrandPanel: React.FC<BrandPanelProps> = ({ brandKit, onUpdate }) => {
  const [localBrandKit, setLocalBrandKit] = useState(brandKit);

  const handleColorChange = (key: keyof BrandKit, value: string) => {
    const updated = { ...localBrandKit, [key]: value };
    setLocalBrandKit(updated);
    onUpdate(updated);
  };

  const handleFontChange = (key: keyof BrandKit, value: string) => {
    const updated = { ...localBrandKit, [key]: value };
    setLocalBrandKit(updated);
    onUpdate(updated);
  };

  const fonts = [
    'Inter',
    'Roboto',
    'Open Sans',
    'Lato',
    'Montserrat',
    'Poppins',
    'Raleway',
    'Playfair Display',
    'Merriweather',
  ];

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center">
        <Palette className="w-5 h-5 mr-2" />
        Brand Kit
      </h3>

      {/* Colors */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-600 flex items-center">
          <Palette className="w-4 h-4 mr-1" />
          Colors
        </h4>
        
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-500">Primary Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={localBrandKit.primaryColor}
                onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={localBrandKit.primaryColor}
                onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                className="flex-1 px-2 py-1 text-sm border rounded"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500">Secondary Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={localBrandKit.secondaryColor}
                onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={localBrandKit.secondaryColor}
                onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                className="flex-1 px-2 py-1 text-sm border rounded"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500">Accent Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={localBrandKit.accentColor}
                onChange={(e) => handleColorChange('accentColor', e.target.value)}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={localBrandKit.accentColor}
                onChange={(e) => handleColorChange('accentColor', e.target.value)}
                className="flex-1 px-2 py-1 text-sm border rounded"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Fonts */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-600 flex items-center">
          <Type className="w-4 h-4 mr-1" />
          Typography
        </h4>
        
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-500">Primary Font</label>
            <select
              value={localBrandKit.fontPrimary}
              onChange={(e) => handleFontChange('fontPrimary', e.target.value)}
              className="w-full px-2 py-1 text-sm border rounded"
            >
              {fonts.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500">Secondary Font</label>
            <select
              value={localBrandKit.fontSecondary}
              onChange={(e) => handleFontChange('fontSecondary', e.target.value)}
              className="w-full px-2 py-1 text-sm border rounded"
            >
              {fonts.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Logo */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-600 flex items-center">
          <Image className="w-4 h-4 mr-1" />
          Logo
        </h4>
        <button className="w-full py-2 px-3 text-sm border-2 border-dashed border-gray-300 rounded hover:border-gray-400 transition-colors">
          Upload Logo
        </button>
      </div>
    </div>
  );
};

export default BrandPanel;