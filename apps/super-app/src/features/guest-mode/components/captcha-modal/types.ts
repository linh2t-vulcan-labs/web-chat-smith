export interface RecaptchaProps {
  onSuccess?: (token: string) => void;
  onError?: (error: string) => void;
  onExpire?: () => void;
  className?: string;
}

export interface RecaptchaRef {
  refresh: () => void;
}
