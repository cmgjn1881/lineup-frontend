// src/pages/FormationPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import FootballPitch from '../components/FootballPitch';
import PlayerIcon from '../components/PlayerIcon';
import PlayerListPanel from '../components/PlayerListPanel';
import { RotateCcw, List, CircleX, Download, Share2 } from 'lucide-react';
import teamFormationIcon from '../assets/teamformation.svg';
import { useApiClient } from '../api/ApiClient';
import PlayerListModal from '../components/PlayerListModal';
import { useFormationDrag } from '../hooks/useFormationDrag';
import { useBlocker } from 'react-router-dom';
import { useHeaderActions } from '../context/HeaderActionsContext.jsx';
import FormationNameModal from '../components/FormationNameModal';
import FormationLoadModal from '../components/FormationLoadModal';
import PlayerDetailModal from '../components/PlayerDetailModal';

const FormationPage = ({ teamId }) => {
  const { setActions } = useHeaderActions();
  const location = useLocation();
  const navigate = useNavigate();
  const api = useApiClient();

  // 🔑 [핵심] useFormationDrag 훅 호출 및 반환 값 구조 분해 할당
  const {
    currentFormation,
    loadFormation,
    draggingId,
    setPitchRef,
    handleMouseDown,
    activeSlot,
    handleSlotClick,
    handleAssignPlayer,
    resetFormation, // 초기화 함수
    isDirty, // ⚽️ [추가] 포메이션 변경 여부 상태
  } = useFormationDrag();

  // 🔑 API 관련 상태 및 로직 (훅과 독립적)
  const [teamPlayers, setTeamPlayers] = useState([]);
  const [playersLoading, setPlayersLoading] = useState(true);

  // 모달 상태 및 이름 상태
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [newFormationName, setNewFormationName] = useState('');

  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
  const [savedFormations, setSavedFormations] = useState([]);
  const [loadError, setLoadError] = useState(null);

  // 현재 편집 중인 포메이션의 이름을 저장합니다.
  const [editingFormationId, setEditingFormationId] = useState(null); // ⭐️ [전제] 수정 모드 ID 상태
  const [currentFormationName, setCurrentFormationName] = useState(null);

  const [isPlayerDetailModalOpen, setIsPlayerDetailModalOpen] = useState(false);
  const [selectedPlayerSlot, setSelectedPlayerSlot] = useState(null); // 클릭된 슬롯의 전체 정보 저장

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

  const handleLoad = useCallback(async () => {
    setLoadError(null);
    try {
      // 1. API 호출: GET /api/formation?teamId={teamId}
      const response = await api.getFormationList(teamId);

      // 2. 상태 저장 및 모달 열기
      setSavedFormations(response.data);
      setIsLoadModalOpen(true);

      console.log('포메이션 목록 조회 성공:', response.data);
    } catch (error) {
      console.error('포메이션 목록 조회 실패:', error.response?.data?.message || error.message);
      setLoadError('포메이션 목록을 불러오는 데 실패했습니다.');
      alert('포메이션 목록을 불러오는 데 실패했습니다.');
    }
  }, [api, teamId]); // api와 teamId가 변경되지 않는 한 함수는 재생성되지 않습니다.

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
  }, [setActions, handleLoad]); // handleLoad는 useCallback으로 감싸는 것이 좋습니다.

  // Link State에서 팀 정보 추출
  const stateTeam = location.state?.team;
  const teamName = stateTeam?.name || `팀 ID ${teamId} (정보 없음)`;

  // 변경 사항이 있을 때만 페이지 이동을 막는 Blocker 설정
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => isDirty && currentLocation.pathname !== nextLocation.pathname
  );

  //  Blocker의 상태가 'blocked'일 때 모달을 띄우고, 사용자의 선택에 따라 blocker를 제어합니다.
  // 이 로직은 useEffect 안에서 처리하여 렌더링 중 사이드 이펙트를 방지하고, 무한 알림 버그를 해결합니다.
  useEffect(() => {
    if (blocker.state === 'blocked') {
      if (window.confirm('저장되지 않은 변경사항이 있습니다. 정말로 페이지를 나가시겠습니까?')) {
        blocker.proceed(); // 사용자가 '확인'을 누르면 내비게이션을 계속 진행합니다.
      } else {
        blocker.reset(); // 사용자가 '취소'를 누르면 내비게이션을 중단하고 blocker 상태를 초기화합니다.
      }
    }
  }, [blocker]);

  // 💡 버튼 클릭 핸들러 (뷰 로직)
  const handleReset = () => {
    const isConfirmed = window.confirm(
      '정말로 현재 포메이션을 초기 상태로 되돌리시겠습니까? 저장되지 않은 변경 사항은 손실됩니다.'
    );
    if (isConfirmed) {
      resetFormation(); // 🔑 훅에서 제공하는 초기화 함수 호출
      setCurrentFormationName(null); // ⭐️ 이름 초기화
      setEditingFormationId(null); // ⭐️ 수정 ID 초기화 (새 포메이션 모드)
    }
  };

  const handleSave = async () => {
    // 🔑 [핵심] 현재 포메이션 배열의 길이가 11인지 확인
    if (currentFormation.length !== 11) {
      alert('저장할 수 없습니다: 포메이션에는 11명의 선수가 모두 필요합니다.');
      console.warn('저장 실패: 선수 수 불일치');
      return;
    }

    // 🔑 [핵심 수정] dbPlayerId가 null인 요소가 하나라도 있는지 확인합니다.
    const isComplete = currentFormation.every((player) => player.dbPlayerId !== null);

    if (!isComplete) {
      alert('저장할 수 없습니다: 모든 포지션에 선수를 할당해 주세요.');
      return;
    }

    // 이름 입력 모달을 띄웁니다.
    setIsSaveModalOpen(true);
  };

  // 1. 필수 데이터 (팀 이름)가 없는 경우 즉시 오류 메시지 반환
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

  const handleConfirmSave = async () => {
    if (!newFormationName.trim()) {
      alert('포메이션 이름을 입력해 주세요.');
      return;
    }

    const nameToDisplay = newFormationName;
    setIsSaveModalOpen(false);

    // 1. 저장할 데이터 준비
    const placementsData = currentFormation.map((player) => ({
      playerId: player.dbPlayerId,
      quarter: 1, // 기본값 설정 (필요 시 수정)
      coordX: Math.round(player.x * 10),
      coordY: Math.round(player.y * 10),
    }));

    const formationSaveData = {
      teamId: teamId,
      name: newFormationName,
      placements: placementsData,
    };

    try {
      let response;

      // ⭐️ [핵심] editingFormationId가 있으면 PUT (수정), 없으면 POST (생성)
      if (editingFormationId) {
        // PUT /api/formation/{formationId} (수정)
        response = await api.updateFormation(editingFormationId, formationSaveData); // 🚨 API 메소드 확인
        alert(`포메이션 "${nameToDisplay}"이(가) 성공적으로 수정되었습니다!`);
      } else {
        // POST /api/formation (생성)
        response = await api.saveTeamFormation(formationSaveData);
        alert(`포메이션 "${nameToDisplay}"이(가) 성공적으로 저장되었습니다!`);

        // ⭐️ 생성 후 ID를 저장하여 즉시 수정 모드로 전환
        setEditingFormationId(response.data.formationId);
      }

      // ⭐️ 성공 시 현재 포메이션 이름 업데이트
      setCurrentFormationName(nameToDisplay);
      setNewFormationName(''); // 이름 입력 필드 초기화
      // isDirty 상태를 false로 초기화하는 로직 추가 필요
    } catch (error) {
      console.error('포메이션 저장 중 API 오류:', error.response?.data?.message || error.message);
      alert('포메이션 처리(저장/수정)에 실패했습니다. 콘솔을 확인하세요.');
    }
  };

  // 포메이션 삭제 핸들러
  const handleDeleteFormation = async (formationId, formationName) => {
    if (!window.confirm(`포메이션 "${formationName}"을(를) 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    try {
      // 🚨 [가정]: ApiClient에 deleteFormation 메소드가 정의되어 있다고 가정합니다.
      await api.deleteFormation(formationId);

      alert(`포메이션 "${formationName}"이(가) 성공적으로 삭제되었습니다.`);

      // 삭제 후 목록을 새로 고칩니다.
      handleLoad();
    } catch (error) {
      console.error('포메이션 삭제 실패:', error.response?.data?.message || error.message);
      alert('포메이션 삭제에 실패했습니다. 콘솔을 확인하세요.');
    }
  };

  // 포메이션 목록 불러오기 핸들러 (선택 시 실행)
  const handleSelectFormation = async (formation) => {
    setIsLoadModalOpen(false);

    const formationId = formation.formationId;
    if (!formationId) return;

    // 💡 저장되지 않은 변경 사항이 있을 때 사용자에게 경고 (UX 개선)
    if (
      isDirty &&
      !window.confirm(`"${formation.name}"을(를) 불러오면 현재 변경사항이 손실됩니다. 계속 진행하시겠습니까?`)
    ) {
      return;
    }

    try {
      // 1. 상세 조회 API 호출
      const response = await api.getFormationDetail(formationId);
      const detailedFormation = response.data; // 서버에서 받은 상세 데이터

      // 2. 훅이 이해할 수 있는 형식으로 데이터 변환
      const loadedPlacements = detailedFormation.placements.map((p) => ({
        // ⭐️ [핵심 수정 1]: posKey를 p.playerPosition로 명확히 설정
        posKey: p.playerPosition,
        dbPlayerId: p.playerId,
        name: p.playerName,
        position: p.playerPosition, // 선수 포지션
        backNumber: p.playerBackNumber || p.number,

        // 좌표 변환
        x: Math.round(p.coordX / 10),
        y: Math.round(p.coordY / 10),

        // quarter, playerPosition 등 나머지 필드는 필요 시 추가
      }));

      // 🚨 [디버깅] 변환된 배열을 확인합니다.
      console.log('loadFormation에 전달할 loadedPlacements:', loadedPlacements);

      // 3. 훅의 상태 업데이트 함수 호출
      loadFormation(loadedPlacements);

      setEditingFormationId(formationId);
      setCurrentFormationName(detailedFormation.name);

      alert(`포메이션 "${detailedFormation.name}"이(가) 경기장에 적용되었습니다.`);
    } catch (error) {
      console.error('포메이션 상세 조회 및 적용 실패:', error.response?.data?.message || error.message);
      alert('포메이션을 불러오는 데 실패했습니다.');
    }
  };

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

  // ⭐️ [신규 구현] 할당된 선수 슬롯에서 선수 정보를 제거합니다.
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

    alert(`선수 ${selectedPlayerSlot.name}을(를) 슬롯에서 제거했습니다.`);

    // 3. 모달 닫기 및 상태 초기화
    setSelectedPlayerSlot(null);
    setIsPlayerDetailModalOpen(false);
  };

  // 선수 목록 모달을 다시 띄워 수정을 허용합니다.
  const handleModifyPlayer = () => {
    if (!selectedPlayerSlot) return;

    // 1. 상세 모달 닫기
    setIsPlayerDetailModalOpen(false);

    // 2. 기존 activeSlot 로직을 사용하여 선수 목록 모달을 띄웁니다.
    // handleSlotClick(selectedPlayerSlot.id, selectedPlayerSlot.posKey)를 호출하면
    // activeSlot이 설정되고 PlayerListModal이 열립니다.
    handleSlotClick(selectedPlayerSlot.id, selectedPlayerSlot.posKey);
  };

  // ⭐️ [추가] 정렬을 위한 포지션 순서 정의 (FW: 1, GK: 4)
  const positionSortOrder = {
    FW: 1,
    MF: 2,
    DF: 3,
    GK: 4,
    // 이외의 포지션은 가장 뒤로
  };

  // ⭐️ [핵심 추가] 현재 포메이션에 배정된 선수 ID 목록 생성
  const assignedPlayerIds = currentFormation
    .map((player) => player.dbPlayerId) // dbPlayerId 목록 추출
    .filter((id) => id !== null); // null이 아닌 유효한 ID만 필터링

  // ⭐️ [핵심 추가] 배정 가능한 선수 목록 생성
  const availablePlayers = teamPlayers
    .filter(
      (player) => !assignedPlayerIds.includes(player.id) // player.id는 dbPlayerId와 동일
    )
    // ⭐️ [핵심 추가] 포지션 순서에 따라 정렬
    .sort((a, b) => {
      // a와 b 선수의 포지션 순서 값을 가져옵니다. (없으면 99로 밀어냄)
      const orderA = positionSortOrder[a.position] || 99;
      const orderB = positionSortOrder[b.position] || 99;

      // 포지션 순서가 다르면 순서대로 정렬합니다. (1이 2보다 먼저 오도록)
      if (orderA !== orderB) {
        return orderA - orderB;
      }
    });

  return (
    <div className="p-0">
      {/* 🔑 [수정] H2 태그를 flex 컨테이너로 사용하고, 좌우 패딩을 줍니다. */}
      <div className="px-4 flex justify-between items-center">
        {/* 1. 팀 이름 (왼쪽 정렬) */}
        <h2 className="text-xl font-bold flex items-center text-white shrink">
          <img src={teamFormationIcon} alt="포메이션 아이콘" className="w-6 h-6 mr-2" />
          {teamName}

          {currentFormationName && (
            <span className="ml-3 text-base font-semibold text-indigo-600">[{currentFormationName}]</span>
          )}
        </h2>
        {/* 2. 기능 버튼 그룹 (오른쪽 정렬) */}
        <div className="flex space-x-2">
          {/* 초기화 버튼 */}
          <button
            onClick={handleReset}
            className="p-2 text-sm text-red-500 hover:bg-red-900 rounded-full transition duration-150"
            aria-label="포메이션 초기화"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {/* 공유 버튼 (기능 구현 예정) */}
          <button
            onClick={() => {
              /* TODO: 공유 기능 구현 */
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

      {/* 🔑 [배치] 축구장 컴포넌트를 배치합니다. */}
      <div className="mx-auto">
        <FootballPitch ref={setPitchRef}>
          {/* 🔑 11명 선수 아이콘 렌더링 (currentFormation 상태 사용) */}
          {currentFormation.map((player) => {
            return (
              <div
                key={player.id}
                className="absolute"
                // 🔑 [핵심] 드래그 시작 이벤트 핸들러를 이 div로 이동/적용합니다.
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

        {/* 🔑 [핵심] 3. PlayerListPanel Modal 구현 */}
        {activeSlot && (
          <PlayerListModal
            isOpen={!!activeSlot}
            onClose={() => handleSlotClick(null)}
            title={`'${activeSlot.posKey}' 포지션 선수 배정`}
          >
            <PlayerListPanel
              allPlayers={availablePlayers}
              loading={playersLoading}
              // 🔑 클릭된 선수를 activeSlot에 배정하는 함수 연결
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
      </div>
    </div>
  );
};

export default FormationPage;
