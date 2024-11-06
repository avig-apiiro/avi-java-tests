import { ReactNode, useEffect, useRef } from 'react';
import styled from 'styled-components';
import ContainerToRepoSvg from '@src-v2/assets/mocks/container-to-repo-match.svg';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Caption1, EllipsisText } from '@src-v2/components/typography';
import { DashedLine } from '@src-v2/containers/entity-pane/exposure-path/cluster-graph-node';
import { StubAny } from '@src-v2/types/stub-any';

export const pocTooltipText = (repositoryName: string) => {
  const texts = [
    'Matched based on Go packages metadata:\n' +
      "Package metadata, extracted from the image's file system (`/opt/etherpad-lite/linux-arm64/bin/fsutils`), matched uniquely to the file `src/go.mod` in the code repository",
    'Matched based on Java-archive metadata and entry point:\n' +
      "package metadata and Java entry point, extracted from the image's file system (`/usr/local/parser-2.0.0.jar`), matched uniquely to the files `org.apiiro.paresrs.generated`, `src/parsers/build.gradle` in the code repository",
    "Matched based on Dockerfile and the image's configuration:\n" +
      'Environment variables, entry point content and exposed ports from the image\'s configuration correlated uniquely to "Dockerfile" in the code repository',
  ];
  const lengthMod = repositoryName?.length % texts.length;
  return texts[lengthMod];
};

export function ContainerToCodeMatchingMock({
  diagramTexts,
}: {
  diagramTexts: { repositoryName: string; containerName: string };
}) {
  const svgElementRef = useRef<SVGSVGElement | null>(null);

  const matchTypes = ['java', 'go'];
  const includedMatchTypes = diagramTexts.repositoryName.length % 2 ** matchTypes.length || 1;

  useEffect(() => {
    if (svgElementRef.current) {
      Object.entries(diagramTexts).forEach(([key, value]) => {
        const textElementInDiagram = svgElementRef.current
          .getElementsByClassName(`parameterized-text-${key}`)
          ?.item(0);
        if (textElementInDiagram) {
          textElementInDiagram.innerHTML = value;
        }
      });

      matchTypes.forEach((matchType, index) => {
        const showMatchType = Boolean((1 << index) & includedMatchTypes);
        const matchTypeClass = `match-type-${matchType}`;
        const matchTypeElement = svgElementRef.current
          .getElementsByClassName(matchTypeClass)
          ?.item(0);
        if (!showMatchType) {
          matchTypeElement.remove();
        }
      });
    }
  }, [svgElementRef.current]);
  return (
    <SvgContainer>
      <ContainerToRepoSvg ref={svgElementRef} />
    </SvgContainer>
  );
}

const SvgContainer = styled.div`
  display: flex;

  width: 200rem;
  padding: 0;
  margin: 0;

  svg {
    width: 100%;
    height: 100%;
  }
`;

export const DashedLineWithTitleAndGraphTooltip = ({
  text,
  growFactor = 5,
  graph,
}: {
  text: string;
  growFactor: number;
  graph?: ReactNode;
}) => (
  <DashedLine growFactor={growFactor}>
    <GraphTooltip content={graph} disabled={!graph}>
      <Caption1>
        <EllipsisText>{text}</EllipsisText>
      </Caption1>
    </GraphTooltip>
  </DashedLine>
);

const GraphTooltip = styled(Tooltip)`
  background-color: rgba(0, 0, 0, 0);
  max-width: 500rem;
  padding: 0;
  margin: 0;
`;

