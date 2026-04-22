import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Position, useEdgesState, useNodesState } from 'reactflow'
import Canvas from '../../Canvas/Canvas'
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

    if (!className.trim() || attributeList.length === 0) {
      setMessage('Class name and attributes are required.')
      return
    }

    setNodes((current) =>
      current.map((node) =>
        node.id === selectedNodeId
          ? {
              ...node,
              data: {
                ...node.data,
                label: className.trim(),
                attributes: attributeList,
                methods: methodList,
              },
            }
          : node,
      ),
    )
    setMessage('Class updated successfully.')
  }

  const createClassBlock = () => {
    const attributeList = newClassAttributes
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean)
    const methodList = newClassMethods
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean)

    if (!newClassName.trim() || attributeList.length === 0) {
      setMessage('Class name and attributes are required to create a new class.')
      return
    }

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

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Delete' && selectedNodeId) {
        deleteSelectedNode()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedNodeId, nodes, edges])

  const deleteSelectedNode = () => {
    if (!selectedNodeId) {
      setMessage('Select a class to delete.')
      return
    }

    // Remove the node
    setNodes((current) => current.filter((node) => node.id !== selectedNodeId))

    // Remove all edges connected to this node
    setEdges((current) =>
      current.filter((edge) => edge.source !== selectedNodeId && edge.target !== selectedNodeId),
    )

    // Clear selection
    setSelectedNodeId(null)
    setClassName('')
    setAttributes('')
    setMethods('')
    setMessage('Class deleted successfully.')
  }

  return (
    <div className="class-diagram-container">
      <header className="class-diagram-header">
        <div className="header-left">
          <button
            type="button"
            className="header-back-btn"
            onClick={() => navigate(backUrl, { state: { project, from } })}
            title="Back"
          >
            ←
          </button>
          <h1>ArchitectAuto</h1>
        </div>
        <div className="header-center">
          <span className="project-info"><strong>{project?.name || 'New Project'}</strong></span>
          <span className="divider">•</span>
          <span className="stack-info">{project?.stack?.toUpperCase() || 'N/A'}</span>
        </div>
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
        <Canvas
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
          setReactFlowInstance={setReactFlowInstance}
        />

        <aside className="properties-panel">
          <div className="properties-panel-header">
            <h3>Class Diagram Builder</h3>
            <div className="panel-mode-indicator">
              <button
                type="button"
                className={`mode-pill ${mode === 'createClass' ? 'active' : ''}`}
                onClick={startCreateClass}
              >
                <span className="panel-icon">➕</span>
                Create Class
              </button>
              <button
                type="button"
                className={`mode-pill ${mode === 'createRelation' ? 'active' : ''}`}
                onClick={startCreateRelation}
              >
                <span className="panel-icon">⛓️</span>
                Create Relation
              </button>
            </div>
            {message && <div className="class-diagram-message">{message}</div>}
          </div>
          <div className="properties-upper">

            {mode === 'createClass' && (
              <div className="properties-subpanel">
                <h4>New Class</h4>
                <label>
                  Class Name <span className="required-tag">*</span>
                  <input
                    type="text"
                    value={newClassName}
                    onChange={(event) => setNewClassName(event.target.value)}
                    placeholder="Order"
                    required
                  />
                </label>
                <label>
                  Attributes <span className="required-tag">*</span>
                  <textarea
                    rows={1}
                    value={newClassAttributes}
                    onChange={(event) => setNewClassAttributes(event.target.value)}
                    placeholder="id: number"
                    required
                  />
                </label>
                <label>
                  Methods
                  <textarea
                    rows={1}
                    value={newClassMethods}
                    onChange={(event) => setNewClassMethods(event.target.value)}
                    placeholder="save()"
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
                    {classNodes
                      .filter((node) => node.id !== relationTarget)
                      .map((node) => (
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
                    {classNodes
                      .filter((node) => node.id !== relationSource)
                      .map((node) => (
                        <option key={node.id} value={node.id}>
                          {node.data.label}
                        </option>
                      ))}
                  </select>
                </label>
                <label>
                  Relation Name
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
                  Class Name <span className="required-tag">*</span>
                  <input
                    type="text"
                    value={className}
                    onChange={(event) => setClassName(event.target.value)}
                    placeholder="ExampleClass"
                    required
                  />
                </label>
                <label>
                  Attributes <span className="required-tag">*</span>
                  <textarea
                    rows={2}
                    value={attributes}
                    onChange={(event) => setAttributes(event.target.value)}
                    placeholder="id: string"
                    required
                  />
                </label>
                <label>
                  Methods
                  <textarea
                    rows={2}
                    value={methods}
                    onChange={(event) => setMethods(event.target.value)}
                    placeholder="create()"
                  />
                </label>
                <button type="button" className="create-update-btn" onClick={handleUpdateSelectedNode}>
                  Update Class
                </button>
                <button type="button" className="delete-btn" onClick={deleteSelectedNode}>
                  Delete Class
                </button>
              </div>
            )}

          </div>

          <input ref={fileInputRef} type="file" accept=".svg" hidden onChange={handleImportFile} />
        </aside>
      </main>
    </div>
  )
}

export default ClassDiagram
