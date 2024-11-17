import { Button } from "@/components/ui/button";
import { CodeEditor } from "@/components/CodeEditor";

interface JsonEditorProps {
  jsonContent: string;
  setJsonContent: (content: string) => void;
  onParse: () => void;
}

export function JsonEditor({ jsonContent, setJsonContent, onParse }: JsonEditorProps) {
  return (
    <div className="h-full p-4 flex flex-col gap-4">
      <CodeEditor
        value={jsonContent}
        onChange={setJsonContent}
        className="flex-1"
      />
      <Button onClick={onParse}>Parse JSON</Button>
    </div>
  );
}