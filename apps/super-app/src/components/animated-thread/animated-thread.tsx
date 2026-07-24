import type { MotionProps } from "motion/react";
import { motion } from "motion/react";
import React from "react";

type AnimatedThreadProps = MotionProps;

const AnimatedThread = (props: AnimatedThreadProps) => (
  <motion.li
    transition={{
      duration: 0,
      ease: "easeInOut",
    }}
    layout
    {...props}
  >
    {props.children}
  </motion.li>
);

export default AnimatedThread;
