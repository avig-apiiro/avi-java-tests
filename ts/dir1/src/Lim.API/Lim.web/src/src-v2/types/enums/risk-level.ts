export enum RiskLevel {
  None = 'None',
  AutoIgnored = 'AutoIgnored',
  Ignored = 'Ignored',
  Accepted = 'Accepted',
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical',
}

export enum RiskStatus {
  Open = 'Open',
  Accepted = 'Accepted',
  Ignored = 'Ignored',
}

export function getRiskyRiskLevels() {
  return [RiskLevel.Low, RiskLevel.Medium, RiskLevel.High, RiskLevel.Critical].map(
    level => RiskLevel[level]
  );
}
