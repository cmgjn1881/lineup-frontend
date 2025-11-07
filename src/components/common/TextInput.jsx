// src/components/TextInput.jsx

import React from 'react';

const TextInput = (props) => {
  return (
    // 💡 [수정] 세로 크기를 줄이기 위해 상하 패딩(py)을 py-2에서 py-1.5로 조정합니다.
    // 💡 [수정] 테두리를 더 둥글게 하기 위해 rounded-lg를 rounded-xl로 변경합니다.
    <input
      {...props}
      className="w-full px-4 py-1.5 border rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-xs bg-white placeholder:text-[#6B6B6B]"
    />
  );
};

export default TextInput;
