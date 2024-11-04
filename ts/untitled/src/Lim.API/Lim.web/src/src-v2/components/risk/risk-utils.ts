import _ from 'lodash';
import { noRisk, riskOrder } from '@src-v2/data/risk-data';
import { useInject, useSuspense } from '@src-v2/hooks';
import { abbreviate } from '@src-v2/utils/number-utils';

export const useRiskProfile = profile => {
  const { applicationProfiles } = useInject();

  const { estimatedRevenue, estimatedUsersNumber } = useSuspense(
    applicationProfiles.getStaticConfigurationOptions
  ) as any;

  if (!profile) {
    return null;
  }

  const configuredBusinessImpact = _.camelCase(profile.configuredBusinessImpact);
  return {
    key: profile.key,
    profileType: normalizeProfileType(profile),
    riskLevel: _.camelCase(profile.risk?.combinedRiskLevel) || noRisk,
    riskScore: abbreviate(profile.riskScore),
    businessImpactLevel: _.camelCase(profile.businessImpact),
    riskFactors: _.orderBy(
      profile.risk?.riskFactors.map(({ ruleName, ruleKey, riskLevel, devPhase }) => ({
        ruleKey,
        title: ruleName,
        riskLevel: _.camelCase(riskLevel),
        devPhase,
      })),
      item => riskOrder.indexOf(item.riskLevel),
      'desc'
    ),
    businessImpactFactors:
      profile.businessImpactToKeywords &&
      _.orderBy(
        Object.entries(profile.businessImpactToKeywords)
          .flatMap(([riskLevel, keywords]) =>
            (keywords as any[]).map(keyword => ({
              title: `Data includes ${keyword}`,
              riskLevel: _.camelCase(riskLevel),
              isConfigurable: false,
            }))
          )
          .concat(
            [
              configuredBusinessImpact !== noRisk && {
                title: `Business Impact configured as ${profile.configuredBusinessImpact}`,
                riskLevel: configuredBusinessImpact,
                isConfigurable: true,
              },
              profile.estimatedRevenue &&
                profile.estimatedRevenue !== 'Undefined' && {
                  title: `Estimated revenue is ${
                    estimatedRevenue?.find(option => option.value === profile.estimatedRevenue)
                      ?.label ?? profile.estimatedRevenue
                  }`,
                  riskLevel: estimatedRevenueMapping[profile.estimatedRevenue] ?? 'low',
                  isConfigurable: true,
                },
              profile.estimatedUsersNumber &&
                profile.estimatedUsersNumber !== 'Undefined' && {
                  title: `Estimated number of users is ${
                    estimatedUsersNumber?.find(
                      option => option.value === profile.estimatedUsersNumber
                    )?.label ?? profile.estimatedUsersNumber
                  }`,
                  riskLevel: estimatedUsersNumberMapping[profile.estimatedUsersNumber] ?? 'low',
                  isConfigurable: true,
                },
              profile.isInternetExposed && {
                title: 'Internet Exposed',
                riskLevel: noRisk,
                isConfigurable: true,
              },
            ].filter(Boolean)
          ),
        item => riskOrder.indexOf(item.riskLevel),
        'desc'
      ),
  };
};

const normalizeProfileType = profile => {
  switch (profile.profileType) {
    case 'ApplicationProfile':
      return 'applications';
    case 'RepositoryProfile':
      return 'repositories';
    case 'ProjectProfile':
      return;
    default:
      console.warn(`Unsupported profileType "${profile.profileType}"`);
  }
};

const estimatedUsersNumberMapping = {
  VeryLarge: 'high',
  Large: 'high',
  Medium: 'medium',
  Small: 'low',
  VerySmall: 'low',
} as const;

const estimatedRevenueMapping = {
  ExtraLarge: 'high',
  Large: 'high',
  Medium: 'medium',
  Small: 'low',
} as const;
