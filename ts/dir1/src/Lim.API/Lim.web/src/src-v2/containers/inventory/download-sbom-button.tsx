import { Button } from '@src-v2/components/button-v2';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { useInject, useLoading } from '@src-v2/hooks';
import { ProfileType } from '@src-v2/types/enums/profile-type';
import { downloadFile } from '@src-v2/utils/dom-utils';

export function DownloadSBOMButton({
  profileKey,
  profileType,
}: {
  profileKey: string;
  profileType: ProfileType;
}) {
  const { analytics, profiles } = useInject();

  const [handleExport, loading] = useLoading(async () => {
    const startTime = Date.now();
    analytics.track('Export SBOM Clicked');
    const { headers, data } = await profiles.downloadProfileSBOM({ profileKey, profileType });
    const [, filename] = headers['content-disposition'].match(/filename=([^;]+);/);

    downloadFile(/^".*"$/.test(filename) ? JSON.parse(filename) : filename, JSON.stringify(data));

    analytics.track('Export SBOM Downloaded', {
      DownloadTime: (Date.now() - startTime) / 1000,
    });
  }, [profileType, profileKey]);

  return (
    <Button
      startIcon="Export"
      variant={Variant.PRIMARY}
      size={Size.LARGE}
      loading={loading}
      onClick={handleExport}>
      Export SBOM
    </Button>
  );
}
