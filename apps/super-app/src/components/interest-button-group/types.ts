export interface TInterestGroupProps {
  isOpenUseCaseListModal?: boolean;
  defaultTab: string;
  interestValues: string[];
  onSelect: (key: string) => void;
  onClickCategory: (category: string) => void;
  onClose: () => void;
}
