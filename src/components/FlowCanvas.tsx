import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useReactFlow,
} from "@xyflow/react";
import { useCallback, useState, useRef } from "react";
import NodeContextMenu from "./NodeContextMenu";

interface FlowCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: any;
  onEdgesChange: any;
  onConnect: any;
}

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
  const [menu, setMenu] = useState(null);
  const ref = useRef(null);

  const findForwardNodes = useCallback(
    (nodeId: string, visited = new Set<string>()) => {
      if (visited.has(nodeId)) return;
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

  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes }) => {
      const selected = selectedNodes[0]?.id || null;
      setSelectedNodeId(selected);

      if (selected) {
        const connected = findForwardNodes(selected) || new Set();
        setHighlightedNodes(connected);
      } else {
        setHighlightedNodes(new Set());
      }
    },
    [findForwardNodes]
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
      (highlightedNodes.has(edge.source) && highlightedNodes.has(edge.target));
    return {
      stroke: isInPath ? "#ff0072" : "#b1b1b7",
      strokeWidth: isInPath ? 2 : 1,
      opacity: isInPath ? 1 : 0.2,
    };
  };

  const onNodeContextMenu = useCallback(
    (event, node) => {
      // Prevent native context menu from showing
      event.preventDefault();

      // Calculate position of the context menu. We want to make sure it
      // doesn't get positioned off-screen.
      const pane = ref.current.getBoundingClientRect();
      setMenu({
        id: node.id,
        top: event.clientY < pane.height - 200 && event.clientY,
        left: event.clientX < pane.width - 200 && event.clientX,
        right: event.clientX >= pane.width - 200 && pane.width - event.clientX,
        bottom:
          event.clientY >= pane.height - 200 && pane.height - event.clientY,
      });
    },
    [setMenu]
  );

  // Close the context menu if it's open whenever the window is clicked.
  const onPaneClick = useCallback(() => setMenu(null), [setMenu]);
  return (
    <ReactFlow
      ref={ref}
      nodes={nodes.map((node) => ({
        ...node,
        style: getNodeStyle(node),
      }))}
      edges={edges.map((edge) => ({
        ...edge,
        style: getEdgeStyle(edge),
      }))}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onSelectionChange={onSelectionChange}
      fitView
      onNodeContextMenu={onNodeContextMenu}
      onPaneClick={onPaneClick}
    >
      <Background />
      <Controls />
      <MiniMap />
      {menu && <NodeContextMenu onClick={onPaneClick} {...menu} />}
    </ReactFlow>
  );
}
