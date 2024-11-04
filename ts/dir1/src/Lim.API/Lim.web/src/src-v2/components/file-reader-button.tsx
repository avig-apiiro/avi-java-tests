import _ from 'lodash';
import { JSX, MouseEvent, useCallback, useRef, useState } from 'react';
import styled from 'styled-components';
import { InlineButton } from '@src-v2/components/buttons';
import { FileInput } from '@src-v2/components/forms/file-input';
import { StyledProps } from '@src-v2/types/styled';
import { readFileAsync } from '@src-v2/utils/file-utils';

type FileReaderButtonProps = {
  button?: (props: any) => JSX.Element;
  onChange: (fileContent: string, name: string) => void;
  onError?: (message: string) => void;
  fileType?: string;
};

export const FileReaderButton = styled(
  ({
    button: Button = InlineButton,
    onChange,
    fileType = '',
    onError = _.noop,
    ...props
  }: StyledProps<FileReaderButtonProps>) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [selectedFileName, setSelectedFileName] = useState();
    const handleFileSelected = useCallback(
      ([file]) =>
        file &&
        readFileAsync(file)
          .then(fileContent => {
            onChange(fileContent, file.name);
            setSelectedFileName(file.name);
          })
          .catch(onError),
      [onChange, setSelectedFileName]
    );

    const handleButtonClick = useCallback((event: MouseEvent) => {
      event.preventDefault();
      inputRef.current?.click();
    }, []);

    return (
      <FileInput ref={inputRef} onSelect={handleFileSelected} accept={fileType}>
        <Button {...props} onClick={handleButtonClick}>
          {selectedFileName ?? 'Choose File'}
        </Button>
      </FileInput>
    );
  }
)`
  font-size: var(--font-size-s);
`;
