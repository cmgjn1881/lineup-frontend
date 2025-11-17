// src/pages/FormationPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import FootballPitch from '../components/FootballPitch';
import PlayerIcon from '../components/PlayerIcon';
import ConfirmDialog from '../components/common/ConfirmDialog';
import PlayerListPanel from '../components/PlayerListPanel';
import { RotateCcw, List, Download, Share2, PanelRightOpen, X, Loader2 } from 'lucide-react';
import TrophyIcon from '../assets/TrophyIcon.svg';
import { useApiClient } from '../api/ApiClient';
import PlayerListModal from '../components/PlayerListModal';
import { useFormationDrag } from '../hooks/useFormationDrag';
import { useHeaderActions } from '../context/HeaderActionsContext.jsx';
import FormationNameModal from '../components/FormationNameModal';
import FormationLoadModal from '../components/FormationLoadModal';
import PlayerDetailModal from '../components/PlayerDetailModal';
import ShareFormationModal from '../components/ShareFormationModal.jsx';
import * as htmlToImage from 'html-to-image';
import PlayerQuarterStatusPanel from '../components/PlayerQuarterStatusPanel';
import { usePageNavigation } from '../hooks/usePageNavigation.js';
import { useFormationManager } from '../hooks/useFormationManager.js';
import toast from 'react-hot-toast';
import LoadingOverlay from '../components/common/LoadingOverlay.jsx';

