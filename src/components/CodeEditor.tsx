import { FC } from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  onKeyDown?: (e: KeyboardEvent) => void;
}

export const CodeEditor: FC<CodeEditorProps> = ({ value, onChange, className }) => {
  const handleChange = (value: string | undefined) => {
    onChange(value || '');
  };

  return (
    <Editor
      height="100%"
      defaultLanguage="json"
      value={value}
      onChange={handleChange}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        wordWrap: 'on',
        formatOnPaste: true,
        formatOnType: true,
        folding: true,
        foldingStrategy: 'indentation',
      }}
      className={className}
    />
  );
};