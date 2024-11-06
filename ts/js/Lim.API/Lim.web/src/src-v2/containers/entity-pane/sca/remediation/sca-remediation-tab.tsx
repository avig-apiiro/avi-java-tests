import { FixScaCard } from '@src-v2/containers/entity-pane/sca/remediation/fix-sca-card';
import { MultiProviderRemediation } from '@src-v2/containers/entity-pane/sca/remediation/multi-provider-remediation';
import { useScaPaneContext } from '@src-v2/containers/entity-pane/sca/use-sca-pane-context';
import { useInject } from '@src-v2/hooks';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';

export function ScaRemediationTab() {
  const { application } = useInject();
  const { element } = useScaPaneContext();

  if (application.isFeatureEnabled(FeatureFlag.ScaProviderOrder)) {
    return <MultiProviderRemediation />;
  }

  return element.suggestedVersion && <FixScaCard triggerOpenState={{ isOpen: true }} />;
}
