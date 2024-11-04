import _ from 'lodash';
import { ControlledCard, ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { ElementInsights } from '@src-v2/components/entity-pane/evidence/element-insights';
import {
  EvidenceLine,
  EvidenceLinesWrapper,
} from '@src-v2/components/entity-pane/evidence/evidence-line';
import { VendorIcon } from '@src-v2/components/icons';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Size } from '@src-v2/components/types/enums/size';
import { ExternalLink } from '@src-v2/components/typography';
import { dependencyTypeToIconName } from '@src-v2/containers/entity-pane/sca/sca-utils';
import { useScaPaneContext } from '@src-v2/containers/entity-pane/sca/use-sca-pane-context';

export const AboutPackageCard = (props: ControlledCardProps) => {
  const { element } = useScaPaneContext();

  const { packageDigest } = element;
  const homePageUrl = packageDigest.homePageUrl ?? element.homePageUrl;

  const isPublicRegistry = _.every(packageDigest.insights, insights =>
    _.every(insights, insight => insight.packageInsight !== 'MissingFromRegistry')
  );

  return (
    <ControlledCard {...props} title="About this package">
      <EvidenceLinesWrapper>
        <EvidenceLine isExtendedWidth label="External dependency">
          <Tooltip content={dependencyTypeToIconName(element.dependencyType)}>
            <VendorIcon name={element.dependencyType} size={Size.SMALL} />
          </Tooltip>
          {homePageUrl ? (
            <Tooltip content="View package">
              <ExternalLink href={homePageUrl}>{element.displayName}</ExternalLink>
            </Tooltip>
          ) : (
            element.displayName
          )}
        </EvidenceLine>
        {packageDigest.description && (
          <EvidenceLine isExtendedWidth label="Package details">
            {packageDigest?.description}
          </EvidenceLine>
        )}
        {packageDigest.lastVersion && (
          <EvidenceLine isExtendedWidth label="Latest version">
            {packageDigest.lastVersion}
          </EvidenceLine>
        )}
        {isPublicRegistry && (
          <EvidenceLine isExtendedWidth label="Presence on public registry">
            Present
          </EvidenceLine>
        )}
        {Boolean(packageDigest.licenses?.length) && (
          <EvidenceLine isExtendedWidth label="License">
            {packageDigest.licenses.join(',')}
          </EvidenceLine>
        )}
        {Boolean(packageDigest.insights?.OssPackageHealth?.length) && (
          <EvidenceLine isExtendedWidth label="Package health Insights">
            <ElementInsights insights={packageDigest.insights.OssPackageHealth} />
          </EvidenceLine>
        )}
        {Boolean(packageDigest.insights?.OssLicenseCompliance?.length) && (
          <EvidenceLine isExtendedWidth label="License compliance Insights">
            <ElementInsights insights={packageDigest.insights.OssLicenseCompliance} />
          </EvidenceLine>
        )}
      </EvidenceLinesWrapper>
    </ControlledCard>
  );
};
