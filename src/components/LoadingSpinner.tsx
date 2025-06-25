import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-teal-600 text-lg font-semibold">Loading, please wait...</p>
    </div>
  );
};

export default LoadingSpinner;
