export interface TFeaturesData {
  id: string;
  title: string;
  image?: string;
  video?: string;
  isBeta?: boolean;
  description: string;
}

export interface TPremiumOnboarding {
  features: TFeaturesData[];
}

export interface TOnboardingStepProps {
  current?: number;
  stepNumber: number;
}
