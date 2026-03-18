import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

type FadeDirection = 'up' | 'down' | 'left' | 'right' | 'none';

interface MotionWrapperProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  direction?: FadeDirection;
  delay?: number;
  duration?: number;
  className?: string;
}

const directionVariants = {
  up: { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } },
  down: { hidden: { opacity: 0, y: -20 }, visible: { opacity: 1, y: 0 } },
  left: { hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } },
  right: { hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } },
  none: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
};

export const MotionDiv = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.4,
  className,
  ...props
}: MotionWrapperProps) => (
  <motion.div
    className={className}
    initial="hidden"
    animate="visible"
    variants={directionVariants[direction]}
    transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
    {...props}
  >
    {children}
  </motion.div>
);

export const MotionSpan = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.4,
  className,
  ...props
}: MotionWrapperProps) => (
  <motion.span
    className={className}
    initial="hidden"
    animate="visible"
    variants={directionVariants[direction]}
    transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
    {...props}
  >
    {children}
  </motion.span>
);

interface ScaleInProps extends Omit<MotionWrapperProps, 'direction'> {
  scale?: number;
}

export const ScaleIn = ({
  children,
  delay = 0,
  duration = 0.3,
  scale = 0.9,
  className,
  ...props
}: ScaleInProps) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, scale }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
    {...props}
  >
    {children}
  </motion.div>
);

interface SlideInProps extends Omit<MotionWrapperProps, 'direction'> {
  from: 'bottom' | 'top' | 'left' | 'right';
}

export const SlideIn = ({
  children,
  from,
  delay = 0,
  duration = 0.3,
  className,
  ...props
}: SlideInProps) => {
  const directions = {
    bottom: { y: '100%', x: 0 },
    top: { y: '-100%', x: 0 },
    left: { x: '-100%', y: 0 },
    right: { x: '100%', y: 0 },
  };

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...directions[from] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

interface StaggerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export const StaggerContainer = ({ children, className, staggerDelay = 0.05 }: StaggerProps) => (
  <motion.div
    className={className}
    initial="hidden"
    animate="visible"
    variants={{
      visible: { transition: { staggerChildren: staggerDelay } },
    }}
  >
    {children}
  </motion.div>
);

export const StaggerItem = ({ children, className }: { children: ReactNode; className?: string }) => (
  <motion.div
    className={className}
    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
    transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
  >
    {children}
  </motion.div>
);

interface HoverScaleProps {
  children: ReactNode;
  className?: string;
  scale?: number;
}

export const HoverScale = ({ children, className, scale = 1.05 }: HoverScaleProps) => (
  <motion.div
    className={className}
    whileHover={{ scale }}
    whileTap={{ scale: 0.98 }}
    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
  >
    {children}
  </motion.div>
);

interface TapEffectProps {
  children: ReactNode;
  className?: string;
}

export const TapEffect = ({ children, className }: TapEffectProps) => (
  <motion.div
    className={className}
    whileTap={{ scale: 0.96 }}
    transition={{ duration: 0.1 }}
  >
    {children}
  </motion.div>
);

export { AnimatePresence, motion };