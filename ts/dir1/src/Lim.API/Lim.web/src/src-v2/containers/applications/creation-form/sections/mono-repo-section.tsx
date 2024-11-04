import { useCallback, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import styled from 'styled-components';
import { DragHandle } from '@src-v2/components/drag-handle';
import { SelectControlV2 } from '@src-v2/components/forms/form-controls';
import { FormLayoutV2 } from '@src-v2/components/forms/form-layout-v2';
import { VendorIcon } from '@src-v2/components/icons';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { Heading3, Heading5, SubHeading3 } from '@src-v2/components/typography';
import { ModulesTreeBoxControl } from '@src-v2/containers/applications/creation-form/sections/modules-tree-box-control';
import { useInject } from '@src-v2/hooks';
import { useMouseDrag } from '@src-v2/hooks/dom-events/use-mouse-drag';
import { HierarchicalRecord } from '@src-v2/models/hierarchy-nodes-tree';
import { Provider } from '@src-v2/types/enums/provider';
import { CodeModule } from '@src-v2/types/profiles/code-module';
import { toRem } from '@src-v2/utils/style-utils';

export type MonoRepo = {
  key: string;
  name: string;
  referenceName: string;
  provider: Provider;
  modules: CodeModule[];
};

export type HierarchicalCodeModule = HierarchicalRecord & CodeModule;

export const MonoRepoSection = () => {
  const { repositoryProfiles } = useInject();
  const { setValue, watch } = useFormContext();

  const modulesCardRef = useRef<HTMLDivElement>();
  const [modulesCardHeight, setModulesCardHeight] = useState<number>();
  const onMouseDown = useMouseDrag(moveEvent =>
    setModulesCardHeight(
      Math.max(
        toRem(
          moveEvent.clientY - modulesCardRef.current.getBoundingClientRect().top,
          false
        ) as number,
        90
      )
    )
  );

  const modulesRepository = watch('modulesRepository');

  const handleRepositoryChanged = useCallback(() => {
    setValue('modules', []);
  }, []);

  return (
    <FormLayoutV2.Section>
      <HeadingsContainer>
        <Heading3>Module selection</Heading3>
        <SubHeading3 data-variant={Variant.SECONDARY}>
          Select from the available repository modules to include them in your application
        </SubHeading3>
      </HeadingsContainer>

      <ModulesSelectorContainer>
        <FormLayoutV2.Label required>
          <Heading5>Repository</Heading5>
          <SelectControlV2
            name="modulesRepository"
            rules={{ required: true }}
            placeholder="Select a repository..."
            searchMethod={repositoryProfiles.searchProfiles}
            option={({ data }: { data: MonoRepo }) => (
              <>
                <VendorIcon name={data.provider} /> {data.name} ({data.referenceName})
              </>
            )}
            onChange={handleRepositoryChanged}
          />
        </FormLayoutV2.Label>
        <ModulesTreeBoxControl
          ref={modulesCardRef}
          height={modulesCardHeight}
          repository={modulesRepository}
        />
      </ModulesSelectorContainer>
      <DragHandle onMouseDown={onMouseDown} />
    </FormLayoutV2.Section>
  );
};

const HeadingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ModulesSelectorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;
