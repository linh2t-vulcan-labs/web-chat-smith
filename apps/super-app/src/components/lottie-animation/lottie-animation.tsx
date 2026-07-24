import type { PartialLottieComponentProps } from "lottie-react";
import Lottie from "lottie-react";
import React from "react";

import type { TLottieAnimation } from "./types";

const LottieAnimation: React.FC<
  TLottieAnimation & Pick<PartialLottieComponentProps, "animationData">
> = ({ loop = false, animationData }) => (
  <Lottie animationData={animationData} loop={loop} />
);

export default LottieAnimation;
