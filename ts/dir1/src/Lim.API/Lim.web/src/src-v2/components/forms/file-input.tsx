import { ReactNode, forwardRef, useCallback, useEffect } from 'react';
import { CustomInput } from '@src-v2/components/forms/custom-input';
import { useForwardRef } from '@src-v2/hooks';

interface FileInputProps {
  multiple?: boolean;
  accept?: string;
  onSelect: (file: File | File[]) => void;
  children: ReactNode;
}

export const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
  ({ multiple = false, onSelect, accept = '', ...props }, ref) => {
    const inputRef = useForwardRef(ref);
    const handleChange = useCallback(event => onSelect(event.target.files), [onSelect]);

    useEffect(() => {
      inputRef.current?.addEventListener('change', handleChange);
      return () => inputRef.current?.removeEventListener('change', handleChange);
    }, [inputRef.current, handleChange]);

    return (
      <CustomInput {...props} ref={inputRef} type="file" multiple={multiple} accept={accept} />
    );
  }
);
