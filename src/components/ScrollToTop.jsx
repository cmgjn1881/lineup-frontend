// src/components/ScrollToTop.jsx (수정)

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// 🔑 [수정] targetRef prop을 받습니다.
const ScrollToTop = ({ targetRef }) => {
  const location = useLocation();

  useEffect(() => {
    // 🔑 [핵심 수정] window 대신 ref의 DOM 요소에 scrollTo 호출
    if (targetRef.current) {
      targetRef.current.scrollTo(0, 0);
    }
  }, [location.pathname, targetRef]); // targetRef를 의존성 배열에 추가

  return null;
};

export default ScrollToTop;
