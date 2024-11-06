import styled from 'styled-components';
import { ClampText } from '@src-v2/components/clamp-text';
import { CheckboxToggle } from '@src-v2/components/forms';
import {
  DualListBoxControl,
  DualListBoxControlProps,
} from '@src-v2/components/forms/form-controls';
import { InputClickableLabel } from '@src-v2/components/forms/form-layout-v2';
import { VendorIcon } from '@src-v2/components/icons';
import { SubHeading4 } from '@src-v2/components/typography';
import { useInject, useToggle } from '@src-v2/hooks';
import { ApplicationProfileResponse } from '@src-v2/types/profiles/application-profile-response';
import { LeanConsumable, LeanRepositoryConsumable } from '@src-v2/types/profiles/lean-consumable';
import { RepositoryGroup } from '@src-v2/types/profiles/repository-profile-response';

function filterConsumable<T extends { name: string }>(item: T, searchTerm: string) {
  return item.name?.toLowerCase().includes(searchTerm?.toLowerCase());
}

export const ApplicationListBoxControl = () => (
  <DualListBoxControl
    name={ApplicationProfileResponse.profileType}
    searchMethod={useInject().applicationProfilesV2.searchLeanApplications}
    filterBy={filterConsumable}
    renderMainItem={({ item }) => <ClampText>{item.name}</ClampText>}
  />
);

function filterRepositoryGroup(item: RepositoryGroup, searchTerm: string) {
  return item.groupName.toLowerCase().includes(searchTerm?.toLowerCase());
}

export const RepositoryGroupsListBoxControl = () => (
  <DualListBoxControl
    name="repositoryGroups"
    searchMethod={useInject().repositoryProfiles.searchRepositoryGroups}
    filterBy={filterRepositoryGroup}
    renderMainItem={({ item }) => (
      <>
        <VendorIcon name={item.providerGroup} />
        <ClampText>{item.groupName}</ClampText>
      </>
    )}
  />
);

export function ConsumableListBoxControl<TSearchParams>(
  props: Pick<
    DualListBoxControlProps<LeanConsumable, TSearchParams>,
    'name' | 'searchMethod' | 'searchParams'
  >
) {
  const [showMainServerUrl, toggleShowMainServerUrl] = useToggle();
  const [showSecondaryServerUrl, toggleShowSecondaryServerUrl] = useToggle();

  return (
    <DualListBoxControl
      {...props}
      filterBy={filterConsumable}
      renderMainItem={props => <ConsumableListItem {...props} showServerUrl={showMainServerUrl} />}
      renderSecondaryItem={props => (
        <ConsumableListItem {...props} showServerUrl={showSecondaryServerUrl} />
      )}
      mainListFooter={
        <ToggleConsumableName>
          <CheckboxToggle checked={showMainServerUrl} onChange={toggleShowMainServerUrl} />
          Show name with server
        </ToggleConsumableName>
      }
      secondaryListFooter={
        <ToggleConsumableName>
          <CheckboxToggle
            checked={showSecondaryServerUrl}
            onChange={toggleShowSecondaryServerUrl}
          />
          Show name with server
        </ToggleConsumableName>
      }
    />
  );
}

const ConsumableListItem = ({
  item,
  showServerUrl,
}: {
  item: LeanConsumable;
  showServerUrl: boolean;
}) => {
  return (
    <>
      <VendorIcon name={item.provider} />
      {showServerUrl ? (
        <DetailsContainer>
          <ConsumableItemText>{item}</ConsumableItemText>
          <ClampText as={SubHeading4}>{item.serverUrl}</ClampText>
        </DetailsContainer>
      ) : (
        <ConsumableItemText>{item}</ConsumableItemText>
      )}
    </>
  );
};

const ConsumableItemText = styled(
  ({ children: consumable, ...props }: { children: LeanConsumable }) => (
    <ClampText {...props}>{`${consumable.name}${
      isLeanRepositoryConsumable(consumable) ? ` (${consumable.referenceName})` : ''
    }`}</ClampText>
  )
)`
  flex: 1;
  width: unset;
`;

function isLeanRepositoryConsumable(
  consumable: LeanConsumable
): consumable is LeanRepositoryConsumable {
  return 'referenceName' in consumable;
}

const DetailsContainer = styled.div`
  display: grid;
  flex: 1;
  grid-template-columns: 1fr 1fr;
  align-items: center;
`;

const ToggleConsumableName = styled(InputClickableLabel)`
  display: flex;
  align-items: center;
  gap: 2rem;
`;
