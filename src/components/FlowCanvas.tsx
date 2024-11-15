import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useReactFlow,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  OnSelectionChangeParams,
} from "@xyflow/react";
import { useCallback, useState, useRef } from "react";

type FlowCanvasProps = {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
};

export function FlowCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
}: FlowCanvasProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(
    new Set()
  );
  const { getEdges } = useReactFlow();
  const ref = useRef<HTMLDivElement>(null);

  const findForwardNodes = useCallback(
    (nodeId: string, visited = new Set<string>()): Set<string> => {
      if (visited.has(nodeId)) return visited;
      visited.add(nodeId);

      // Only get edges where current node is the source
      const outgoingEdges = getEdges().filter((edge) => edge.source === nodeId);

      outgoingEdges.forEach((edge) => {
        findForwardNodes(edge.target, visited);
      });

      return visited;
    },
    [getEdges]
  );

  const findParentNode = useCallback(
    (nodeId: string): string | null => {
      const parentEdge = getEdges().find((edge) => edge.target === nodeId);
      return parentEdge?.source || null;
    },
    [getEdges]
  );

  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes }: OnSelectionChangeParams) => {
      const selected = selectedNodes[0]?.id || null;
      setSelectedNodeId(selected);

      if (selected) {
        const connected = findForwardNodes(selected);
        const parentId = findParentNode(selected);
        if (parentId) {
          connected.add(parentId);
        }
        setHighlightedNodes(connected);
      } else {
        setHighlightedNodes(new Set());
      }
    },
    [findForwardNodes, findParentNode]
  );

  const getNodeStyle = (node: Node) => {
    if (!selectedNodeId) return {};
    if (node.id === selectedNodeId) return { opacity: 1 };
    return {
      opacity: highlightedNodes.has(node.id) ? 1 : 0.2,
    };
  };

  const getEdgeStyle = (edge: Edge) => {
    if (!selectedNodeId) return {};
    const isInPath =
      edge.source === selectedNodeId ||
      edge.target === selectedNodeId ||
      (highlightedNodes.has(edge.source) && highlightedNodes.has(edge.target));
    return {
      stroke: isInPath ? "#ff0072" : "#b1b1b7",
      strokeWidth: isInPath ? 2 : 1,
      opacity: isInPath ? 1 : 0.2,
    };
  };

  return (
    <div className="relative w-full h-full">
      <ReactFlow
        ref={ref}
        nodes={nodes.map((node) => ({
          ...node,
          style: getNodeStyle(node),
        }))}
        edges={edges.map((edge) => ({
          ...edge,
          style: getEdgeStyle(edge),
          strokeDasharray: 5,
          animated: selectedNodeId
            ? edge.source === selectedNodeId ||
              edge.target === selectedNodeId ||
              (highlightedNodes.has(edge.source) &&
                highlightedNodes.has(edge.target))
            : false,
        }))}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
