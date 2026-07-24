export enum EManageAccountModalTab {
  GENERAL = "general",
  MY_PLAN = "my-plan",
  HELP_CENTER = "help-center",
}

export type TManageAccountModalProps = Readonly<{
  open: boolean;
  isShowManageSubscription: boolean;
  onClose?: () => void;
  defaultTab?: EManageAccountModalTab;
  activeTab?: EManageAccountModalTab;
  onChangeTab?: (tab: EManageAccountModalTab) => void;
}>;
