import React, { useState } from 'react';
import './PrismTabs.css';

export const PrismTabs = ({ responses }) => {
  const [activeTab, setActiveTab] = useState('synthesis');
  
  if (!responses || !responses.perspectives) {
    return null;
  }

  const perspectives = responses.perspectives || [];
  
  return (
    <div className="prism-tabs-container">
      <div className="prism-tabs">
        <button
          className={`prism-tab ${activeTab === 'synthesis' ? 'active' : ''}`}
          onClick={() => setActiveTab('synthesis')}
        >
          Synthesis
        </button>
        
        {perspectives.map((perspective, index) => (
          <button
            key={index}
            className={`prism-tab ${activeTab === perspective.perspective ? 'active' : ''}`}
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
