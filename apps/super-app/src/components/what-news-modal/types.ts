export interface TFeaturesData {
  id: string;
  title: string;
  video?: string;
  image?: string;
  isBeta?: boolean;
  description: string;
  type?: string;
}

export interface TRemoteConfigWhatNewsPopupOptions {
  config: {
    version: string;
    enabled: boolean;
  };
  features: TFeaturesData[];
}
