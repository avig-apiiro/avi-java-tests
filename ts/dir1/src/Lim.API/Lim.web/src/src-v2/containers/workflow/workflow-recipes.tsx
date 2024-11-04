import _ from 'lodash';
import { observer } from 'mobx-react';
import { Fragment, useCallback, useState } from 'react';
import styled from 'styled-components';
import { Button } from '@src-v2/components/button-v2';
import { CardTiles } from '@src-v2/components/cards/card-containers';
import { RibbonCard } from '@src-v2/components/cards/ribbon-card';
import { Vendor, VendorStack } from '@src-v2/components/circles';
import { ConfirmationModal } from '@src-v2/components/confirmation-modal';
import { VendorIcon } from '@src-v2/components/icons';
import { ErrorLayout } from '@src-v2/components/layout';
import { Size } from '@src-v2/components/types/enums/size';
import { Heading, Paragraph, Strong } from '@src-v2/components/typography';
import { consumablesMap } from '@src-v2/containers/workflow/types/workflow-type-mappings';
import { useInject, useSuspense } from '@src-v2/hooks';
import { StubAny } from '@src-v2/types/stub-any';

export const WorkflowRecipes = observer(
  ({ searchTerm, onRecipeSelect, ...props }: { searchTerm: string; onRecipeSelect: StubAny }) => {
    const { workflows, history } = useInject();
    const [missingConnector, setMissingConnector] = useState(null);
    const recipeGroups = useSuspense(workflows.getWorkflowRecipes).reduce((result, recipeGroup) => {
      if (searchTerm) {
        recipeGroup = {
          ...recipeGroup,
          recipes: recipeGroup.recipes.filter(({ title }: { title: string }) =>
            title.toLowerCase().includes(searchTerm.toLowerCase())
          ),
        };
      }
      if (recipeGroup.recipes.length) {
        result.push(recipeGroup);
      }
      return result;
    }, []);

    const handleMissingConnector = useCallback((consumables: StubAny[]) => {
      const missingConsumable = consumables
        .filter(({ providerGroup }) => !providerGroup)
        .map(({ consumable }) => consumable)
        .shift();

      setMissingConnector({
        icon: missingConsumable,
        ...consumablesMap[missingConsumable as keyof typeof consumablesMap],
      });
    }, []);

    const getVendors = (consumables: StubAny[]) => {
      const consumableIconKeys = _.uniq(
        consumables?.map(({ consumable, providerGroup }) => providerGroup ?? consumable)
      );
      const vendors: Vendor[] = [];
      consumableIconKeys.forEach(item => {
        vendors.push({
          key: item as string,
          displayName: item as string,
          iconName: item as string,
        });
      });
      return vendors;
    };

    return (
      <>
        <Container {...props}>
          {recipeGroups.length ? (
            recipeGroups.map(({ title, recipes }: { title: string; recipes: StubAny[] }) => (
              <Fragment key={title}>
                <Heading>{title}</Heading>
                <CardTiles>
                  {recipes.map(
                    ({
                      key,
                      title,
                      consumables,
                      workflow,
                    }: {
                      key: string;
                      title: string;
                      consumables: StubAny[];
                      workflow: StubAny;
                    }) => {
                      return (
                        <Recipe key={key ?? title}>
                          <Heading>{title}</Heading>
                          <RibbonCard.Ribbon>
                            <VendorStack vendors={getVendors(consumables)} size={Size.XLARGE} />
                            <Button
                              onClick={
                                consumables.every(({ providerGroup }) => providerGroup)
                                  ? (event: StubAny) => onRecipeSelect(workflow, event)
                                  : () => handleMissingConnector(consumables)
                              }>
                              Try now
                            </Button>
                          </RibbonCard.Ribbon>
                        </Recipe>
                      );
                    }
                  )}
                </CardTiles>
              </Fragment>
            ))
          ) : (
            <ErrorLayout.NoResults />
          )}
        </Container>
        {missingConnector && (
          <ConfirmationModal
            onError={null}
            title={
              <>
                <VendorIcon name={missingConnector.icon} />
                {missingConnector.title} connector required
              </>
            }
            submitText="Continue"
            onSubmit={() => history.push(`/connectors/connect/${missingConnector.path}`)}
            onClose={() => setMissingConnector(null)}>
            <Paragraph>
              This workflow requires a <Strong>{missingConnector.title}</Strong> connector.
            </Paragraph>
            <Paragraph>
              Click continue to view your connectors page and complete this process.
            </Paragraph>
          </ConfirmationModal>
        )}
      </>
    );
  }
);

const Container = styled.div`
  padding-bottom: 15rem;

  > ${Heading} {
    margin-top: 15rem;
    margin-bottom: 6rem;
    font-size: var(--font-size-xl);
    font-weight: 700;

    &:first-of-type {
      margin-top: 0;
    }
  }
`;

const Recipe = styled(RibbonCard)`
  min-height: 50rem;

  ${Heading} {
    font-size: var(--font-size-l);
    font-weight: 400;
  }
`;
