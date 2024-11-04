import { ClampText } from '@src-v2/components/clamp-text';
import { SubHeading4 } from '@src-v2/components/typography';
import { ReleaseSide } from '@src-v2/types/releases/release';

export const ReleaseSideView = ({ side, showRef }: { side: ReleaseSide; showRef?: boolean }) => {
  return (
    <>
      <ClampText>
        {side.refType === 'Commit' ? getShortSha(side.identifier) : side.identifier}
      </ClampText>
      {showRef && <SubHeading4>({side.refType.toLowerCase()})</SubHeading4>}
    </>
  );
};

const getShortSha = (sha: string) => sha.substring(0, 7);