const FormationPage = ({ teamId }) => {
  const { setActions } = useHeaderActions();
  const location = useLocation();
  const navigate = useNavigate();
  const api = useApiClient();

  const {
    formationsByQuarter,
    activeQuarter,
    setActiveQuarter,
    loadFormation,
    draggingId,
    setPitchRef,
    handleMouseDown,
    activeSlot,
    handleSlotClick,
    handleAssignPlayer,
    resetFormation,
    isDirty,
    pitchRef,
    resetIsDirty,
  } = useFormationDrag();

  const [teamPlayers, setTeamPlayers] = useState([]);
  const [playersLoading, setPlayersLoading] = useState(true);
  const [isQuarterPanelOpen, setIsQuarterPanelOpen] = useState(false);
  const [isPlayerDetailModalOpen, setIsPlayerDetailModalOpen] = useState(false);
  const [selectedPlayerSlot, setSelectedPlayerSlot] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [capturingQuarter, setCapturingQuarter] = useState(null); // << 이 줄을 추가하세요.

  // 💡 [추가] 포메이션 초기화 시 실행될 콜백
  const onResetConfirm = () => {
    resetFormation();
    resetFormationName(); // 훅에서 가져온 함수 호출
  };

  // 💡 [추가] 커스텀 훅 호출
  const { confirmDialog, setConfirmDialog, handleReset } = usePageNavigation(isDirty, onResetConfirm);
  const {
    isSaveModalOpen,
    setIsSaveModalOpen,
    newFormationName,
    setNewFormationName,
    isLoadModalOpen,
    setIsLoadModalOpen,
    savedFormations,
    loadError,
    setLoadError,
    isLoadingFormation,
    isProcessing,
    currentFormationName,
    handleLoad,
    handleSave,
    handleConfirmSave,
    handleDeleteFormation,
    handleSelectFormation,
    resetFormationName,
  } = useFormationManager({
    api,
    teamId,
    isDirty,
    formationsByQuarter,
    loadFormation,
    resetIsDirty,
    setConfirmDialog,
    teamPlayers,
  });

  // [추가] 패널이 열렸을 때 배경 스크롤을 막는 useEffect
  useEffect(() => {
    if (isQuarterPanelOpen) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      // 패널이 닫히면 스크롤을 복원합니다.
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }

    // 컴포넌트가 언마운트될 때 스크롤을 복원하는 cleanup 함수
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [isQuarterPanelOpen]);

  // 컴포넌트 마운트 시 팀 선수 목록을 불러옵니다.
  useEffect(() => {
    const fetchTeamPlayers = async () => {
      if (!teamId) return;
      setPlayersLoading(true);
      try {
        const res = await api.getTeamPlayers(teamId);
        const playersWithId = res.data.map((p) => ({ ...p, id: p.playerId }));
        setTeamPlayers(playersWithId);
      } catch (err) {
        console.error(err.response?.data?.message || '선수 목록을 불러오는 데 실패했습니다.');
      } finally {
        setPlayersLoading(false);
      }
    };
    fetchTeamPlayers();
  }, [api, teamId]);

  // 헤더에 '리스트 목록' 버튼을 추가하기 위한 useEffect
  useEffect(() => {
    setActions(
      <button
        onClick={handleLoad}
        className="p-2 text-white hover:bg-gray-700 rounded-full transition duration-150"
        aria-label="포메이션 불러오기"
      >
        <List className="w-5 h-5" />
      </button>
    );

    // 페이지를 벗어날 때(unmount) 헤더 버튼을 정리합니다.
    return () => {
      setActions(null);
    };
  }, [setActions, handleLoad]);

  // Link State에서 팀 정보 추출
  const stateTeam = location.state?.team;
  const teamName = stateTeam?.name || `팀 ID ${teamId} (정보 없음)`;

  // 필수 데이터 (팀 이름)가 없는 경우 즉시 오류 메시지 반환
  if (!stateTeam?.name) {
    return (
      <div className="p-4 text-center text-red-600">
        <h2 className="text-2xl font-bold mb-4">페이지 접근 오류</h2>
        <p>팀 정보가 전달되지 않았습니다. 팀 상세 페이지를 통해 접근해 주세요.</p>
        <button
          onClick={() => navigate('/teams')}
          className="mt-4 py-2 px-4 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
        >
          팀 목록으로 이동
        </button>
      </div>
    );
  }

  const handleCloseLoadModal = () => {
    setIsLoadModalOpen(false);
    setLoadError(null);
  };

  const handleClosePlayerDetailModal = () => {
    setIsPlayerDetailModalOpen(false);
    setSelectedPlayerSlot(null);
  };

  const handleCloseSaveModal = () => {
    setIsSaveModalOpen(false);
    setNewFormationName('');
  };

  // 할당된 선수 슬롯에서 선수 정보를 제거합니다.
  const handleRemovePlayerFromSlot = () => {
    if (!selectedPlayerSlot) return;
    // 1. 선수가 없는 '빈 슬롯' 데이터 객체 생성
    // dbPlayerId, name, backNumber 등을 null/undefined로 만듭니다.
    const emptyPlayer = {
      id: null,
      dbPlayerId: null,
      name: null,
      backNumber: null,
      // 나머지 필드는 훅이 알아서 처리하거나 빈 값으로 설정
    };

    handleAssignPlayer(selectedPlayerSlot.id, emptyPlayer);

    toast.success(`선수 ${selectedPlayerSlot.name}을(를) 슬롯에서 제거했습니다.`);

    // 3. 모달 닫기 및 상태 초기화
    setSelectedPlayerSlot(null);
    setIsPlayerDetailModalOpen(false);
  };

  // 선수 목록 모달을 다시 띄워 수정을 허용합니다.
  const handleModifyPlayer = () => {
    if (!selectedPlayerSlot) return;

    // 1. 상세 모달 닫기
    setIsPlayerDetailModalOpen(false);

    // 2. 선수 목록 모달 열기
    handleSlotClick(selectedPlayerSlot.id, selectedPlayerSlot.posKey);
  };

  // 정렬을 위한 포지션 순서 정의 (FW: 1, GK: 4)
  const positionSortOrder = {
    FW: 1,
    MF: 2,
    DF: 3,
    GK: 4,
    // 이외의 포지션은 가장 뒤로
  };

  // [핵심 수정] 현재 "활성화된 쿼터"에 배정된 선수 ID 목록 생성
  const assignedPlayerIds = (formationsByQuarter[activeQuarter] || [])
    .map((player) => player.dbPlayerId) // dbPlayerId 목록 추출
    .filter((id) => id !== null); // null이 아닌 유효한 ID만 필터링

  // [핵심 추가] 배정 가능한 선수 목록 생성
  const availablePlayers = teamPlayers
    .filter(
      (player) => !assignedPlayerIds.includes(player.id) // player.id는 dbPlayerId와 동일
    )
    // [핵심 추가] 포지션 순서에 따라 정렬
    .sort((a, b) => {
      // a와 b 선수의 포지션 순서 값을 가져옵니다. (없으면 99로 밀어냄)
      const orderA = positionSortOrder[a.position] || 99;
      const orderB = positionSortOrder[b.position] || 99;

      // 포지션 순서가 다르면 순서대로 정렬합니다. (1이 2보다 먼저 오도록)
      if (orderA !== orderB) {
        return orderA - orderB;
      }
    });

  const handleShare = async (quartersToShare) => {
    // quartersToShare는 ['1', '3']과 같은 배열입니다.
    // 1. 모달을 닫고, 이미지 생성 시작을 알립니다.
    setIsShareModalOpen(false);
    setIsSharing(true);
    toast.loading('이미지 생성 중...');

    const images = [];
    // useFormationDrag 훅에서 가져온 pitchRef를 사용합니다.
    // 이 ref는 FootballPitch 컴포넌트를 가리킵니다.
    const pitchElement = pitchRef;

    if (!pitchElement) {
      toast.error('오류: 이미지 생성 대상을 찾을 수 없습니다.');
      setIsSharing(false);
      return;
    }

    // ⭐️ 핵심 로직: for...of 루프를 사용하여 선택된 쿼터를 하나씩 순차적으로 처리합니다.
    for (const quarter of quartersToShare) {
      // 2. 이미지로 만들 쿼터의 포메이션이 화면에 그려지도록 activeQuarter 상태를 변경합니다.
      setActiveQuarter(Number(quarter));
      setCapturingQuarter(quarter); // << 이미지 캡처 직전에 상태 설정

      // 3. React가 DOM을 다시 그릴 때까지 잠시 기다립니다. (매우 중요!)
      // 이 지연 시간이 없으면, 화면이 바뀌기 전에 이미지를 캡처하여 잘못된 이미지가 생성될 수 있습니다.
      await new Promise((resolve) => setTimeout(resolve, 100));

      // 4. html-to-image 라이브러리를 사용하여 현재 보이는 pitchElement를 이미지 데이터(Blob)로 변환합니다.
      try {
        const imageBlob = await htmlToImage.toBlob(pitchElement, {
          quality: 0.95,
          // 경기장 배경색과 유사하게 지정하여 이미지의 빈 공간이 투명하게 나오지 않도록 합니다.
          backgroundColor: '#0A1F0C',
        });
        // 5. 생성된 이미지 데이터를 파일 객체로 만들어 배열에 추가합니다.
        images.push(new File([imageBlob], `formation_Q${quarter}.png`, { type: 'image/png' }));
      } catch (error) {
        console.error(`쿼터 ${quarter} 이미지 생성 실패:`, error);
        toast.error(`쿼터 ${quarter} 이미지 생성에 실패했습니다.`);
      }
    }

    setCapturingQuarter(null); // << 루프가 끝난 후 상태 초기화
    toast.dismiss(); // 로딩 중 토스트 메시지를 닫습니다.

    // 6. 생성된 이미지들을 공유합니다.
    if (images.length > 0) {
      // 6-1. 모바일 환경 등 Web Share API를 지원하는 경우
      if (navigator.share && navigator.canShare({ files: images })) {
        try {
          await navigator.share({
            files: images,
            title: `${teamName} 포메이션`,
            text: `[${teamName}] 포메이션을 확인하세요.`,
          });
        } catch (error) {
          // 사용자가 공유를 취소한 경우(AbortError)는 오류로 처리하지 않습니다.
          if (error.name !== 'AbortError') {
            toast.error('공유에 실패했습니다.');
          }
        }
      } else {
        // 6-2. Web Share API를 지원하지 않는 경우 (PC 브라우저 등)
        // 생성된 이미지를 하나씩 다운로드하도록 합니다.
        toast('이미지를 다운로드합니다.');
        images.forEach((file) => {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(file);
          link.download = file.name;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);
        });
      }
    }

    // 7. 모든 과정이 끝나면 로딩 상태를 해제합니다.
    setIsSharing(false);
  };

  return (
    <div className="relative flex w-full h-full overflow-x-hidden">
      <LoadingOverlay
        isActive={isLoadingFormation}
        mainText="포메이션 불러오는 중..."
        subText="선택하신 포메이션을 적용하고 있습니다."
      />
      {/* 💡 [수정] 공통 로딩 오버레이 컴포넌트 사용 */}
      <LoadingOverlay isActive={isProcessing} mainText="포메이션 저장 중..." subText="잠시만 기다려주세요." />
      <LoadingOverlay isActive={isSharing} mainText="포메이션 이미지 생성 중..." subText="잠시만 기다려주세요." />

      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isQuarterPanelOpen ? 'w-2/3 overflow-hidden' : 'w-full'
        }`}
      >
        <div className="px-4 py-1 flex justify-between items-center">
          {/* 1. 팀 이름 (왼쪽 정렬) */}
          <h2 className="text-xl font-bold flex items-center text-white shrink">
            <img src={TrophyIcon} alt="포메이션 아이콘" className="w-6 h-6 mr-2" />
            {teamName}

            {currentFormationName && (
              <span className="ml-3 text-base font-semibold text-[#D9D9D9]">{currentFormationName}</span>
            )}
          </h2>
          {/* 2. 기능 버튼 그룹 (오른쪽 정렬) */}
          <div className="flex items-center space-x-2">
            {/* 초기화 버튼 */}
            <button
              onClick={handleReset}
              className="p-2 text-sm text-red-500 hover:bg-red-900 rounded-full transition duration-150"
              aria-label="포메이션 초기화"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            {/* 공유 버튼 */}
            <button
              onClick={() => {
                setIsShareModalOpen(true);
              }}
              className="p-2 text-sm text-blue-500 hover:bg-blue-900 rounded-full transition duration-150"
              aria-label="포메이션 공유"
            >
              <Share2 className="w-5 h-5" />
            </button>
            {/* 저장 버튼 */}
            <button
              onClick={handleSave}
              className="p-2 text-sm text-green-600 hover:bg-green-900 rounded-full transition duration-150"
              aria-label="포메이션 저장"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 쿼터 선택 UI */}
        <div className="px-4 py-2 flex justify-center space-x-2">
          {[1, 2, 3, 4].map((q) => (
            <button
              key={q}
              onClick={() => setActiveQuarter(q)}
              className={`px-4 py-1 rounded-lg text-sm font-semibold transition-colors ${
                activeQuarter === q
                  ? 'bg-[#63FF70] text-black'
                  : 'bg-[#0D1117] text-white border border-[#6B6B6B] hover:bg-gray-700'
              }`}
            >
              {q}Q
            </button>
          ))}
        </div>

        {/* 축구장 컴포넌트를 배치합니다. */}
        <div className="mx-auto">
          <FootballPitch ref={setPitchRef}>
            {/* 쿼터 정보 표시 (이미지 캡처 시에만 보임) */}
            {capturingQuarter && (
              <div className="absolute top-2 left-2 z-20 bg-black/60 text-white text-2xl font-bold p-2 rounded-lg">
                {capturingQuarter}Q
              </div>
            )}
            {/* 11명 선수 아이콘 렌더링 (formationsByQuarter 상태 사용) */}
            {formationsByQuarter[activeQuarter]?.map((player) => {
              return (
                <div
                  key={player.id}
                  className="absolute"
                  // [핵심] 드래그 시작 이벤트 핸들러를 이 div로 이동/적용합니다.
                  onMouseDown={(e) => handleMouseDown(e, player.id)}
                  onTouchStart={(e) => handleMouseDown(e, player.id)} // 모바일 터치 이벤트 대비
                  onClick={() => {
                    if (player.dbPlayerId) {
                      // Case 1: 선수가 할당되어 있음 -> 상세/수정/삭제 모달 띄우기
                      setSelectedPlayerSlot(player);
                      setIsPlayerDetailModalOpen(true);
                    } else {
                      // Case 2: 슬롯만 있음 -> 선수 목록 모달 띄우기 (기존 로직)
                      handleSlotClick(player.id, player.posKey);
                    }
                  }}
                  style={{
                    top: `${player.y}%`,
                    left: `${player.x}%`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: player.id === draggingId ? 10 : 1, // 드래그 중인 요소를 위로 올림
                    touchAction: 'none', // ⚽️ 드래그 중 브라우저의 스크롤/새로고침 동작 방지
                  }}
                >
                  <PlayerIcon player={player} shirtColor="bg-blue-600" />
                </div>
              );
            })}
          </FootballPitch>

          {/* PlayerListPanel Modal 구현 */}
          {activeSlot && (
            <PlayerListModal
              isOpen={!!activeSlot}
              onClose={() => handleSlotClick(null)}
              title={`'${activeSlot.posKey}' 포지션 선수 배정`}
            >
              <PlayerListPanel
                allPlayers={availablePlayers}
                loading={playersLoading}
                // 클릭된 선수를 activeSlot에 배정하는 함수 연결
                onPlayerClick={(player) => handleAssignPlayer(activeSlot.id, player)}
              />
            </PlayerListModal>
          )}

          {/* 포메이션 불러오기 모달 */}
          <FormationLoadModal
            isOpen={isLoadModalOpen}
            onClose={handleCloseLoadModal}
            savedFormations={savedFormations}
            onLoad={handleSelectFormation}
            onDelete={handleDeleteFormation}
            loadError={loadError}
          />

          {/* 포메이션 이름 입력 모달 */}
          <FormationNameModal
            isOpen={isSaveModalOpen}
            onClose={handleCloseSaveModal}
            onConfirm={handleConfirmSave} // 저장 로직 연결
            value={newFormationName}
            onChange={(e) => setNewFormationName(e.target.value)}
          />

          {/* 선수 상세 정보/수정/삭제 모달 */}
          <PlayerDetailModal
            isOpen={isPlayerDetailModalOpen}
            onClose={handleClosePlayerDetailModal}
            selectedSlot={selectedPlayerSlot}
            onRemove={handleRemovePlayerFromSlot} // 삭제 로직 연결
            onModify={handleModifyPlayer} // 수정 로직 연결
          />
          <ShareFormationModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            onSubmit={handleShare}
            formationsByQuarter={formationsByQuarter}
          />
        </div>
      </div>

      {/* 💡 [추가] 공통 확인 다이얼로그 렌더링 */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={() => {
          confirmDialog.onConfirm();
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }}
        // 💡 [수정] onClose도 상태에 저장된 함수를 호출하도록 변경
        onClose={() => {
          if (confirmDialog.onClose) {
            confirmDialog.onClose();
          }
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
      />

      {/* 💡 [수정] 패널 열기/닫기 버튼 그룹 */}
      {/* 열기 버튼 */}
      <button
        onClick={() => setIsQuarterPanelOpen(true)}
        className={`absolute top-1/2 right-0 transform -translate-y-1/2 z-30
                    bg-[#0D1117] border border-r-0 border-[#6B6B6B] 
                    p-2 rounded-l-lg text-gray-400 hover:text-white hover:bg-gray-700 
                    transition-all duration-300 ease-in-out
                    ${isQuarterPanelOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        aria-label="선수별 쿼터 현황 보기"
      >
        <PanelRightOpen className="w-5 h-5" />
      </button>

      {/* 💡 [추가] 닫기 버튼 */}
      <button
        onClick={() => setIsQuarterPanelOpen(false)}
        className={`absolute top-1/2 transform -translate-y-1/2 z-30
                    bg-[#0D1117] border border-r-0 border-[#6B6B6B] 
                    p-2 rounded-l-lg text-gray-400 hover:text-white hover:bg-gray-700 
                    transition-all duration-300 ease-in-out
                    right-[60%] sm:right-72
                    ${isQuarterPanelOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        aria-label="패널 닫기"
      >
        <X className="w-5 h-5" />
      </button>

      {/* 💡 [추가] 패널이 열렸을 때 표시될 반투명 배경(Backdrop) */}
      {isQuarterPanelOpen && (
        <div
          className="absolute inset-0 bg-black/50 z-20" // 패널(z-30)보다 낮은 z-index
          onClick={() => setIsQuarterPanelOpen(false)}
        />
      )}

      {/* 💡 [추가] 선수별 쿼터 현황 패널 렌더링 */}
      <PlayerQuarterStatusPanel
        isOpen={isQuarterPanelOpen}
        formationsByQuarter={formationsByQuarter}
        teamPlayers={teamPlayers}
      />
    </div>
  );
};

export default FormationPage;
