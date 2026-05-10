import { useCallback, useState } from 'react'
import ReactFlow, {
  Background,
  Handle,
  Position,
} from 'reactflow'
import 'reactflow/dist/style.css'
import './Canvas.css'

function ClassNode({ data }) {
  const hasAttributes = data.attributes && data.attributes.length > 0
  const hasMethods = data.methods && data.methods.length > 0

  return (
    <div className="class-node" style={{ width: data.width || 260, minHeight: data.height || 200 }}>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      <div className="class-node-header">{data.label || 'ClassName'}</div>
      {hasAttributes && (
        <div className="class-node-section">
          {data.attributes.map((item, index) => (
            <div key={index} className="class-node-line">
              {item}
            </div>
          ))}
        </div>
      )}
      {hasMethods && <div className="class-node-divider" />}
      {hasMethods && (
        <div className="class-node-section">
          {data.methods.map((item, index) => (
            <div key={index} className="class-node-line">
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ShapeNode({ data, isConnectable, id, onUpdateNode }) {
  const shapeType = data.shapeType || 'rectangle'
  
  // Regular shape rendering for all types (rectangle, square, circle, textbox)
  const baseStyle = {
    width: data.width || 180,
    height: data.height || 120,
    border: '2px solid #1a1f3a',
    background: shapeType === 'textbox' ? '#f9f9f9' : '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    color: '#1a1f3a',
    borderRadius: shapeType === 'circle' ? '999px' : shapeType === 'textbox' ? '12px' : '16px',
    padding: '8px',
    textAlign: 'center',
    whiteSpace: 'pre-wrap',
    cursor: 'pointer',
  }

  return (
    <div style={baseStyle}>
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
      {data.label}
    </div>
  )
}

const nodeTypesAtModule = {
  classNode: ClassNode,
  shapeNode: ShapeNode,
}

function Canvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onEdgeClick,
  onPaneClick,
  setReactFlowInstance,
  onUpdateNode,
}) {
  const [flowInstance, setFlowInstance] = useState(null)

  const handleZoomIn = useCallback(() => {
    flowInstance?.zoomIn?.()
  }, [flowInstance])

  const handleZoomOut = useCallback(() => {
    flowInstance?.zoomOut?.()
  }, [flowInstance])

  const handleFitView = useCallback(() => {
    flowInstance?.fitView?.()
  }, [flowInstance])

  return (
    <div className="canvas-panel">
      <div className="canvas-controls">
        <div className="debug-info">
          Nodes: {nodes.length} | Edges: {edges.length}
        </div>
        <div className="zoom-controls">
          <button type="button" className="zoom-btn" onClick={handleZoomIn} title="Zoom In">
            +
          </button>
          <button type="button" className="zoom-btn" onClick={handleZoomOut} title="Zoom Out">
            −
          </button>
          <button type="button" className="zoom-btn" onClick={handleFitView} title="Fit View">
            ⟲
          </button>
        </div>
      </div>
      <div className="reactflow-wrapper">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick}
          onInit={(instance) => {
            setFlowInstance(instance)
            setReactFlowInstance?.(instance)
          }}
          nodeTypes={nodeTypesAtModule}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          minZoom={0.1}
          maxZoom={2}
          zoomOnScroll={true}
          zoomOnPinch={true}
          panOnDrag={true}
          selectionOnDrag={false}
          deleteKeyCode={['Backspace', 'Delete']}
        >
          <Background gap={16} color="#dde1f2" />
        </ReactFlow>
      </div>
    </div>
  )
}

export default Canvas
