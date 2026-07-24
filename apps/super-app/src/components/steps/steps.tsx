import { compositeStyles } from "@/utils/commons/styles";

import Step from "./step";
import type { TStepsProps } from "./types";

import styles from "./styles.module.scss";

export default function Steps(props: TStepsProps) {
  const { items, align = "vertical" } = props;

  return (
    <ul className="flex w-full flex-col">
      {items.map((item) => (
        <li
          key={item.key}
          data-align={align}
          className="group/step flex w-full data-[align=horizontal]:flex-row data-[align=vertical]:flex-col"
        >
          <Step
            state={item.state}
            description={item.description}
            className="py-small-0.5 h-[25px]"
          />
          <div
            className={compositeStyles(
              "py-small-0.25 px-small-1 w-full group-last/step:hidden",
              styles["stepAnimate"]
            )}
          >
            <div className="thickness-l-thin border-border-general-tertiary dark:border-border-general-secondary size-full" />
          </div>
        </li>
      ))}
    </ul>
  );
}
