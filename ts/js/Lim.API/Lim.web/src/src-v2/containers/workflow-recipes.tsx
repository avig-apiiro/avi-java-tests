import _ from 'lodash';
import { observer } from 'mobx-react';
import { Fragment, MouseEvent } from 'react';
import styled from 'styled-components';
import { Button } from '@src-v2/components/button-v2';
import { CardTiles } from '@src-v2/components/cards/card-containers';
import { RibbonCard } from '@src-v2/components/cards/ribbon-card';
import { VendorStack } from '@src-v2/components/circles';
import { ErrorLayout } from '@src-v2/components/layout';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { Heading } from '@src-v2/components/typography';
import { useInject, useSuspense } from '@src-v2/hooks';

type WorkflowRecipesPropsType = {
  searchTerm: string;
  onClick: (workflow: any, event: MouseEvent) => void;
  onMissingConnector: (consumables: any, event: MouseEvent) => void;
};

export const WorkflowRecipes = observer(
  ({ searchTerm, onClick, onMissingConnector, ...props }: WorkflowRecipesPropsType) => {
    const { workflows } = useInject();
    const recipeGroups = useSuspense(workflows.getWorkflowRecipes).reduce((result, recipeGroup) => {
      if (searchTerm) {
        recipeGroup = {
          ...recipeGroup,
          recipes: recipeGroup.recipes.filter(({ title }) =>
            title.toLowerCase().includes(searchTerm.toLowerCase())
          ),
        };
      }
      if (recipeGroup.recipes.length) {
        result.push(recipeGroup);
      }
      return result;
    }, []);

    const getVendors = consumables => {
      const consumableIconKeys = _.uniq(
        consumables?.map(({ consumable, providerGroup }) => providerGroup ?? consumable)
      );
      const vendors = [];
      consumableIconKeys.forEach(item => {
        vendors.push({
          key: item,
          displayName: item,
          iconName: item,
        });
      });
      return vendors;
    };

    return (
      <Container {...props}>
        {recipeGroups.length ? (
          recipeGroups.map(({ title, recipes }) => (
            <Fragment key={title}>
              <Heading>{title}</Heading>
              <CardTiles>
                {recipes.map(({ key, title, consumables, workflow }) => {
                  return (
                    <Recipe key={key ?? title}>
                      <Heading>{title}</Heading>

                      <RibbonCard.Ribbon>
                        <VendorStack vendors={getVendors(consumables)} size={Size.XLARGE} />
                        <Button
                          size={Size.LARGE}
                          variant={Variant.SECONDARY}
                          onClick={
                            consumables.every(({ providerGroup }) => providerGroup)
                              ? (event: MouseEvent) => onClick(workflow, event)
                              : (event: MouseEvent) => onMissingConnector(consumables, event)
                          }>
                          Try now
                        </Button>
                      </RibbonCard.Ribbon>
                    </Recipe>
                  );
                })}
              </CardTiles>
            </Fragment>
          ))
        ) : (
          <ErrorLayout.NoResults />
        )}
      </Container>
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
