export interface Insight {
  badge: string;
  description?: string;
  sentiment?: 'Positive' | 'Neutral' | 'Negative';
  packageInsight?: string;
  insights?: any;
}
