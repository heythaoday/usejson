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
import { calculateGridPosition } from "@/lib/utils";

import "@xyflow/react/dist/style.css";

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

  const handleJsonParse = useCallback(() => {
    try {
      const parsed = JSON.parse(jsonContent);
      const newNodes = [];
      const newEdges = [];
      let nodeId = 1;
      const levelCounts = new Map<number, number>();

      const processJsonNode = (obj: any, parentId: string | null = null, depth = 0, key?: string | number) => {
        const siblingIndex = levelCounts.get(depth) || 0;
        levelCounts.set(depth, siblingIndex + 1);

        if (typeof obj === "object" && obj !== null) {
          const currentId = `${nodeId}`;
          let label;
          
          if (Array.isArray(obj)) {
            label = key ? 
              `${key} (Array[${obj.length}])` : 
              `Array[${obj.length}]`;
            const position = calculateGridPosition(depth, siblingIndex);
            
            newNodes.push({
              ...nodeDefaults,
              id: currentId,
              position,
              data: { label },
            });
            nodeId++;

            if (parentId) {
              newEdges.push({
                id: `e${parentId}-${currentId}`,
                source: parentId,
                target: currentId
              });
            }

            obj.forEach((value, index) => {
              processJsonNode(value, currentId, depth + 1, index);
            });
          } else {
            label = key ? `${key} (Object)` : 'Object';
            const position = calculateGridPosition(depth, siblingIndex);
            
            newNodes.push({
              ...nodeDefaults,
              id: currentId,
              position,
              data: { label },
            });
            nodeId++;

            if (parentId) {
              newEdges.push({
                id: `e${parentId}-${currentId}`,
                source: parentId,
                target: currentId
              });
            }

            Object.entries(obj).forEach(([entryKey, value]) => {
              processJsonNode(value, currentId, depth + 1, entryKey);
            });
          }
        } else {
          const currentId = `${nodeId}`;
          const position = calculateGridPosition(depth, siblingIndex);
          
          newNodes.push({
            ...nodeDefaults,
            id: currentId,
            position,
            data: { label: key ? `${key}: ${obj}` : obj },
          });
          nodeId++;

          if (parentId) {
            newEdges.push({
              id: `e${parentId}-${currentId}`,
              source: parentId,
              target: currentId
            });
          }
        }
      };

      processJsonNode(parsed);
      setNodes(newNodes);
      setEdges(newEdges);
    } catch (error) {
      console.error("Invalid JSON:", error);
    }
  }, [jsonContent, setNodes, setEdges]);

  return (
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
  );
};

export default Flow;
