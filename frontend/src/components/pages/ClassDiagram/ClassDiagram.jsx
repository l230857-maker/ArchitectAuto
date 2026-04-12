import { useCallback, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import ReactFlow, {
  Background,
  Controls,
  Handle,
  MiniMap,
  Position,
  useEdgesState,
  useNodesState,
} from 'reactflow'
import 'reactflow/dist/style.css'
import './ClassDiagram.css'

const initialNodes = [
  {
    id: 'class-1',
    type: 'classNode',
    position: { x: 400, y: 80 },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    data: {
      label: 'ExampleClass',
      attributes: ['id: string', 'name: string', 'createdAt: Date'],
      methods: ['create()', 'update()', 'delete()'],
      width: 260,
      height: 220,
    },
  },
]

const initialEdges = []

function ClassNode({ data }) {
  return (
    <div className="class-node" style={{ width: data.width || 260, minHeight: data.height || 220 }}>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      <div className="class-node-header">{data.label || 'ClassName'}</div>
      <div className="class-node-section">
        {data.attributes && data.attributes.length
          ? data.attributes.map((item, index) => (
              <div key={index} className="class-node-line">
                {item}
              </div>
            ))
          : <div className="class-node-placeholder">Attributes</div>}
      </div>
      <div className="class-node-divider" />
      <div className="class-node-section">
        {data.methods && data.methods.length
          ? data.methods.map((item, index) => (
              <div key={index} className="class-node-line">
                {item}
              </div>
            ))
          : <div className="class-node-placeholder">Methods</div>}
      </div>
    </div>
  )
}

function ShapeNode({ data }) {
  const shapeType = data.shapeType || 'rectangle'
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
  }

  return (
    <div style={baseStyle}>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      {data.label}
    </div>
  )
}

const nodeTypes = {
  classNode: ClassNode,
  shapeNode: ShapeNode,
}

