export interface TSwitchProps {
  checked?: boolean;
  disabled?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  ariaLabel?: string;
}
