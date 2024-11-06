import { observer } from 'mobx-react';
import { useLocation, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { Banner } from '@src-v2/components/banner';
import { Button } from '@src-v2/components/button-v2';
import { Input } from '@src-v2/components/forms';
import {
  InputControl,
  SelectControl,
  TextareaControl,
} from '@src-v2/components/forms/form-controls';
import { Form } from '@src-v2/components/forms/form-layout';
import { FormLayoutV2 } from '@src-v2/components/forms/form-layout-v2';
import { Field, Label, LabelWithDescription } from '@src-v2/components/forms/modal-form-layout';
import { BaseIcon } from '@src-v2/components/icons';
import { Gutters, StickyHeader } from '@src-v2/components/layout';
import { Page } from '@src-v2/components/layout/page';
import { InfoTooltip } from '@src-v2/components/tooltips/icon-tooltips';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { Heading5 } from '@src-v2/components/typography';
import { useBreadcrumbs } from '@src-v2/hooks/use-breadcrumbs';
import { StubAny } from '@src-v2/types/stub-any';

export const UserGroupCreatePage = observer((props: StubAny[]) => {
  const { pathname } = useLocation();
  const { key } = useParams<{
    key: string;
  }>();
  const isEdit = pathname.includes('edit');

  useBreadcrumbs({
    breadcrumbs: [{ label: 'User Groups', to: '/settings/access-permissions/user-groups' }],
  });

  return (
    <Page {...props} title="Create User Group">
      <StickyHeader>
        <Button
          to="/settings/access-permissions/user-groups"
          variant={Variant.SECONDARY}
          size={Size.LARGE}>
          Cancel
        </Button>
        <Button type="submit" size={Size.LARGE}>
          {isEdit ? 'Save' : 'Create'}
        </Button>
      </StickyHeader>
      <AsyncBoundary>
        <Gutters>
          <Section>
            <Banner
              icon="Info"
              description={
                <BannerDescription>
                  All users in the group have the same Apiiro permissions as determined by the
                  associated role. Group admins can be assigned to manage group details and members.
                  {'\n'}Users with global permissions can also manage the group and its members.
                </BannerDescription>
              }
            />
            <NameField>
              <Title>Group details</Title>
              {isEdit && (
                <Field>
                  <Label>Group ID</Label>
                  <Input value={key} disabled />
                </Field>
              )}
              <LabelWithDescription>
                <Label required>Name</Label>
                <Description>Choose a unique group name</Description>
              </LabelWithDescription>
              <InputControl name="name" placeholder="Enter name" rules={{ required: true }} />
            </NameField>
            <Field>
              <Label>Description</Label>
              <TextareaControl name="description" placeholder="Type here..." rows={5} />
            </Field>
          </Section>
          <LastSection>
            <Field>
              <LabelWithDescription>
                <Title>Group members</Title>
                <DescriptionListItem>
                  The email address must match the email used to log in to Apiiro
                </DescriptionListItem>
                <DescriptionListItem>
                  <b>Tip</b>: Paste a list of addresses separated by a space ( ), comma (,),
                  semicolon (;), or a new line
                </DescriptionListItem>
              </LabelWithDescription>
            </Field>
            <Field>
              <FormLayoutV2.Label>
                <Heading5>
                  Group admins
                  <InfoTooltip content="Group admins can add or remove members from the group" />
                </Heading5>

                <SelectControl
                  name="adminIds"
                  placeholder="Type an email address or paste a list of addresses..."
                  multiple
                  creatable
                />
              </FormLayoutV2.Label>
            </Field>
            <Field>
              <FormLayoutV2.Label>
                <Heading5>Members</Heading5>
                <SelectControl
                  name="memberIds"
                  placeholder="Type an email address or paste a list of addresses..."
                  multiple
                  creatable
                />
              </FormLayoutV2.Label>
            </Field>
          </LastSection>
        </Gutters>
      </AsyncBoundary>
    </Page>
  );
});

const BannerDescription = styled.span`
  white-space: break-spaces;
`;

const NameField = styled(Field)`
  ${Input} {
    width: 100%;
  }
`;

const Section = styled((Form as any).LabelGroup)`
  width: 200rem;
  margin-left: 4rem;

  ${Banner} ${BaseIcon} {
    width: 10rem;
    height: 10rem;
    align-self: flex-start;
  }

  ${Field} {
    margin: 4rem 0;

    ${Label} {
      position: relative;

      ${BaseIcon} {
        padding: 1rem;
      }
    }
  }
`;

const LastSection = styled(Section)`
  margin-bottom: 12rem;
`;

const Title = styled.h2``;

const Description = styled.p`
  font-size: var(--font-size-xs);
  color: var(--color-blue-gray-60);
`;

const DescriptionListItem = styled(Description)`
  display: list-item;
  margin-left: 4rem;
`;
