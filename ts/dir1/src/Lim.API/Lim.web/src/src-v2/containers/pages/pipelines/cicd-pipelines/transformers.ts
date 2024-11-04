import { PipelineDependencyDeclarations } from '@src-v2/types/inventory-elements/pipeline-configuration-file-element';
import { Dependencies } from '@src-v2/types/pipelines/pipelines-types';
import { LeanConsumableProfile } from '@src-v2/types/profiles/lean-consumable-profile';

export const preparePipelineDependencyTable = (
  dependencies: Dependencies[],
  id?: string,
  relatedProfile?: Partial<LeanConsumableProfile>
) => {
  return dependencies.reduce((acc: PipelineDependencyDeclarations[], dependency) => {
    const existingPipelineDependencyEntry = acc.find(
      entry =>
        entry.codeReference.relativeFilePath === dependency.codeReference.relativeFilePath &&
        entry.version === dependency.version &&
        entry.name === dependency.name
    );
    if (existingPipelineDependencyEntry) {
      existingPipelineDependencyEntry.lines.push(dependency.codeReference.lineNumber);
    } else {
      acc.push({
        id,
        version: dependency.version,
        lines: [dependency.codeReference.lineNumber],
        codeReference: {
          relativeFilePath: dependency.codeReference.relativeFilePath,
          lastLineInFile: dependency.codeReference.lastLineInFile,
        },
        name: dependency.name,
        relatedProfile,
      });
    }
    return acc;
  }, [] as PipelineDependencyDeclarations[]);
};
