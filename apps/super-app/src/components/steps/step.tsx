import { IconsFilledCompletedStepIcon } from "@cs/icons/icons-filled-completed-step";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";

import { compositeStyles } from "@/utils/commons/styles";

import type { TStepProps } from "./types";

export default function Step(props: TStepProps) {
  const { state = "completed", description, className } = props;

  return (
    <div
      data-state={state}
      className={compositeStyles(
        "group/step-item gap-x-small-0.75 inline-flex w-full items-center",
        className
      )}
    >
      <div className="group-data-[state=loading]:p-small-0.25 relative size-4">
        <AnimatePresence mode="wait">
          {state === "loading" ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Image
                src="/images/generating.png"
                alt="loading..."
                className="group-data-[state=loading]/step-item:animate-spin"
                width={16}
                height={16}
              />
            </motion.div>
          ) : (
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <IconsFilledCompletedStepIcon
                className="text-[#606060] dark:text-[#F7F7F7]"
                width={16}
                height={16}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <p
        className={compositeStyles(
          "text-footnoteM-neutral text-text-general-secondary flex-1"
        )}
      >
        {description}
      </p>
    </div>
  );
}
