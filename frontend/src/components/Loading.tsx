import React from 'react';

interface LoadingProps {
  variant?: 'spinner' | 'skeleton';
  size?: 'small' | 'medium' | 'large';
  text?: string;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({
  variant = 'spinner',
  size = 'medium',
  text,
  className = '',
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  };

  if (variant === 'skeleton') {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className={`
          ${sizeClasses[size]}
          bg-gray-200 
          rounded-md
          dark:bg-gray-700
        `} />
        {text && (
          <div className={`
            h-4 
            bg-gray-200 
            rounded-md 
            dark:bg-gray-700 
            mt-2
            ${textSizeClasses[size]}
          `}>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`
        ${sizeClasses[size]}
        border-4
        border-gray-200
        border-t-blue-500
        rounded-full
        animate-spin
        dark:border-gray-700
        dark:border-t-blue-400
      `} />
      {text && (
        <p className={`
          mt-2
          text-gray-600
          dark:text-gray-300
          ${textSizeClasses[size]}
        `}>
          {text}
        </p>
      )}
    </div>
  );
};

export default Loading;