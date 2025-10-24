// src/components/FormationLoadModal.jsx
import React from 'react';
import { Trash2, List } from 'lucide-react';

const FormationLoadModal = ({ isOpen, onClose, savedFormations, onLoad, onDelete, loadError }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-[400px]">
        <h3 className="text-xl font-bold mb-4 border-b pb-2">저장된 포메이션 불러오기</h3>

        {loadError && <p className="text-red-500 mb-4">{loadError}</p>}

        <div className="max-h-80 overflow-y-auto">
          {savedFormations.length === 0 ? (
            <p className="text-gray-500 text-center py-4">저장된 포메이션이 없습니다.</p>
          ) : (
            savedFormations.map((formation) => (
              <div
                key={formation.formationId}
                className="p-3 mb-2 border rounded-lg hover:bg-indigo-50 transition duration-150 flex justify-between items-center"
              >
                {/* 포메이션 이름/날짜 영역 (클릭 시 로드) */}
                <div
                  onClick={() => onLoad(formation)} // 클릭 시 적용
                  className="flex-grow cursor-pointer"
                >
                  <p className="font-semibold text-gray-800">{formation.name}</p>
                  <p className="text-sm text-gray-500">저장일: {new Date(formation.createdAt).toLocaleDateString()}</p>
                </div>

                {/* 삭제 버튼 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(formation.formationId, formation.name);
                  }}
                  className="ml-4 p-1 text-sm text-red-500 hover:bg-red-100 rounded-full transition duration-150 flex-shrink-0"
                  aria-label="포메이션 삭제"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="py-2 px-4 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400">
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormationLoadModal;
