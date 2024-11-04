import { ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { shouldShowExposureGraph } from '@src-v2/components/entity-pane/common/exposure-path';
import { ExposurePathCard } from '@src-v2/containers/entity-pane/exposure-path/exposure-path-card';
import { AboutSastCard } from '@src-v2/containers/entity-pane/sast/main-tab/about-sast-card';
import { RelatedApiCard } from '@src-v2/containers/entity-pane/sast/main-tab/related-api-card';
import { useSastPaneContext } from '@src-v2/containers/entity-pane/sast/use-sast-pane-context';
import { useInject } from '@src-v2/hooks';

export const SastMainTab = (props: ControlledCardProps) => {
  const { risk, element } = useSastPaneContext();
  const { application } = useInject();
  const showExposureGraph = shouldShowExposureGraph(risk, application);
  return (
    <>
      <AboutSastCard {...props} />
      {showExposureGraph && <ExposurePathCard {...props} />}
      {Boolean(element.relatedEntities?.length) && <RelatedApiCard {...props} />}
    </>
  );
};
