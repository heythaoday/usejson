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

import "@xyflow/react/dist/style.css";

const nodeDefaults = {
  sourcePosition: Position.Right,
  targetPosition: Position.Left,
};

const initialNodes = [
  {
    id: "1",
    position: { x: 0, y: 150 },
    data: { label: "default style 1" },
    ...nodeDefaults,
  },
];

const initialEdges = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    animated: true,
  },
];

const Flow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [jsonContent, setJsonContent] = useState(
    '{\n  "nodes": [],\n  "edges": []\n}'
  );

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

      const processJsonNode = (obj: any, parentId: string | null = null, x = 0, y = 0, key?: string | number) => {


        if (typeof obj === "object" && obj !== null) {
          const currentId = `${nodeId}`;
          let label;
          
          if (Array.isArray(obj)) {
            label = key ? 
              `${key} (Array[${obj.length}])` : 
              `Array[${obj.length}]`;
            
            // For arrays, we don't process the items
            newNodes.push({
              ...nodeDefaults,
              id: currentId,
              position: { x, y },
              data: { label },
            });
            nodeId++;

            if (parentId) {
              newEdges.push({
                id: `e${parentId}-${currentId}`,
                source: parentId,
                target: currentId,
                animated: true,
              });
            }
          } else {
            // For objects, continue as before
            label = key ? `${key} (Object)` : 'Object';
            newNodes.push({
              ...nodeDefaults,
              id: currentId,
              position: { x, y },
              data: { label },
            });
            nodeId++;

            if (parentId) {
              newEdges.push({
                id: `e${parentId}-${currentId}`,
                source: parentId,
                target: currentId,
                animated: true,
              });
            }

            // Only process children for objects, not arrays
            Object.entries(obj).forEach(([entryKey, value], index) => {
              processJsonNode(value, currentId, x + 200, y + index * 100, entryKey);
            });
          }
        }

        if (typeof obj === "string" || typeof obj === "number" || typeof obj === "boolean") {
          const currentId = `${nodeId}`;
          newNodes.push({
            ...nodeDefaults,
            id: currentId,
            position: { x, y },
            data: { label: key ? `${key}: ${obj}` : obj },
          });
          nodeId++;

          if (parentId) {
            newEdges.push({
              id: `e${parentId}-${currentId}`,
              source: parentId,
              target: currentId,
              animated: true,
            });
          }
          return;
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
