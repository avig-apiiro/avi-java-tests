import { Language } from '@src-v2/types/enums/language';

export interface ResourceName {
  name: string;
}

export interface ClusterInsights {
  resourceName: ResourceName;
}

export interface Indicator {
  type: 'Provider' | 'Svg' | 'CircleSvg' | 'Language';
  name: string;
  state: 'Positive' | 'Negative' | 'Neutral';
}

export interface LanguageWithPercentage {
  key: Language;
  value: number;
}

export interface NodeProperty {
  key: string;
  title: string;
  text: string;
  additionalText: string[];
  link: string;
  indicator: Indicator;
  languages?: LanguageWithPercentage[];
}

export interface NodePropertiesSection {
  key: string;
  name: string;
  properties: NodeProperty[];
}

export interface NodeAction {
  text: string;
  link: string;
}

export interface ExposurePathNodeType {
  children: ExposurePathNodeType[];
  title: string;
  subtitle: string;
  nodeCategory: string;
  type: string;
  indicators: Indicator[];
  key: string;
  isMatched: boolean;
  propertiesSections: NodePropertiesSection[];
  actions: NodeAction[];
}

export interface ExposurePathNodeLink {
  fromNodeKey: string;
  toNodeKey: string;
}

export interface ExposurePathResponse {
  clusterInsights: ClusterInsights;
  containersCount: number;
  ingressesCount: number;
  accountsCount: number;
  accountId: number;
  nodes: ExposurePathNodeType[];
  links: ExposurePathNodeLink[];
  analyticsExposure?: string;
}
