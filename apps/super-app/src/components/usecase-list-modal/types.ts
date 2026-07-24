export interface TUseCaseListModalProps {
  open: boolean;
  defaultTab: string;
  onSelect: (key: string) => void;
  onClose: () => void;
}
