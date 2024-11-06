import styled from 'styled-components';
import { TextButton } from '@src-v2/components/button-v2';
import { Circle, CircleGroup, VendorCircle } from '@src-v2/components/circles';
import { DropdownMenu } from '@src-v2/components/dropdown-menu';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { Caption1, Heading5 } from '@src-v2/components/typography';
import { useCategorizedVendors } from '@src-v2/containers/overview/tiles/connectors-header/hooks';
import { providerGroupTypeToLabel } from '@src-v2/containers/overview/tiles/connectors-header/types';

export const ConnectorsSummaryDropdown = styled(({ item, linkTo, providerTypes, ...props }) => {
  const categorizedVendors = useCategorizedVendors(item, providerTypes);
  const manageLink = linkTo.replace('/connect/', '/manage/#');

  return (
    <DropdownMenu
      variant={Variant.SECONDARY}
      size={Size.SMALL}
      placement="bottom"
      icon="ChevronDown"
      {...props}>
      <OverviewHeader>
        <Heading5>{providerGroupTypeToLabel[item.type]} overview</Heading5>
        <TextButton underline showArrow size={Size.XXSMALL} to={manageLink}>
          Manage connections
        </TextButton>
      </OverviewHeader>
      <GridContainer>
        {Object.keys(categorizedVendors).map(subType => (
          <GridItem key={subType}>
            <Caption1>{getSubTypeDisplayName(item, providerTypes, subType)}</Caption1>
            {categorizedVendors[subType].length > 0 ? (
              <CategoryConnectors vendors={categorizedVendors[subType]} />
            ) : (
              <TextButton data-no-connection to={`${linkTo}/${subType}`}>
                Not connected
              </TextButton>
            )}
          </GridItem>
        ))}
      </GridContainer>
    </DropdownMenu>
  );
})`
  ${Circle} {
    margin-bottom: 0.5rem;
  }
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 35rem);
  gap: 4rem;
  padding: 2rem;
  overflow: hidden;
  max-width: unset;

  ${Caption1} {
    color: var(--color-blue-gray-55);
    margin-bottom: 1rem;
    margin-left: 0.5rem;
  }
`;

const GridItem = styled.div`
  background: white;

  ${TextButton} {
    margin-top: 1rem;
  }

  ${CircleGroup} {
    padding: 1rem;
    display: flex;
    flex-wrap: wrap;
    -webkit-box-pack: start;
    box-sizing: border-box;
    justify-content: flex-end;
    flex-direction: row-reverse; // hack to avoid indentation of first circle after wrapping
  }
`;

const OverviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1rem;
`;

const getSubTypeDisplayName = (item, providerTypes, subTypeKey: string) => {
  for (const providerType of providerTypes) {
    if (providerType.key === item.type) {
      for (const { subType, displayName } of providerType.subTypes) {
        if (subType === subTypeKey) {
          return displayName;
        }
      }
    }
  }
};

const CategoryConnectors = styled(({ vendors, ...props }) => (
  <div {...props}>
    {[...vendors].map(vendor => (
      <VendorCircle size={Size.SMALL} name={vendor.iconName ?? vendor.key} />
    ))}
  </div>
))`
  ${Circle} {
    margin-right: 0.5rem;
  }
`;
