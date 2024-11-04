import { useCallback } from 'react';
import styled from 'styled-components';
import { LogoSpinner } from '@src-v2/components/animations/spinner';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { Dropdown } from '@src-v2/components/dropdown';
import { FormContext } from '@src-v2/components/forms/form-context';
import { Form } from '@src-v2/components/forms/form-layout';
import { useInject } from '@src-v2/hooks';
import { useBreadcrumbs } from '@src-v2/hooks/use-breadcrumbs';
import { StubAny } from '@src-v2/types/stub-any';
import { StyledProps } from '@src-v2/types/styled';

type TeamFormProps = { onSubmit?: (data: any) => Promise<void>; defaultValues?: any };

export const TeamForm = styled(
  ({ defaultValues, onSubmit, children }: StyledProps & TeamFormProps) => {
    const { contributors: contributorsService, toaster, history } = useInject();

    const handleSubmit = useCallback(
      async ({
        contributors,
        provider,
        providerGroup,
        teamType,
        pointsOfContact,
        ...formData
      }: {
        contributors: StubAny[] | null;
        provider: StubAny;
        providerGroup: StubAny;
        teamType: StubAny;
        pointsOfContact: StubAny[];
        formData: StubAny;
      }) => {
        const data = {
          ...formData,
          contributorKeys: contributors?.map(contributor => contributor.identityKey),
          providerUrl: provider?.value,
          groupId: providerGroup?.value,
          groupName: providerGroup?.label,
          teamType: teamType.value,
          pointsOfContact: pointsOfContact.flatMap(({ developer, jobTitle }) =>
            developer.map((item: StubAny) => ({ ...item, jobTitle: jobTitle.value ?? jobTitle }))
          ),
        };
        try {
          await contributorsService.createTeam(data);
          onSubmit?.(data);
          history.push('/users/teams');
        } catch (e) {
          toaster.error('Failed to create team');
        }
      },
      []
    );

    useBreadcrumbs({ breadcrumbs: [{ label: 'Create team', to: '/users/teams/create' }] });

    return (
      <AsyncBoundary>
        <FormContext
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          shouldUseNativeValidation>
          {children}
        </FormContext>
      </AsyncBoundary>
    );
  }
)`
  ${Dropdown.List} {
    max-height: 55rem;
  }

  ${LogoSpinner} {
    width: 4rem;
    height: 4rem;
  }

  ${Form.LabelCell} {
    height: 9rem;
  }
`;
