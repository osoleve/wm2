import React, { useState } from 'react';
import { PrismPerspective } from '../types';
import './PrismTabs.css';

interface PrismResponse {
  synthesis?: string;
  content?: string;
  perspectives?: PrismPerspective[];
}

interface PrismTabsProps {
  responses: PrismResponse;
}

export const PrismTabs: React.FC<PrismTabsProps> = ({ responses }) => {
  const [activeTab, setActiveTab] = useState<string>('synthesis');
  
  if (!responses || !responses.perspectives) {
    return null;
  }

  const perspectives = responses.perspectives || [];
  
  return (
    <div className="prism-tabs-container">
      <div className="prism-tabs">
        <button
          className={`prism-tab touch-target ${activeTab === 'synthesis' ? 'active breathing-glow' : ''}`}
          onClick={() => setActiveTab('synthesis')}
        >
          Synthesis
        </button>
        
        {perspectives.map((perspective, index) => (
          <button
            key={index}
            className={`prism-tab touch-target ${activeTab === perspective.perspective ? 'active breathing-glow' : ''}`}
            onClick={() => setActiveTab(perspective.perspective)}
          >
            {perspective.perspective}
          </button>
        ))}
      </div>
      
      <div className="prism-content">
        {activeTab === 'synthesis' ? (
          <div className="prism-synthesis">
            {responses.synthesis || responses.content}
          </div>
        ) : (
          <div className="prism-perspective">
            {perspectives.find(p => p.perspective === activeTab)?.content}
          </div>
        )}
      </div>
    </div>
  );
};