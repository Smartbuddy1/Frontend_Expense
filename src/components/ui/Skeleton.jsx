import React from 'react';

const Skeleton = ({ width, height, borderRadius, style, variant = 'rectangular' }) => {
  const baseStyle = {
    backgroundColor: 'var(--border-color, #e2e8f0)',
    position: 'relative',
    overflow: 'hidden',
    width: width || '100%',
    height: height || '100%',
    borderRadius: borderRadius || (variant === 'circular' ? '50%' : '8px'),
    ...style
  };

  return (
    <div style={baseStyle} className="skeleton-loader">
      <style>
        {`
          @keyframes shimmer {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }
          .skeleton-loader::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%);
            animation: shimmer 1.5s infinite;
          }
        `}
      </style>
    </div>
  );
};

export default Skeleton;
