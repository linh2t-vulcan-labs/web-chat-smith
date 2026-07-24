import type { ReactNode } from "react";
import React from "react";

export type TPropsItem<TProps> = {
  uid: string;
} & TProps;

export interface TMenu<T> {
  header?: TPropsItem<T>[];
  body: TPropsItem<T>[];
  className?: string;
  children: (props: TPropsItem<T>) => ReactNode;
}

export interface TMenuItem {
  children: ReactNode;
}

export interface TMenuItemProps {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  customElement?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
}

export interface TMenuProps {
  triggerNode: React.ReactNode;
  triggerRef?: React.MutableRefObject<HTMLButtonElement | null>;
  onClickTrigger?: () => void;
  items: TMenuItemProps[];
  className?: string;
  contentClassName?: string;
}
