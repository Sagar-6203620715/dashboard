"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect } from "react";

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  decimals?: number;
}

export function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  className,
  decimals = 0,
}: AnimatedNumberProps) {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    stiffness: 120,
    damping: 20,
  });

  const display = useTransform(springValue, (latest) => {
    const factor = Math.pow(10, decimals);
    const rounded = Math.round(latest * factor) / factor;
    const formatted =
      decimals > 0
        ? rounded.toLocaleString(undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })
        : Math.round(rounded).toLocaleString();
    return `${prefix}${formatted}${suffix}`;
  });

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  return (
    <motion.span className={className}>
      {display as unknown as React.ReactNode}
    </motion.span>
  );
}

