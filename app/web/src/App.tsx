import { useCallback, useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useNodesState, useEdgesState, addEdge, Position, ReactFlowProvider } from "@xyflow/react";
import { MenuBar } from "@/components/MenuBar";
import { JsonEditor } from "@/components/JsonEditor";
import { FlowCanvas } from "@/components/FlowCanvas";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {trpc} from '@/lib/trpc';
import { httpBatchLink } from '@trpc/client';
import "@xyflow/react/dist/style.css";

const queryClient = new QueryClient();
const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/trpc',
    }),
  ],
});

const nodeDefaults = {
  sourcePosition: Position.Right,
  targetPosition: Position.Left,
};

const initialNodes = [
  {
    id: "1",
    position: { x: 0, y: 150 },
    data: { label: "Object" },
    ...nodeDefaults,
  },
];

const initialEdges = [
  {
    id: "e1-2",
    source: "1",
    target: "2"
  },
];

const Flow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [jsonContent, setJsonContent] = useState('{}');

  const onConnect = useCallback(
    (params) => setEdges((els) => addEdge(params, els)),
    []
  );

  const parseJsonMutation = trpc.parseJson.useMutation({
    onSuccess: (data) => {
      setNodes(data.nodes);
      setEdges(data.edges);
    },
    onError: (error) => {
      console.error("Error parsing JSON:", error);
    }
  });

  const handleJsonParse = () => {
    parseJsonMutation.mutate(jsonContent);
  };

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
    <div className="h-screen flex flex-col">
      <MenuBar />
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={25} minSize={20}>
          <JsonEditor
            jsonContent={jsonContent}
            setJsonContent={setJsonContent}
            onParse={handleJsonParse}
          />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={75}>
          <ReactFlowProvider>
            <FlowCanvas
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
            />
          </ReactFlowProvider>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
    </QueryClientProvider>
    </trpc.Provider>
  );
};

export default Flow;
