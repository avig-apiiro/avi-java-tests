import { IconButton } from '@src-v2/components/buttons';
import { Dropdown } from '@src-v2/components/dropdown';
import { DropdownMenu } from '@src-v2/components/dropdown-menu';
import { ReportDataIssueModal } from '@src-v2/containers/modals/report-data-issue-modal';
import { useToggle } from '@src-v2/hooks';
import { stopPropagation } from '@src-v2/utils/dom-utils';

export const InventoryRowActions = ({ data, ...props }: { data: any }) => {
  const [showReportDataModal, reportDataModalToggle] = useToggle();

  return (
    <>
      <DropdownMenu {...props} onClick={stopPropagation} onItemClick={stopPropagation}>
        <Dropdown.Group title="Take action">
          <Dropdown.Item
            onClick={event => {
              event.stopPropagation();
              reportDataModalToggle();
            }}>
            <IconButton name="Report" />
            Report data issue
          </Dropdown.Item>
        </Dropdown.Group>
      </DropdownMenu>
      {showReportDataModal && (
        <ReportDataIssueModal onClose={reportDataModalToggle} row={{ cells: [] }} headers={[]} />
      )}
    </>
  );
};
