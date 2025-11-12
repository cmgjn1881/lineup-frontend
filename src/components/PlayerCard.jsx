import React from 'react';
import playercardIcon from '../assets/playercardIcon.svg';

// PlayerListPanel에서 스타일 관련 상수를 이 파일로 이동합니다.
const POSITION_STYLES = {
  FW: {
    border: 'border-red-500',
    text: 'text-red-600',
    hoverBg: 'hover:bg-gray-800',
  },
  MF: {
    border: 'border-green-500',
    text: 'text-green-600',
    hoverBg: 'hover:bg-gray-800',
  },
  DF: {
    border: 'border-blue-500',
    text: 'text-blue-600',
    hoverBg: 'hover:bg-gray-800',
  },
  GK: {
    border: 'border-yellow-500',
    text: 'text-yellow-600',
    hoverBg: 'hover:bg-gray-800',
  },
  default: {
    border: 'border-gray-600',
    text: 'text-gray-400',
    hoverBg: 'hover:bg-gray-800',
  },
};

const PlayerCard = ({ player, onPlayerClick }) => {
  // 카드 너비와 스타일을 컴포넌트 내부에서 정의합니다.
  const ITEM_WIDTH = 'w-24';

  // 💡 [수정] 여러 공격수 포지션을 'FW' 스타일로 통합하여 처리합니다.
  const FORWARD_POSITIONS = ['ST', 'CF', 'LF', 'RF', 'RW', 'LW', 'LS', 'RS'];
  let styleKey = player.position;
  if (FORWARD_POSITIONS.includes(player.position) || player.position === 'FW') {
    styleKey = 'FW';
  }
  let MIDDLE_POSITIONS = ['CM', 'LCM', 'RCM', 'CDM', 'LDM', 'RDM', 'CAM', 'LAM', 'RAM', 'LM', 'RM'];
  if (MIDDLE_POSITIONS.includes(player.position) || player.position === 'MF') {
    styleKey = 'MF';
  }
  let DEFENDER_POSITIONS = ['CB', 'LCB', 'RCB', 'LWB', 'RWB', 'LB', 'RB'];
  if (DEFENDER_POSITIONS.includes(player.position) || player.position === 'DF') {
    styleKey = 'DF';
  }

  const styles = POSITION_STYLES[styleKey] || POSITION_STYLES.default;

  return (
    <div
      onClick={() => onPlayerClick(player)}
      // 💡 [수정] flex-col로 세로 정렬, h-32로 높이 고정, justify-between으로 상하단 배치
      className={`flex flex-col justify-between p-2 rounded-lg text-center cursor-pointer 
                  bg-[#0D1117] transition duration-150 shrink-0 ${ITEM_WIDTH} h-32
                  border ${styles.border} ${styles.hoverBg}`}
    >
      {/* 1. 상단: 포지션 */}
      <div className={`text-sm font-bold ${styles.text}`}>{player.position}</div>

      {/* 2. 중간: 아이콘과 등번호 (relative 컨테이너로 겹치기) */}
      <div className="relative flex justify-center items-center">
        {/* 💡 [수정] 아이콘 크기를 w-12 h-12에서 w-16 h-16으로 키웁니다. */}
        <img src={playercardIcon} alt="player card icon" className="w-18 h-18" />
        {/* 등번호를 아이콘 중앙에 absolute로 배치 */}
        {/* 💡 [수정] 아이콘이 커진 만큼 등번호 폰트 크기도 text-2xl에서 text-3xl로 키웁니다. */}
        <span className="absolute text-xl font-black text-white">{player.backNumber || player.number}</span>
      </div>

      {/* 3. 하단: 선수 이름 */}
      <div className="truncate text-sm font-semibold text-white">{player.name}</div>
    </div>
  );
};

export default PlayerCard;
