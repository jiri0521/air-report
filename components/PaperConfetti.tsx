// components/PaperConfetti.tsx
import React from 'react';

const PaperConfetti: React.FC = () => {
  const confettiPieces = Array.from({ length: 100 });

  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-60"> {/* z-index を高く設定 */}
      {confettiPieces.map((_, index) => (
        <div
          key={index}
          className={`absolute w-2 h-2 bg-red-500 rounded-full animate-fall`}
          style={{
            left: `${Math.random() * 100}vw`,
            animationDuration: `${Math.random() * 2 + 2}s`,
            opacity: Math.random() * 0.5 + 0.5,
            animationDelay: `${Math.random() * 2}s`,
            transform: `scale(${Math.random() * 0.5 + 0.5})`,
          }}
        />
      ))}
    </div>
  );
};

export default PaperConfetti;
