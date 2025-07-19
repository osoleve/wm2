import React from 'react';

interface SimpleLoggingDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

const SimpleLoggingDashboard: React.FC<SimpleLoggingDashboardProps> = ({ isOpen, onClose }) => {
  
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        maxWidth: '500px',
        width: '100%'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Session History</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>
        </div>
        <p>This is a simplified logging dashboard to test the functionality.</p>
        <p>If you can see this, the modal is working correctly.</p>
        <button onClick={onClose} style={{ padding: '10px 20px', marginTop: '10px' }}>Close</button>
      </div>
    </div>
  );
};

export default SimpleLoggingDashboard;