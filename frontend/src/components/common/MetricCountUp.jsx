import React, { useEffect, useState } from 'react';

export default function MetricCountUp({ value, duration = 1200, prefix = '', suffix = '', decimals = 0 }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const target = typeof value === 'number' ? value : parseFloat(value) || 0;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Smooth ease-out exponential curve
      const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = easeOut * target;
      setDisplayValue(current);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(target);
      }
    };

    const animFrame = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animFrame);
  }, [value, duration]);

  const formatted = displayValue.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
