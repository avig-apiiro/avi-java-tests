import { observer } from 'mobx-react';
import { useCallback, useEffect, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import styled from 'styled-components';
import { LogoSpinner } from '@src-v2/components/animations/spinner';
import { Button } from '@src-v2/components/button-v2';
import { Chip } from '@src-v2/components/chips';
import { InputControl } from '@src-v2/components/forms/form-controls';
import { Form } from '@src-v2/components/forms/form-layout';
import { Select } from '@src-v2/components/forms/select';
import { Gutters } from '@src-v2/components/layout';
import { StickyHeader } from '@src-v2/components/layout/sticky-header';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { Heading, Paragraph } from '@src-v2/components/typography';
import { PointOfContactFields } from '@src-v2/containers/profiles/points-of-contacts-fields';
import { SearchCombobox } from '@src-v2/containers/search-combobox';
import { useSelectTypeahead } from '@src-v2/containers/select-input';
import { TeamTypeSelect } from '@src-v2/containers/teams/team-form-manual';
import { useInject, useLoading, useSuspense, useValidation } from '@src-v2/hooks';
import { StubAny } from '@src-v2/types/stub-any';

export const TeamFormAutomated = observer(({ editMode }: { editMode: boolean }) => {
  const {
    watch,
    setValue,
    formState: { isDirty },
  } = useFormContext();
  const { contributors } = useInject();
  const { teamTypeDescriptions, serverDescriptions } = useSuspense(
    contributors.getTeamConfiguration
  );
  const { validateEmptySpace } = useValidation();

  const providerUrl = watch('provider')?.value;
  const groupId = watch('providerGroup')?.value;

  useEffect(() => {
    if (!editMode || !providerUrl || isDirty) {
      setValue('providerGroup', null);
    }
  }, [providerUrl]);

  const handleSelectTypeahead = useCallback(
    async (params: StubAny, options: StubAny) =>
      providerUrl ? await contributors.searchGroupOptions({ ...params, providerUrl }, options) : [],
    [providerUrl]
  );

  const [handleGroupOptionsInput, groupOptions, groupOptionsLoading, groupOptionsError] =
    useSelectTypeahead(handleSelectTypeahead);

  return (
    <>
      <StickyHeader>
        <Button
          type="submit"
          variant={Variant.SECONDARY}
          size={Size.LARGE}
          to={editMode ? '/users/teams' : '/users/teams/create'}>
          Cancel
        </Button>
        <Button variant={Variant.PRIMARY} size={Size.LARGE} type="submit">
          Save
        </Button>
      </StickyHeader>
      <Gutters>
        <Form.Fieldset as="label">
          <Heading>Name</Heading>
          <InputControlWrapper
            name="name"
            placeholder="Team Name"
            rules={{
              required: true,
              validate: validateEmptySpace,
            }}
          />
        </Form.Fieldset>
        <Form.Fieldset>
          <Heading>Contributors</Heading>
          <Paragraph>Select an IDP group to manage team members</Paragraph>
          <Form.LabelGroup>
            <Form.Label>
              <Heading>Connector</Heading>
              <Form.LabelCell>
                <Controller
                  name="provider"
                  rules={{ required: true, pattern: /\S/ }}
                  defaultValue={serverDescriptions?.[0]}
                  render={({ field: { onChange, ...field } }) => (
                    <SearchCombobox
                      {...field}
                      // @ts-expect-error
                      as={Select}
                      items={serverDescriptions}
                      onSelect={(event: StubAny) => onChange(event.selectedItem)}
                    />
                  )}
                />
              </Form.LabelCell>
            </Form.Label>

            <Form.Label>
              <Heading>Group</Heading>
              <Form.LabelCell>
                <Controller
                  name="providerGroup"
                  rules={{ required: true, pattern: /\S/ }}
                  render={({ field: { onChange, ...field } }) => (
                    <>
                      <SearchCombobox
                        as={Select}
                        {...field}
                        // @ts-expect-error
                        items={groupOptions}
                        isLoading={groupOptionsLoading}
                        disabled={!providerUrl || groupOptionsError}
                        onSelect={(item: StubAny) => onChange(item?.selectedItem)}
                        onInput={handleGroupOptionsInput}
                      />
                      {groupOptionsError && (
                        <FailureMessage>Connector failure. Please try again later</FailureMessage>
                      )}
                    </>
                  )}
                />
              </Form.LabelCell>
            </Form.Label>
            {groupId && (
              <Form.Label>
                <Heading>Members</Heading>
                <Form.LabelCell>
                  <GroupMembers groupId={groupId} serverUrl={providerUrl} />
                </Form.LabelCell>
              </Form.Label>
            )}
          </Form.LabelGroup>
        </Form.Fieldset>
        <Form.Fieldset>
          <Heading>Advanced Definitions</Heading>
          <Form.LabelGroup>
            <Form.Label>
              <Heading>Team Type</Heading>
              <Form.LabelCell>
                <TeamTypeSelect
                  name="teamType"
                  options={teamTypeDescriptions ?? []}
                  defaultValue={teamTypeDescriptions?.[0]}
                  rules={{ required: true, pattern: /\S/ }}
                  clearable={false}
                  searchable={false}
                />
              </Form.LabelCell>
            </Form.Label>
          </Form.LabelGroup>
          <Form.Collapsible title="Points of Contact" overflow="visible" defaultOpen>
            <Paragraph>Define lead personas for this team</Paragraph>
            <PointOfContactFields name="pointsOfContact" />
          </Form.Collapsible>
        </Form.Fieldset>
      </Gutters>
    </>
  );
});

function GroupMembers({ groupId, serverUrl }: { groupId: string; serverUrl: string }) {
  const { contributors } = useInject();
  const [members, setMembers] = useState({ count: 0, items: [] });

  const [fetchMembers, loading] = useLoading(
    (groupId: string) => contributors.getGroupUsers({ groupId, serverUrl }).then(setMembers),
    [setMembers, serverUrl]
  );

  useEffect(() => {
    if (groupId && serverUrl) {
      fetchMembers(groupId);
    }
  }, [groupId, serverUrl]);

  return loading ? (
    <LogoSpinner />
  ) : members.count > 0 ? (
    <>
      <ChipList>
        {members.items?.slice(0, 3).map(item => <Chip key={item.value}>{item.label}</Chip>)}
      </ChipList>
      {members.count > 3 && `+${members.count - 3}`}
    </>
  ) : (
    <Paragraph>No group members</Paragraph>
  );
}

const ChipList = styled.div`
  display: flex;
  gap: 3rem;
`;

const FailureMessage = styled.span`
  font-size: var(--font-size-xs);
  color: var(--color-red-30);
`;

const InputControlWrapper = styled(InputControl)`
  width: 85rem;
`;
