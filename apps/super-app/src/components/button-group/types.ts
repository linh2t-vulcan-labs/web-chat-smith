export interface TButtonOption {
  icon?: React.ReactNode;
  value: string;
  label: string;
}

export interface TButtonGroups {
  value?: string | number;
  options: TButtonOption[];
  onChange: (value: string) => void;
}
