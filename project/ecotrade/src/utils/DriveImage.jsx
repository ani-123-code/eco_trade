import React from 'react';

const DriveImage = ({ src, alt, className, onError, ...props }) => {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={onError}
      {...props}
    />
  );
};

export default DriveImage;