import { Menubar } from "radix-ui";

import { compositeStyles } from "@/utils/commons/styles";

import MenuItem from "./item";
import type { TMenuProps } from "./types";

export default function Menu(props: TMenuProps) {
  const {
    triggerNode,
    triggerRef,
    items,
    className,
    contentClassName,
    onClickTrigger,
  } = props;
  return (
    <Menubar.Root className={compositeStyles("size-[18px]", className)}>
      <Menubar.Menu>
        <Menubar.Trigger ref={triggerRef} onClick={onClickTrigger}>
          {triggerNode}
        </Menubar.Trigger>
        <Menubar.Portal>
          <Menubar.Content
            className={compositeStyles(
              "rounded-rounded thickness-thin border-border-input-default bg-surface-general-primary p-small-1 z-10 flex flex-col",
              contentClassName
            )}
          >
            {items.map((item) => {
              const { key: _key, ...restProps } = item;
              return (
                <Menubar.Item key={item.key} asChild>
                  <MenuItem {...restProps} />
                </Menubar.Item>
              );
            })}
          </Menubar.Content>
        </Menubar.Portal>
      </Menubar.Menu>
    </Menubar.Root>
  );
}
