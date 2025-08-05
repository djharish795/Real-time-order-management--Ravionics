import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({ 
  size = 'lg', 
  text = 'Loading...', 
  fullScreen = false 
}) => {
  const content = (
    <div className="d-flex flex-column align-items-center justify-content-center p-4 fade-in">
      <div className="loading-spinner"></div>
      {text && <p className="mt-3 mb-0 text-muted pulse-animation">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="d-flex align-items-center justify-content-center" 
           style={{ minHeight: '50vh' }}>
        {content}
      </div>
    );
  }

  return content;
};
