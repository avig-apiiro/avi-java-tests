import { observer } from 'mobx-react';
import styled from 'styled-components';
import { Button } from '@src-v2/components/button-v2';
import { Dropdown } from '@src-v2/components/dropdown';
import { InputControl, SelectControlV2 } from '@src-v2/components/forms/form-controls';
import { Form } from '@src-v2/components/forms/form-layout';
import { Gutters } from '@src-v2/components/layout';
import { StickyHeader } from '@src-v2/components/layout/sticky-header';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { Heading, Paragraph } from '@src-v2/components/typography';
import { PointOfContactFields } from '@src-v2/containers/profiles/points-of-contacts-fields';
import { useInject, useSuspense, useValidation } from '@src-v2/hooks';
import { StubAny } from '@src-v2/types/stub-any';

export const TeamFormManual = observer(({ editMode }: { editMode: boolean }) => {
  const { contributors } = useInject();
  const { teamTypeDescriptions } = useSuspense(contributors.getTeamConfiguration);
  const { validateEmptySpace } = useValidation();

  return (
    <>
      <StickyHeader>
        <Button
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

        <ContributorsFieldSet as="label">
          <Heading>Contributors</Heading>
          <Paragraph>Add contributors to your team</Paragraph>
          <SelectControlV2
            searchable
            multiple
            name="contributors"
            placeholder="Select a type..."
            keyBy="username"
            rules={{ required: true, pattern: /\S/ }}
            searchMethod={contributors.searchDevelopers}
            formatOptionLabel={(developer: StubAny) => developer.username}
          />
        </ContributorsFieldSet>

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
                  searchable={false}
                  clearable={false}
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

const ContributorsFieldSet = styled(Form.Fieldset)`
  ${Dropdown.List} {
    max-width: 85rem;
  }
`;

const InputControlWrapper = styled(InputControl)`
  width: 85rem;
`;

export const TeamTypeSelect = styled(SelectControlV2)`
  width: 85rem;
`;
