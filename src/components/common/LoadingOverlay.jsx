// src/components/common/LoadingOverlay.jsx

import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingOverlay = ({ isActive, mainText, subText }) => {
  if (!isActive) return null;

  return (
    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-50">
      <Loader2 className="w-10 h-10 text-[#63FF70] animate-spin" />
      <p className="mt-4 text-lg text-white font-semibold">{mainText}</p>
      <p className="mt-1 text-sm text-gray-400">{subText}</p>
    </div>
  );
};

export default LoadingOverlay;