function ClassDiagram() {
  const navigate = useNavigate()
  const location = useLocation()
  const project = location.state?.project
  const from = location.state?.from || 'project-details'
  const backUrl = from === 'diagram-selector' ? '/diagram-selector' : '/project-details'
  const fileInputRef = useRef(null)
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNodeId, setSelectedNodeId] = useState(null)
  const [className, setClassName] = useState('')
  const [attributes, setAttributes] = useState('')
  const [methods, setMethods] = useState('')
  const [message, setMessage] = useState('')
  const [reactFlowInstance, setReactFlowInstance] = useState(null)
  const [mode, setMode] = useState('default')
  const [newClassName, setNewClassName] = useState('')
  const [newClassAttributes, setNewClassAttributes] = useState('')
  const [newClassMethods, setNewClassMethods] = useState('')
  const [relationSource, setRelationSource] = useState('')
  const [relationTarget, setRelationTarget] = useState('')
  const [relationLabel, setRelationLabel] = useState('association')
  const [relationCardinality, setRelationCardinality] = useState('one-to-one')

  const onConnect = useCallback((params) => {
    const newEdge = {
      id: `edge-${Date.now()}`,
      source: params.source,
      target: params.target,
      sourceHandle: params.sourceHandle,
      targetHandle: params.targetHandle,
      type: 'default',
    }
    setEdges((current) => [...current, newEdge])
  }, [setEdges])

  const handleNodeClick = useCallback(
    (event, node) => {
      setSelectedNodeId(node.id)
      setClassName(node.data.label || '')
      if (node.type === 'classNode') {
        setAttributes((node.data.attributes || []).join('\n'))
        setMethods((node.data.methods || []).join('\n'))
      } else {
        setAttributes('')
        setMethods('')
      }
      setMode('default')
    },
    [setSelectedNodeId],
  )

  const resetBuilderForms = () => {
    setNewClassName('')
    setNewClassAttributes('')
    setNewClassMethods('')
    setRelationSource('')
    setRelationTarget('')
    setRelationLabel('association')
    setRelationCardinality('one-to-one')
  }

  const addShapeNode = (shapeType) => {
    const id = `shape-${Date.now()}`
    const position = { x: 200 + Math.random() * 200, y: 150 + Math.random() * 200 }

    const newNode = {
      id,
      type: 'shapeNode',
      position,
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      data: {
        label: shapeType === 'textbox' ? 'Text Label' : shapeType === 'circle' ? 'Circle' : 'Rectangle',
        shapeType,
        width: 180,
        height: 120,
      },
      draggable: true,
    }

    setNodes((current) => [...current, newNode])
    console.log('Added node:', newNode)
  }

  const startCreateClass = () => {
    setMode('createClass')
    setSelectedNodeId(null)
    setClassName('')
    setAttributes('')
    setMethods('')
    resetBuilderForms()
  }

  const startCreateRelation = () => {
    setMode('createRelation')
    setSelectedNodeId(null)
    setClassName('')
    setAttributes('')
    setMethods('')
    setRelationSource('')
    setRelationTarget('')
    setRelationLabel('association')
    setRelationCardinality('one-to-one')
  }

  const classNodes = useMemo(() => nodes.filter((node) => node.type === 'classNode'), [nodes])

  const createClassBlock = () => {
    if (!newClassName.trim()) {
      setMessage('Class name is required to create a new class.')
      return
    }

    const attributeList = newClassAttributes
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean)
    const methodList = newClassMethods
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean)

    const id = `class-${Date.now()}`
    const newNode = {
      id,
      type: 'classNode',
      position: { x: 240 + Math.random() * 120, y: 120 + Math.random() * 120 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      data: {
        label: newClassName.trim(),
        attributes: attributeList,
        methods: methodList,
        width: 260,
        height: 220,
      },
    }

    setNodes((current) => [...current, newNode])
    setSelectedNodeId(id)
    setClassName(newClassName.trim())
    setAttributes(attributeList.join('\n'))
    setMethods(methodList.join('\n'))
    setMessage('Created a new class block on the canvas.')
    setMode('default')
    resetBuilderForms()
  }

  const createRelation = () => {
    if (!relationSource || !relationTarget) {
      setMessage('Choose two classes to connect with a relation.')
      return
    }
    if (relationSource === relationTarget) {
      setMessage('A relation requires two distinct classes.')
      return
    }

    const cardinalityText = {
      'one-to-one': '1..1',
      'one-to-many': '1..*',
      'many-to-one': '*..1',
      'many-to-many': '*..*',
    }[relationCardinality] || '1..1'

    const newEdge = {
      id: `edge-${Date.now()}`,
      source: relationSource,
      target: relationTarget,
      label: `${relationLabel.trim() || 'relation'} (${cardinalityText})`,
      type: 'default',
    }

    setEdges((current) => [...current, newEdge])
    setMode('default')
    setRelationSource('')
    setRelationTarget('')
    setRelationLabel('association')
    setRelationCardinality('one-to-one')
  }

  const handleUpdateSelectedNode = () => {
    if (!selectedNode) {
      setMessage('Select a node to update.')
      return
    }

    const attributeList = attributes
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean)
    const methodList = methods
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean)

    setNodes((current) =>
      current.map((node) =>
        node.id === selectedNodeId
          ? {
              ...node,
              data: {
                ...node.data,
                label: className.trim(),
                ...(node.type === 'classNode'
                  ? { attributes: attributeList, methods: methodList }
                  : { width: Number(node.data.width || 180), height: Number(node.data.height || 120) }),
              },
            }
          : node,
      ),
    )
  }

  const addLine = () => {
    if (nodes.length < 2) {
      setMessage('Add at least two nodes to draw a line between them.')
      return
    }

    const sourceNode = nodes[nodes.length - 2]
    const targetNode = nodes[nodes.length - 1]

    const newEdge = {
      id: `edge-${Date.now()}`,
      source: sourceNode.id,
      target: targetNode.id,
      type: 'default',
    }

    setEdges((current) => [...current, newEdge])
    setMessage('Added a simple connector line between the last two objects.')
  }

  const saveDiagram = async () => {
    const diagramBody = { project: project?.name || 'Unnamed', nodes, edges, timestamp: Date.now() }
    localStorage.setItem('classDiagramDraft', JSON.stringify(diagramBody))
    setMessage('Diagram saved locally. Backend save should be implemented separately.')

    try {
      await fetch('/api/diagrams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(diagramBody),
      })
      setMessage('Save request sent to backend.')
    } catch (error) {
      console.warn('Backend save unavailable:', error)
    }
  }

  const importDiagram = () => {
    fileInputRef.current?.click()
  }

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.name.endsWith('.svg')) {
      const svgText = await file.text()
      console.log('Imported SVG content:', svgText)
      setMessage('Imported SVG file. Rendering requires advanced backend or additional parsing logic.')
    } else {
      setMessage('Only .svg file import is supported in this demo.')
    }
  }

  const exportDiagram = () => {
    const diagramJson = JSON.stringify({ nodes, edges }, null, 2)
    const blob = new Blob([diagramJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'class-diagram.json'
    link.click()
    URL.revokeObjectURL(url)
    setMessage('Diagram exported as JSON. Backend export to SVG/PDF should be handled by a server.')
  }

  const generateCode = async () => {
    setMessage('Requesting code generation...')
    try {
      await fetch('/api/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: project?.name, nodes, edges }),
      })
      setMessage('Generate code request sent. Backend implementation required.')
    } catch (error) {
      setMessage('Code generation needs backend support.')
      console.warn(error)
    }
  }

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId),
    [nodes, selectedNodeId],
  )

  return (
    <div className="class-diagram-container">
      <header className="class-diagram-header">
        <h1>ArchitectAuto UML to Code Generator</h1>
        <div className="class-diagram-header-actions">
          <button type="button" className="action-btn" onClick={saveDiagram}>
            Save
          </button>
          <button type="button" className="action-btn" onClick={importDiagram}>
            Import
          </button>
          <button type="button" className="action-btn" onClick={exportDiagram}>
            Export
          </button>
          <button type="button" className="action-btn generate-btn" onClick={generateCode}>
            Generate Code
          </button>
          <button type="button" className="profile-icon" onClick={() => navigate('/profile')} title="Profile">
            👤
          </button>
        </div>
      </header>

      <main className="class-diagram-main">
        <aside className="tools-panel">
          <h3>Tools</h3>
          <button type="button" className="tool-btn" onClick={() => addShapeNode('rectangle')}>
            Rectangle
          </button>
          <button type="button" className="tool-btn" onClick={() => addShapeNode('circle')}>
            Circle
          </button>
          <button type="button" className="tool-btn" onClick={addLine}>
            Line
          </button>
          <button type="button" className="tool-btn" onClick={() => addShapeNode('textbox')}>
            Textbox
          </button>
          <div className="divider" />
          <button
            type="button"
            className="tool-btn"
            onClick={() => navigate(backUrl, { state: { project, from } })}
          >
            ← Back
          </button>
          <div className="project-meta">
            <p><strong>Project:</strong> {project?.name || 'New Project'}</p>
            <p><strong>Stack:</strong> {project?.stack?.toUpperCase() || 'N/A'}</p>
          </div>
        </aside>

        <div className="canvas-panel">
          <div className="canvas-controls">
            <div className="debug-info">
              Nodes: {nodes.length} | Edges: {edges.length}
            </div>
            <div className="zoom-controls">
              <button type="button" className="zoom-btn" onClick={() => reactFlowInstance?.zoomIn()} title="Zoom In">
                +
              </button>
              <button type="button" className="zoom-btn" onClick={() => reactFlowInstance?.zoomOut()} title="Zoom Out">
                −
              </button>
              <button type="button" className="zoom-btn" onClick={() => reactFlowInstance?.fitView()} title="Fit View">
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
              onNodeClick={handleNodeClick}
              onPaneClick={() => {
                setSelectedNodeId(null)
                setClassName('')
                setAttributes('')
                setMethods('')
                setMode('default')
              }}
              onInit={setReactFlowInstance}
              nodeTypes={nodeTypes}
              defaultViewport={{ x: 0, y: 0, zoom: 1 }}
              minZoom={0.1}
              maxZoom={2}
              zoomOnScroll={true}
              zoomOnPinch={true}
              panOnDrag={true}
              selectionOnDrag={false}
            >
              <Background gap={16} color="#dde1f2" />
              <Controls />
              <MiniMap nodeColor={(node) => (node.type === 'classNode' ? '#1a1f3a' : '#0077cc')} />
            </ReactFlow>
          </div>
        </div>

        <aside className="properties-panel">
          <h3>Class Diagram Builder</h3>
          <div className="properties-upper">
            <div className="panel-actions">
              <button type="button" className="tool-btn" onClick={startCreateClass}>
                Create Class
              </button>
              <button type="button" className="tool-btn" onClick={startCreateRelation}>
                Create Relation
              </button>
            </div>

            {mode === 'createClass' && (
              <div className="properties-subpanel">
                <h4>New Class</h4>
                <label>
                  Class Name
                  <input
                    type="text"
                    value={newClassName}
                    onChange={(event) => setNewClassName(event.target.value)}
                    placeholder="Order"
                  />
                </label>
                <label>
                  Attributes
                  <textarea
                    rows={4}
                    value={newClassAttributes}
                    onChange={(event) => setNewClassAttributes(event.target.value)}
                    placeholder="id: number\ncreatedAt: Date"
                  />
                </label>
                <label>
                  Methods
                  <textarea
                    rows={4}
                    value={newClassMethods}
                    onChange={(event) => setNewClassMethods(event.target.value)}
                    placeholder="save()\nvalidate()"
                  />
                </label>
                <div className="panel-actions">
                  <button type="button" className="create-update-btn" onClick={createClassBlock}>
                    Add Class
                  </button>
                  <button type="button" className="tool-btn" onClick={() => setMode('default')}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {mode === 'createRelation' && (
              <div className="properties-subpanel">
                <h4>New Relation</h4>
                <label>
                  Source Class
                  <select value={relationSource} onChange={(event) => setRelationSource(event.target.value)}>
                    <option value="">Select a class</option>
                    {classNodes.map((node) => (
                      <option key={node.id} value={node.id}>
                        {node.data.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Target Class
                  <select value={relationTarget} onChange={(event) => setRelationTarget(event.target.value)}>
                    <option value="">Select a class</option>
                    {classNodes.map((node) => (
                      <option key={node.id} value={node.id}>
                        {node.data.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Relation Type
                  <input
                    type="text"
                    value={relationLabel}
                    onChange={(event) => setRelationLabel(event.target.value)}
                    placeholder="association"
                  />
                </label>
                <label>
                  Cardinality
                  <select value={relationCardinality} onChange={(event) => setRelationCardinality(event.target.value)}>
                    <option value="one-to-one">one to one</option>
                    <option value="one-to-many">one to many</option>
                    <option value="many-to-one">many to one</option>
                    <option value="many-to-many">many to many</option>
                  </select>
                </label>
                <div className="panel-actions">
                  <button type="button" className="create-update-btn" onClick={createRelation}>
                    Add Relation
                  </button>
                  <button type="button" className="tool-btn" onClick={() => setMode('default')}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {selectedNode?.type === 'classNode' && (
              <div className="properties-subpanel">
                <h4>Edit Selected Class</h4>
                <label>
                  Class Name
                  <input
                    type="text"
                    value={className}
                    onChange={(event) => setClassName(event.target.value)}
                    placeholder="ExampleClass"
                  />
                </label>
                <label>
                  Attributes
                  <textarea
                    rows={5}
                    value={attributes}
                    onChange={(event) => setAttributes(event.target.value)}
                    placeholder="id: string\nname: string"
                  />
                </label>
                <label>
                  Methods
                  <textarea
                    rows={5}
                    value={methods}
                    onChange={(event) => setMethods(event.target.value)}
                    placeholder="create()\nupdate()"
                  />
                </label>
                <button type="button" className="create-update-btn" onClick={handleUpdateSelectedNode}>
                  Update Class
                </button>
              </div>
            )}

          </div>

          <div className="properties-lower">
            {selectedNode?.type === 'shapeNode' ? (
              <div className="properties-subpanel">
                <h4>Edit Selected Object</h4>
                <label>
                  Label
                  <input
                    type="text"
                    value={className}
                    onChange={(event) => setClassName(event.target.value)}
                    placeholder="Text Label"
                  />
                </label>
                <label>
                  Width
                  <input
                    type="number"
                    min="80"
                    value={selectedNode?.data?.width ?? 180}
                    onChange={(event) => {
                      const value = Number(event.target.value || 180)
                      setNodes((current) =>
                        current.map((node) =>
                          node.id === selectedNodeId
                            ? {
                                ...node,
                                data: {
                                  ...node.data,
                                  width: value,
                                },
                              }
                            : node,
                        ),
                      )
                    }}
                  />
                </label>
                <label>
                  Height
                  <input
                    type="number"
                    min="60"
                    value={selectedNode?.data?.height ?? 120}
                    onChange={(event) => {
                      const value = Number(event.target.value || 120)
                      setNodes((current) =>
                        current.map((node) =>
                          node.id === selectedNodeId
                            ? {
                                ...node,
                                data: {
                                  ...node.data,
                                  height: value,
                                },
                              }
                            : node,
                        ),
                      )
                    }}
                  />
                </label>
                <button type="button" className="create-update-btn" onClick={handleUpdateSelectedNode}>
                  Update Object
                </button>
              </div>
            ) : (
              <div className="properties-empty" />
            )}
          </div>

          {message && <div className="class-diagram-message">{message}</div>}
          <input ref={fileInputRef} type="file" accept=".svg" hidden onChange={handleImportFile} />
        </aside>
      </main>
    </div>
  )
}

export default ClassDiagram
