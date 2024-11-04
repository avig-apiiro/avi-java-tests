import _ from 'lodash';
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import {
  AnalyticsDataField,
  AnalyticsEventName,
  AnalyticsLayer,
  useTrackAnalytics,
} from '@src-v2/components/analytics-layer';
import { Dropdown } from '@src-v2/components/dropdown';
import { DropdownMenu } from '@src-v2/components/dropdown-menu';
import { SvgIcon } from '@src-v2/components/icons';
import { usePaneState } from '@src-v2/components/panes/pane-context-provider';
import { Size } from '@src-v2/components/types/enums/size';
import { ExternalLink } from '@src-v2/components/typography';
import { OverrideRiskLevelModal } from '@src-v2/containers/action-modals/override-risk/override-risk-level';
import { CommentActionItem } from '@src-v2/containers/risks/actions/comment-action-item';
import { MessagingActionItems } from '@src-v2/containers/risks/actions/messaging-action-items';
import { TicketingActionItems } from '@src-v2/containers/risks/actions/ticketing-action-items';
import { generateCodeReferenceUrl } from '@src-v2/data/connectors';
import { resourceTypes } from '@src-v2/data/rbac-types';
import { useInject, useToggle } from '@src-v2/hooks';
import { useModalState } from '@src-v2/hooks/use-modal-state';
import { RiskTriggerSummaryResponse } from '@src-v2/types/risks/risk-trigger-summary-response';
import { StubAny } from '@src-v2/types/stub-any';
import { stopPropagation } from '@src-v2/utils/dom-utils';
import { openShowOnClusterMap } from '@src/cluster-map-work/containers/panes/ShowOnClusterClusterMap';

const POPOVER_MAX_HEIGHT = 150;

export const RiskRowActions = forwardRef<
  HTMLImageElement,
  {
    data: any;
    disabled: boolean;
  }
>(({ data, disabled, ...props }, ref) => {
  const risksData = useMemo(() => (_.isArray(data) ? data : [data]), [data]);
  const [modalElement, setModal, closeModal] = useModalState();

  return (
    <AnalyticsLayer
      analyticsData={{
        [AnalyticsDataField.EntryPoint]: 'table row action dropdown',
        [AnalyticsDataField.NumberOfRisks]: '1',
      }}>
      <DropdownMenu
        {...props}
        ref={ref}
        maxHeight={`${Math.min((window.innerHeight - 100) / 4, POPOVER_MAX_HEIGHT)}rem`}
        disabled={disabled}
        placement="left"
        onClick={stopPropagation}
        onItemClick={stopPropagation}
        size={Size.XLARGE}>
        <Dropdown.Group title="Take action">
          <MessagingActionItems data={data} setModal={setModal} closeModal={closeModal} />
          <TicketingActionItems data={data} setModal={setModal} closeModal={closeModal} />
          <CommentActionItem data={data} setModal={setModal} closeModal={closeModal} />
        </Dropdown.Group>
        <OverrideRiskRowAction risk={risksData[0]} setModal={setModal} closeModal={closeModal} />
        {data.relatedEntity?.vendor !== 'Perforce' &&
          data.riskCategory !== 'Branch Protection' &&
          data.riskCategory !== 'Permissions' && <ExploreActionSection riskData={data} />}
      </DropdownMenu>

      {modalElement}
    </AnalyticsLayer>
  );
});

export function ExploreActionSection({ riskData }: { riskData: StubAny }) {
  const [loading, toggleLoading] = useToggle(true);
  const [isShowOnClusterEnabled, setIsShowOnClusterEnabled] = useState(false);
  const { clusters } = useInject();
  const paneState = usePaneState();
  const trackAnalytics = useTrackAnalytics();

  const handleViewCode = useCallback(() => {
    trackAnalytics(AnalyticsEventName.ActionClicked, {
      [AnalyticsDataField.ActionType]: 'View Code',
      [AnalyticsDataField.Context]: 'Risk row actions',
      [AnalyticsDataField.EntryPoint]: 'Explore action',
    });
  }, []);

  const handleShowOnCluster = useCallback(() => {
    trackAnalytics(AnalyticsEventName.ActionClicked, {
      [AnalyticsDataField.ActionType]: 'Show on Cluster',
    });

    openShowOnClusterMap(
      {
        annotatedRepositoryAndModuleReferences: [riskData],
        title: riskData.riskName,
      },
      paneState
    );
  }, [riskData]);

  useEffect(() => {
    const enrichedObject = {
      repositoryAndModuleReferences: riskData.repositoryAndModuleReferences ?? [],
    };

    clusters.enrichWithClusterConnection([enrichedObject]).then(() => {
      setIsShowOnClusterEnabled(
        //@ts-expect-error
        enrichedObject.clusterMapLinksList.find(linkList => linkList.nodeLinks?.length)
      );
      toggleLoading();
    });
  }, []);

  const shouldShowDropdown = riskData.codeReference?.relativeFilePath || isShowOnClusterEnabled;

  return (
    <>
      {shouldShowDropdown && (
        <Dropdown.Group title="Explore">
          {loading ? (
            <>
              <Dropdown.LoadingItem />
              <Dropdown.LoadingItem />
            </>
          ) : (
            <>
              {Boolean(riskData.codeReference?.relativeFilePath) && (
                <Dropdown.Item
                  onClick={handleViewCode}
                  key="code"
                  as={ViewCodeLink}
                  href={generateCodeReferenceUrl(riskData.relatedEntity, riskData.codeReference)}>
                  <SvgIcon name="Code" />
                  View Code
                </Dropdown.Item>
              )}

              {isShowOnClusterEnabled && (
                <Dropdown.Item key="cluster" onClick={handleShowOnCluster}>
                  <SvgIcon name="Cluster" />
                  Show on cluster
                </Dropdown.Item>
              )}
            </>
          )}
        </Dropdown.Group>
      )}
    </>
  );
}

export const OverrideRiskRowAction = ({
  risk,
  setModal,
  closeModal,
}: {
  risk: RiskTriggerSummaryResponse;
  setModal: StubAny;
  closeModal: StubAny;
}) => {
  const { rbac } = useInject();
  const canEdit = rbac.canEdit(resourceTypes.RiskLevel);
  const handleOverrideClick = () => {
    setModal(<OverrideRiskLevelModal risk={risk} closeModal={closeModal} />);
  };

  if (!canEdit) {
    return null;
  }

  return (
    <Dropdown.Group title="Override">
      <Dropdown.Item onClick={handleOverrideClick}>
        <RiskLevelOutlineIcon name="RiskOutline" />
        Override risk level
      </Dropdown.Item>
    </Dropdown.Group>
  );
};

const RiskLevelOutlineIcon = styled(SvgIcon)`
  color: var(--color-blue-gray-50);
`;

const ViewCodeLink = styled(ExternalLink)`
  color: var(--default-text-color);
  text-decoration: none;
`;