export const pocInsightsData = (insightName: string) => {
  const insightsData: StubAny = [
    {
      _t: 'RiskTriggerInsightWithReasoning',
      badge: 'Deployed',
      description:
        'In cluster apiiro-rnd-akmlab-us:\nDeployed to container crapi/crapi-community\nIn namespace crapi\n\nIn cluster apiiro-rnd-akmlab-us:\nDeployed to container crapi/gateway-service\nIn namespace crapi\n\nAnd in 1 more clusters\n',
      sentiment: 'Negative',
      insights: {
        _t: 'DeployedInsight',
        reasons: [
          {
            _t: 'ClusterInsightsInsightReasoning',
            insights: {
              clusterInsights: [
                {
                  accountId: null,
                  clusterKey:
                    'https___container_googleapis_com_v1__display_name=gke-connector-test__apiiro-rnd-akmlab-us',
                  clusterName: 'apiiro-rnd-akmlab-us',
                  resourceName: {
                    ns: 'crapi',
                    typeName: 'Deployment',
                    name: 'crapi-community-0',
                  },
                  insight: {
                    _t: 'ClusterMapOverlayInsightDeployed',
                    displayLabel: 'Deployed',
                    description: 'Deployed to container crapi/crapi-community\nIn namespace crapi',
                    sentiment: 'Negative',
                    taglessImage: 'crapi/crapi-community',
                    namespace: 'crapi',
                  },
                },
                {
                  accountId: null,
                  clusterKey:
                    'https___container_googleapis_com_v1__display_name=gke-connector-test__apiiro-rnd-akmlab-us',
                  clusterName: 'apiiro-rnd-akmlab-us',
                  resourceName: {
                    ns: 'crapi',
                    typeName: 'Deployment',
                    name: 'gateway-service-0',
                  },
                  insight: {
                    _t: 'ClusterMapOverlayInsightDeployed',
                    displayLabel: 'Deployed',
                    description: 'Deployed to container crapi/gateway-service\nIn namespace crapi',
                    sentiment: 'Negative',
                    taglessImage: 'crapi/gateway-service',
                    namespace: 'crapi',
                  },
                },
                {
                  accountId: null,
                  clusterKey:
                    'https___container_googleapis_com_v1__display_name=gke-connector-test__apiiro-rnd-akmlab-us',
                  clusterName: 'apiiro-rnd-akmlab-us',
                  resourceName: {
                    ns: 'crapi',
                    typeName: 'Deployment',
                    name: 'mailhog-0',
                  },
                  insight: {
                    _t: 'ClusterMapOverlayInsightDeployed',
                    displayLabel: 'Deployed',
                    description: 'Deployed to container crapi/mailhog\nIn namespace crapi',
                    sentiment: 'Negative',
                    taglessImage: 'crapi/mailhog',
                    namespace: 'crapi',
                  },
                },
              ],
              containersCount: 3,
              ingressesCount: 0,
              externalGatewaysCount: 0,
              accountIdsCount: 0,
            },
          },
        ],
        description:
          'In cluster apiiro-rnd-akmlab-us:\nDeployed to container crapi/crapi-community\nIn namespace crapi\n\nIn cluster apiiro-rnd-akmlab-us:\nDeployed to container crapi/gateway-service\nIn namespace crapi\n\nAnd in 1 more clusters\n',
        sentiment: 'Negative',
        isDirectlyDeployed: false,
        badge: 'Deployed',
      },
    },
    {
      _t: 'RiskTriggerInsightWithReasoning',
      badge: 'Internet exposed',
      description:
        'In cluster apiiro-rnd-akmlab-us:\nExposed through gateway k8s:Service|crapi/mailhog-web, k8s:Ingress|crapi/crapi-ingress, k8s:Ingress|crapi/crapi-ingress-gce\n',
      sentiment: 'Negative',
      insights: {
        _t: 'InternetExposedInsight',
        reasons: [
          {
            _t: 'ClusterInsightsInsightReasoning',
            insights: {
              clusterInsights: [
                {
                  accountId: null,
                  clusterKey:
                    'https___container_googleapis_com_v1__display_name=gke-connector-test__apiiro-rnd-akmlab-us',
                  clusterName: 'apiiro-rnd-akmlab-us',
                  resourceName: {
                    ns: 'crapi',
                    typeName: 'Deployment',
                    name: 'mailhog-0',
                  },
                  insight: {
                    _t: 'ClusterMapOverlayInsightInternetExposed',
                    displayLabel: 'Internet exposed',
                    description:
                      'Exposed through gateway k8s:Service|crapi/mailhog-web, k8s:Ingress|crapi/crapi-ingress, k8s:Ingress|crapi/crapi-ingress-gce',
                    sentiment: 'Negative',
                    exposedBy: [
                      {
                        resourceName: {
                          ns: 'crapi',
                          typeName: 'Service',
                          name: 'mailhog-web',
                        },
                        locator: 'k8s:Service|crapi/mailhog-web',
                      },
                      {
                        resourceName: {
                          ns: 'crapi',
                          typeName: 'Ingress',
                          name: 'crapi-ingress',
                        },
                        locator: 'k8s:Ingress|crapi/crapi-ingress',
                      },
                      {
                        resourceName: {
                          ns: 'crapi',
                          typeName: 'Ingress',
                          name: 'crapi-ingress-gce',
                        },
                        locator: 'k8s:Ingress|crapi/crapi-ingress-gce',
                      },
                    ],
                    involvedExternalGateways: ['crapi::Service::mailhog-web'],
                    involvedIngresses: [
                      'crapi::Ingress::crapi-ingress',
                      'crapi::Ingress::crapi-ingress-gce',
                    ],
                  },
                },
              ],
              containersCount: 1,
              ingressesCount: 2,
              externalGatewaysCount: 1,
              accountIdsCount: 0,
            },
          },
        ],
        description:
          'In cluster apiiro-rnd-akmlab-us:\nExposed through gateway k8s:Service|crapi/mailhog-web, k8s:Ingress|crapi/crapi-ingress, k8s:Ingress|crapi/crapi-ingress-gce\n',
        sentiment: 'Negative',
        isDirectlyDeployed: false,
        badge: 'Internet exposed',
      },
    },
    {
      _t: 'RiskTriggerInsightWithReasoning',
      badge: 'Deployed',
      description:
        'In cluster apiiro-rnd-services:\nDeployed to container us-docker.pkg.dev/apiiro/internal-svc/gateway/docs-gw\nIn namespace default\n',
      sentiment: 'Negative',
      insights: {
        _t: 'DeployedInsight',
        reasons: [
          {
            _t: 'ClusterInsightsInsightReasoning',
            insights: {
              clusterInsights: [
                {
                  accountId: null,
                  clusterKey:
                    'https___container_googleapis_com_v1__display_name=gke-connector-test__apiiro-rnd-services',
                  clusterName: 'apiiro-rnd-services',
                  resourceName: {
                    ns: 'default',
                    typeName: 'Deployment',
                    name: 'shell-docs-0',
                  },
                  insight: {
                    _t: 'ClusterMapOverlayInsightDeployed',
                    displayLabel: 'Deployed',
                    description:
                      'Deployed to container us-docker.pkg.dev/apiiro/internal-svc/gateway/docs-gw\nIn namespace default',
                    sentiment: 'Negative',
                    taglessImage: 'us-docker.pkg.dev/apiiro/internal-svc/gateway/docs-gw',
                    namespace: 'default',
                  },
                },
              ],
              containersCount: 1,
              ingressesCount: 0,
              externalGatewaysCount: 0,
              accountIdsCount: 0,
            },
          },
        ],
        description:
          'In cluster apiiro-rnd-services:\nDeployed to container us-docker.pkg.dev/apiiro/internal-svc/gateway/docs-gw\nIn namespace default\n',
        sentiment: 'Negative',
        isDirectlyDeployed: false,
        badge: 'Deployed',
      },
    },
    {
      _t: 'RiskTriggerInsightWithReasoning',
      badge: 'Internet exposed',
      description:
        'In cluster apiiro-rnd-akmlab-us:\nExposed through gateway k8s:Service|crapi/mailhog-web, k8s:Ingress|crapi/crapi-ingress, k8s:Ingress|crapi/crapi-ingress-gce\n',
      sentiment: 'Negative',
      insights: {
        _t: 'InternetExposedInsight',
        reasons: [
          {
            _t: 'ClusterInsightsInsightReasoning',
            insights: {
              clusterInsights: [
                {
                  accountId: null,
                  clusterKey:
                    'https___container_googleapis_com_v1__display_name=gke-connector-test__apiiro-rnd-akmlab-us',
                  clusterName: 'apiiro-rnd-akmlab-us',
                  resourceName: {
                    ns: 'crapi',
                    typeName: 'Deployment',
                    name: 'mailhog-0',
                  },
                  insight: {
                    _t: 'ClusterMapOverlayInsightInternetExposed',
                    displayLabel: 'Internet exposed',
                    description:
                      'Exposed through gateway k8s:Service|crapi/mailhog-web, k8s:Ingress|crapi/crapi-ingress, k8s:Ingress|crapi/crapi-ingress-gce',
                    sentiment: 'Negative',
                    exposedBy: [
                      {
                        resourceName: {
                          ns: 'crapi',
                          typeName: 'Service',
                          name: 'mailhog-web',
                        },
                        locator: 'k8s:Service|crapi/mailhog-web',
                      },
                      {
                        resourceName: {
                          ns: 'crapi',
                          typeName: 'Ingress',
                          name: 'crapi-ingress',
                        },
                        locator: 'k8s:Ingress|crapi/crapi-ingress',
                      },
                      {
                        resourceName: {
                          ns: 'crapi',
                          typeName: 'Ingress',
                          name: 'crapi-ingress-gce',
                        },
                        locator: 'k8s:Ingress|crapi/crapi-ingress-gce',
                      },
                    ],
                    involvedExternalGateways: ['crapi::Service::mailhog-web'],
                    involvedIngresses: [
                      'crapi::Ingress::crapi-ingress',
                      'crapi::Ingress::crapi-ingress-gce',
                    ],
                  },
                },
              ],
              containersCount: 1,
              ingressesCount: 2,
              externalGatewaysCount: 1,
              accountIdsCount: 0,
            },
          },
        ],
        description:
          'In cluster apiiro-rnd-akmlab-us:\nExposed through gateway k8s:Service|crapi/mailhog-web, k8s:Ingress|crapi/crapi-ingress, k8s:Ingress|crapi/crapi-ingress-gce\n',
        sentiment: 'Negative',
        isDirectlyDeployed: false,
        badge: 'Internet exposed',
      },
    },
  ];

  return insightsData.find((insight: StubAny) => insight.badge === insightName);
};

export const getRepositoryRiskyTickets = (riskName: string) => {
  const repositories = [
    { icon: 'Github', name: 'data-collector' },
    {
      icon: 'Gitlab',
      name: 'internal-portal',
    },
    { icon: 'Gitlab', name: 'android-app' },
    { icon: 'Github', name: 'payments-server' },
    {
      icon: 'Github',
      name: 'rabbitmq-server',
    },
  ];
  const lengthMod = riskName?.length % repositories.length;
  return repositories[lengthMod];
};
