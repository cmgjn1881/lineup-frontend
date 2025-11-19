// src/hooks/useFormationManager.js

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

export const useFormationManager = ({
  api,
  teamId,
  isDirty,
  formationsByQuarter,
  loadFormation,
  resetIsDirty,
  setConfirmDialog,
  teamPlayers,
  referees,
  setReferees,
}) => {
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [newFormationName, setNewFormationName] = useState('');
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
  const [savedFormations, setSavedFormations] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const [editingFormationId, setEditingFormationId] = useState(null);
  const [currentFormationName, setCurrentFormationName] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingFormation, setIsLoadingFormation] = useState(false);

  const handleLoad = useCallback(async () => {
    setLoadError(null);
    try {
      const response = await api.getFormationList(teamId);
      setSavedFormations(response.data);
      setIsLoadModalOpen(true);
    } catch (error) {
      const errorMessage = '포메이션 목록을 불러오는 데 실패했습니다.';
      setLoadError(errorMessage);
      toast.error(errorMessage);
      console.error(error);
    }
  }, [api, teamId]);

  const handleSave = async () => {
    let hasContent = false;
    for (const quarterNum in formationsByQuarter) {
      const formation = formationsByQuarter[quarterNum];
      const isQuarterStarted = formation.some((player) => player.dbPlayerId !== null);
      if (isQuarterStarted) {
        hasContent = true;
        const isComplete = formation.every((player) => player.dbPlayerId !== null);
        if (!isComplete) {
          toast.error(`저장할 수 없습니다: ${quarterNum}쿼터의 모든 포지션에 선수를 할당해 주세요.`);
          return;
        }
      }
    }
    if (!hasContent) {
      toast.error('저장할 내용이 없습니다. 최소 한 명 이상의 선수를 배치해 주세요.');
      return;
    }
    setIsSaveModalOpen(true);
  };

  const handleConfirmSave = async () => {
    if (!newFormationName.trim()) {
      toast.error('포메이션 이름을 입력해 주세요.');
      return;
    }

    const nameToDisplay = newFormationName;
    setIsSaveModalOpen(false);
    setIsProcessing(true);

    const placementsData = [];
    for (const quarterNum in formationsByQuarter) {
      const formationForQuarter = formationsByQuarter[quarterNum];
      if (formationForQuarter.some((player) => player.dbPlayerId !== null)) {
        formationForQuarter.forEach((player) => {
          placementsData.push({
            playerId: player.dbPlayerId,
            quarter: parseInt(quarterNum),
            coordX: Math.round(player.x * 10),
            coordY: Math.round(player.y * 10),
          });
        });
      }
    }

    const formationSaveData = { teamId, name: newFormationName, placements: placementsData, referees };

    try {
      let response;
      if (editingFormationId) {
        response = await api.updateFormation(editingFormationId, formationSaveData);
        toast.success(`포메이션 "${nameToDisplay}"이(가) 성공적으로 수정되었습니다!`);
      } else {
        response = await api.saveTeamFormation(formationSaveData);
        toast.success(`포메이션 "${nameToDisplay}"이(가) 성공적으로 저장되었습니다!`);
        setEditingFormationId(response.data.formationId);
      }
      setCurrentFormationName(nameToDisplay);
      setNewFormationName('');
      resetIsDirty();
    } catch (error) {
      toast.error('포메이션 처리(저장/수정)에 실패했습니다.');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteFormation = (formationId, formationName) => {
    setConfirmDialog({
      isOpen: true,
      title: '포메이션 삭제',
      message: `포메이션 "${formationName}"을(를) 정말로 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`,
      onConfirm: async () => {
        try {
          await api.deleteFormation(formationId);
          toast.success(`포메이션 "${formationName}"이(가) 성공적으로 삭제되었습니다.`);
          handleLoad();
        } catch (error) {
          toast.error('포메이션 삭제에 실패했습니다.');
          console.error(error);
        }
      },
      confirmText: '삭제',
      cancelText: '취소',
    });
  };

  const proceedToLoadFormation = useCallback(
    async (formation) => {
      const formationId = formation.formationId;
      if (!formationId) return;
      setIsLoadingFormation(true);
      try {
        const response = await api.getFormationDetail(formationId);
        const detailedFormation = response.data;
        loadFormation(detailedFormation.placements, teamPlayers);

        if (detailedFormation.referees && typeof detailedFormation.referees === 'object') {
          setReferees({
            1: '',
            2: '',
            3: '',
            4: '',
            ...detailedFormation.referees,
          });
        } else {
          setReferees({ 1: '', 2: '', 3: '', 4: '' });
        }

        setEditingFormationId(formationId);
        setCurrentFormationName(detailedFormation.name);
        toast.success(`포메이션 "${detailedFormation.name}"이(가) 경기장에 적용되었습니다.`);
      } catch (error) {
        toast.error('포메이션을 불러오는 데 실패했습니다.');
        console.error(error);
      } finally {
        setIsLoadingFormation(false);
      }
    },
    [api, loadFormation, teamPlayers, setReferees]
  );

  const handleSelectFormation = (formation) => {
    setIsLoadModalOpen(false);
    if (isDirty) {
      setConfirmDialog({
        isOpen: true,
        title: '포메이션 불러오기',
        message: `"${formation.name}"을(를) 불러오면 현재 변경사항이 손실됩니다.\n계속 진행하시겠습니까?`,
        onConfirm: () => proceedToLoadFormation(formation),
        confirmText: '계속',
        cancelText: '취소',
      });
    } else {
      proceedToLoadFormation(formation);
    }
  };

  const resetFormationName = () => {
    setCurrentFormationName(null);
    setEditingFormationId(null);
  };

  return {
    isSaveModalOpen,
    setIsSaveModalOpen,
    newFormationName,
    setNewFormationName,
    isLoadModalOpen,
    setIsLoadModalOpen,
    savedFormations,
    loadError,
    setLoadError,
    editingFormationId,
    currentFormationName,
    handleLoad,
    isLoadingFormation,
    isProcessing,
    handleSave,
    handleConfirmSave,
    handleDeleteFormation,
    handleSelectFormation,
    resetFormationName,
  };
};
