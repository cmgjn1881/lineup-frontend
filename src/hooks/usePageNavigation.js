// src/hooks/usePageNavigation.js

import { useState, useEffect } from 'react';
import { useBlocker } from 'react-router-dom';

export const usePageNavigation = (isDirty, onResetConfirm) => {
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    onClose: () => {},
    confirmText: '확인',
    cancelText: '취소',
  });

  // 변경 사항이 있을 때만 페이지 이동을 막는 Blocker 설정
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => isDirty && currentLocation.pathname !== nextLocation.pathname
  );

  // Blocker의 상태가 'blocked'일 때 모달을 띄움
  useEffect(() => {
    if (blocker.state === 'blocked') {
      setConfirmDialog({
        isOpen: true,
        title: '페이지를 나가시겠습니까?',
        message: '저장되지 않은 변경사항이 있습니다.\n정말로 페이지를 나가시겠습니까?',
        onConfirm: () => blocker.proceed(),
        onClose: () => blocker.reset(),
        confirmText: '나가기',
        cancelText: '머무르기',
      });
    }
  }, [blocker]);

  // 포메이션 초기화 핸들러
  const handleReset = () => {
    setConfirmDialog({
      isOpen: true,
      title: '포메이션 초기화',
      message: '정말로 현재 포메이션을 초기 상태로 되돌리시겠습니까?\n저장되지 않은 변경 사항은 손실됩니다.',
      onConfirm: onResetConfirm,
      confirmText: '초기화',
      cancelText: '취소',
    });
  };

  return { confirmDialog, setConfirmDialog, handleReset };
};
