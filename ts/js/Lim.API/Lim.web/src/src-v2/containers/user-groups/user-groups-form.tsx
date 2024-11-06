import { observer } from 'mobx-react';
import { ReactNode, useCallback } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { Banner } from '@src-v2/components/banner';
import { Dropdown } from '@src-v2/components/dropdown';
import { Combobox, Input } from '@src-v2/components/forms';
import { FormContext } from '@src-v2/components/forms/form-context';
import { Form } from '@src-v2/components/forms/form-layout';
import { FormLayoutV2 } from '@src-v2/components/forms/form-layout-v2';
import { BaseIcon } from '@src-v2/components/icons';
import { useInject, useSuspense } from '@src-v2/hooks';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { StubAny } from '@src-v2/types/stub-any';

export const UserGroupsForm = styled(
  observer(({ onCreate, ...props }: { onCreate?: StubAny; children?: ReactNode }) => {
    const { userGroups, toaster, application } = useInject();
    const { key } = useParams<{ key: string }>();
    const history = useHistory();

    const defaultValues = useSuspense(userGroups.getUserGroup, { key });

    const handleSubmit = useCallback(
      async ({
        name,
        description,
        adminIds,
        memberIds,
        ...formData
      }: {
        name: string;
        description: string;
        adminIds: string[];
        memberIds: string[];
        formData: StubAny;
      }) => {
        const [addAdmins, removeAdmins] = getListChanges(adminIds, defaultValues?.adminIds);
        const [addMembers, removeMembers] = getListChanges(memberIds, defaultValues?.memberIds);

        const data = {
          key: defaultValues?.key ?? null,
          ...formData,
          name,
          description,
          addAdmins,
          removeAdmins,
          addMembers,
          removeMembers,
        };

        try {
          await userGroups.saveUserGroup(data);
          onCreate?.(data);
          userGroups.invalidateGroups();
          history.push('/settings/access-permissions/user-groups');
          toaster.success('Group saved successfully');
        } catch (error) {
          toaster.error(error.response?.data);
        }
      },
      [defaultValues]
    );

    if (key && !defaultValues?.key) {
      history.push('/settings/access-permissions/user-groups');
      toaster.error('This group no longer exists or you dont have permissions to access it');
    }
    const fullDefaultValues = {
      ...defaultValues,
      memberIds:
        defaultValues.memberIds?.length > 0
          ? defaultValues.memberIds.map((member: string) => ({ value: member, label: member }))
          : [],
      adminIds:
        defaultValues.adminIds?.length > 0
          ? defaultValues.adminIds.map((member: string) => ({ value: member, label: member }))
          : [],
    };
    const isSettingsNewLayout = application.isFeatureEnabled(FeatureFlag.SettingsNewLayout);

    return (
      <AsyncBoundary>
        <FormContext
          {...props}
          form={isSettingsNewLayout ? FormLayoutV2 : Form}
          onSubmit={handleSubmit}
          defaultValues={fullDefaultValues}
          shouldUseNativeValidation
        />
      </AsyncBoundary>
    );
  })
)`
  ${Dropdown.List} {
    max-height: 55rem;
  }

  ${Combobox} {
    width: 100%;
  }

  ${Combobox},
  ${Input} {
    max-width: 100%;
    border-radius: 2rem;
  }

  ${Banner} ${BaseIcon} {
    min-width: 6rem;
  }
`;

const getListChanges = (items: StubAny[] = [], defaultItems: StubAny[] = []) => {
  const flatList = items.map(item => (typeof item === 'string' ? item : item.label));
  const added = flatList.filter(item => !defaultItems?.includes(item));
  const removed = defaultItems?.filter(item => !flatList.includes(item));
  return [added, removed];
};
