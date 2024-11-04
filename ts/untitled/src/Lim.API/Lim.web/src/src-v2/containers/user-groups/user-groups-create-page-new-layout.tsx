import { observer } from 'mobx-react';
import { useLocation, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { Banner } from '@src-v2/components/banner';
import { Button } from '@src-v2/components/button-v2';
import { Input } from '@src-v2/components/forms';
import { InputControl, SelectControlV2 } from '@src-v2/components/forms/form-controls';
import { FormLayoutV2 } from '@src-v2/components/forms/form-layout-v2';
import { Page } from '@src-v2/components/layout/page';
import { InfoTooltip } from '@src-v2/components/tooltips/icon-tooltips';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { Heading1, Heading3, Heading5 } from '@src-v2/components/typography';
import { useBreadcrumbs } from '@src-v2/hooks/use-breadcrumbs';
import { StubAny } from '@src-v2/types/stub-any';

export const UserGroupCreatePageNewLayout = observer((props: StubAny) => {
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
      <AsyncBoundary>
        <FormLayoutV2.Container>
          <CustomBanner
            icon="Info"
            description={
              <BannerDescription>
                All users in the group have the same Apiiro permissions as determined by the
                associated role. Group admins can be assigned to manage group details and members.{' '}
                Users with global permissions can also manage the group and its members.
              </BannerDescription>
            }
          />
          <FormLayoutV2.Section>
            <Heading1>{isEdit ? 'Edit' : 'Create'} group</Heading1>
            {isEdit && (
              <>
                <FormLayoutV2.Label>
                  Group ID
                  <Input value={key} disabled />
                </FormLayoutV2.Label>
              </>
            )}
            <FormLayoutV2.Label required>
              <Heading5>Name</Heading5>
              <Description>Choose a unique group name</Description>
              <InputControl name="name" placeholder="Enter name" rules={{ required: true }} />
            </FormLayoutV2.Label>
            <FormLayoutV2.Label>
              <Heading5>Description</Heading5>
              <InputControl name="description" placeholder="Type here..." />
            </FormLayoutV2.Label>
          </FormLayoutV2.Section>
          <FormLayoutV2.Section>
            <HeadingWithDescription>
              <Heading3>Group members</Heading3>
              <DescriptionListItem>
                The email address must match the email used to log in to Apiiro
              </DescriptionListItem>
              <DescriptionListItem>
                <b>Tip</b>: Paste a list of addresses separated by a space ( ), comma (,), semicolon
                (;), or a new line
              </DescriptionListItem>
            </HeadingWithDescription>
            <FormLayoutV2.Label>
              <Heading5>
                Group admins
                <InfoTooltip content="Group admins can add or remove members from the group" />
              </Heading5>
              <SelectControlV2
                name="adminIds"
                placeholder="Type an email address or paste a list of addresses..."
                multiple
                creatable
              />
            </FormLayoutV2.Label>
            <FormLayoutV2.Label>
              <Heading5>Members</Heading5>
              <SelectControlV2
                name="memberIds"
                placeholder="Type an email address or paste a list of addresses..."
                multiple
                creatable
              />
            </FormLayoutV2.Label>
          </FormLayoutV2.Section>
        </FormLayoutV2.Container>
      </AsyncBoundary>
      <FormLayoutV2.Footer>
        <FormLayoutV2.Actions>
          <Button
            to="/settings/access-permissions/user-groups"
            variant={Variant.SECONDARY}
            size={Size.LARGE}>
            Cancel
          </Button>
          <Button type="submit" size={Size.LARGE}>
            {isEdit ? 'Save' : 'Create'}
          </Button>
        </FormLayoutV2.Actions>
      </FormLayoutV2.Footer>
    </Page>
  );
});

const CustomBanner = styled(Banner)`
  max-width: 240rem;
  margin-top: 0;
`;

const BannerDescription = styled.span`
  white-space: break-spaces;
`;

const Description = styled.p`
  font-size: var(--font-size-xs);
  color: var(--color-blue-gray-60);
`;

const DescriptionListItem = styled(Description)`
  display: list-item;
  margin-left: 4rem;
`;

export const HeadingWithDescription = styled.div`
  display: flex;
  flex-direction: column;

  ${Heading3} {
    margin-bottom: 1rem;
  }
`;
