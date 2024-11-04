import { ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { shouldShowExposureGraph } from '@src-v2/components/entity-pane/common/exposure-path';
import { ExposurePathCard } from '@src-v2/containers/entity-pane/exposure-path/exposure-path-card';
import { AboutSensitiveDataRiskCard } from '@src-v2/containers/entity-pane/sensitive-data/main-tab/about-sensitive-data-risk-card';
import { RelatedApisCard } from '@src-v2/containers/entity-pane/sensitive-data/main-tab/related-apis-card';
import { useSensitiveDataPaneContext } from '@src-v2/containers/entity-pane/sensitive-data/use-sensitive-data-pane-context';
import { useInject } from '@src-v2/hooks';

export function SensitiveDataMainTab(props: ControlledCardProps) {
  const { application } = useInject();
  const { risk } = useSensitiveDataPaneContext();

  const showExposureGraph = shouldShowExposureGraph(risk, application);
  return (
    <>
      <AboutSensitiveDataRiskCard {...props} />
      {showExposureGraph && <ExposurePathCard {...props} />}
      <RelatedApisCard {...props} />
    </>
  );
}
