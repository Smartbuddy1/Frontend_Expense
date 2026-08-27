import React from 'react';
import logoImg from '../assets/logo.png';

export const AsemsLogo = ({ size = 'normal' }) => {
  const isLarge = size === 'large';
  const isSmall = size === 'small';

  const logoHeight = isLarge ? '48px' : isSmall ? '24px' : '34px';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      userSelect: 'none'
    }}>
      <img
        src={logoImg}
        alt="Logo"
        style={{
          height: logoHeight,
          width: 'auto',
          maxWidth: '95px',
          maxHeight: isLarge ? '50px' : isSmall ? '26px' : '36px',
          objectFit: 'contain',
          display: 'block',
          transition: 'transform 0.2s ease'
        }}
      />
    </div>
  );
};

export default AsemsLogo;
