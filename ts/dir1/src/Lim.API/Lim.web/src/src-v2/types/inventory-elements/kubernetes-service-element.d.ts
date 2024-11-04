import { BaseElement } from '@src-v2/types/inventory-elements/base-element';

export interface KubernetesServiceElement extends BaseElement {
  type: 'ClusterIp' | 'NodePort' | 'LoadBalancer' | 'ExternalName';
  backingDeploymentsNamesById: Record<string, string>;
  ports: { targetPort: string; nodePort: string }[];
}
