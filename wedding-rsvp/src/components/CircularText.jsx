import { motion } from 'motion/react';
import { useMemo, useState } from 'react';

const hoverSpeedMap = {
  slowDown: 1.75,
  speedUp: 0.45,
  pause: 9999,
  goBonkers: 0.18
};

export default function CircularText({
  text = '',
  spinDuration = 20,
  characterOffset = '-50%',
  onHover,
  className = ''
}) {
  const [isHovered, setIsHovered] = useState(false);

  const characters = useMemo(() => text.split(''), [text]);
  const effectiveDuration = isHovered && onHover ? spinDuration * (hoverSpeedMap[onHover] || 1) : spinDuration;

  return (
    <motion.div
      className={`circular-text ${className}`.trim()}
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, ease: 'linear', duration: effectiveDuration }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      aria-hidden="true"
    >
      {characters.map((character, index) => {
        const angle = (360 / characters.length) * index;

        return (
          <span
            key={`${character}-${index}`}
            className="circular-text-char"
            style={{ transform: `rotate(${angle}deg)` }}
          >
            <span style={{ transform: `translateY(${characterOffset})` }}>{character}</span>
          </span>
        );
      })}
    </motion.div>
  );
}