import { getRiskColor } from '@src-v2/data/risk-data';

type CategoriesGroup =
  | 'Design'
  | 'OSS'
  | 'Secrets'
  | 'SAST'
  | 'API security'
  | 'Supply chain'
  | 'Toxic combinations'
  | 'Infrastructure'
  | 'Other';

export const risksFunnelColors: Record<string, (key: string, index?: number) => string> = {
  bySeverity: (key: string) => getRiskColor({ riskLevel: key.toLowerCase() }),
  byCategory: (key: CategoriesGroup, index: number) => {
    if (key === 'Toxic combinations') {
      return 'var(--color-pink-60)';
    }

    return `var(--color-blue-${80 - index * 5})`;
  },
};
