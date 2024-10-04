// components/ConfettiButton.tsx
import React from 'react';
import party from 'party-js';

const ConfettiButton: React.FC = () => {
  const handleClick = () => {
    party.confetti(document.body, {
      count: party.variation.range(50, 200), // コンフェッティの数をランダムに設定
    });
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <button
        onClick={handleClick}
        className="px-6 py-3 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition duration-200"
      >
       閉じる
      </button>
    </div>
  );
};

export default ConfettiButton;

