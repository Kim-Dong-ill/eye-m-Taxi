import React from 'react';
import { useTheme } from '../components/contain/ThemeContext';
import '../css/colorPalette.scss';

const ColorPalette = () => {
  const { themeColor, setThemeColor, backgroundColor, setBackgroundColor } = useTheme();
  
  return (
    <div className="color-palette">
      <div className="palette-section">
        <h2>테마</h2>
        <div className="color-picker" aria-label='테마 색상 선택'>
          <input
            type="color"
            value={themeColor}
            onChange={(e) => setThemeColor(e.target.value)}
            className="color-input"
            aria-label='테마 색상 선택'
          />
        </div>
      </div>
      
      <div className="palette-section">
        <h2>배경</h2>
        <div className="color-picker" aria-label='배경 색상 선택'>
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            className="color-input"
            aria-label='배경 색상 선택'
          />
        </div>
      </div>
    </div>
  );
};

export default ColorPalette;