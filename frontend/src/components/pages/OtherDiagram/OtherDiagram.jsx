import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useEdgesState, useNodesState } from 'reactflow'
import Canvas from '../../Canvas/Canvas'
import './OtherDiagram.css'
import { API_BASE_URL } from '../../../lib/api'

const initialNodes = []
const initialEdges = []

const SHAPE_TOOLS = [
  { id: 'rectangle', label: 'Rectangle', icon: '▭' },
  { id: 'square', label: 'Square', icon: '□' },
  { id: 'circle', label: 'Circle', icon: '●' },
  { id: 'textbox', label: 'Text', icon: 'A' },
]

const SIZE_LIMITS = {
  MIN_WIDTH: 30,
  MAX_WIDTH: 800,
  MIN_HEIGHT: 30,
  MAX_HEIGHT: 800,
}

function OtherDiagram() {
  const navigate = useNavigate()
  const location = useLocation()
  const project = location.state?.project
  const diagram = location.state?.diagram
  const diagramType = location.state?.diagramType || 'activity'
  const [enrichedProject, setEnrichedProject] = useState(project)

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNodeId, setSelectedNodeId] = useState(null)
  const [selectedEdgeId, setSelectedEdgeId] = useState(null)
  const [message, setMessage] = useState('')
  const [editLabel, setEditLabel] = useState('')
  const [editWidth, setEditWidth] = useState(120)
  const [editHeight, setEditHeight] = useState(80)
  const [edgeLabel, setEdgeLabel] = useState('')
  const [edgeWidth, setEdgeWidth] = useState(2)

  // Helper function to clamp values within limits
  const clampDimension = (value, min, max) => {
    return Math.max(min, Math.min(max, value))
  }

  // Handle width input - remove leading zeros, accept any whole number
  const handleWidthChange = (e) => {
    let value = e.target.value
    
    // If empty, allow it (user might be deleting)
    if (value === '') {
      setEditWidth('')
      return
    }
    
    // Parse as integer to remove leading zeros
    const numValue = parseInt(value, 10)
    
    // Only update if it's a valid number
    if (!isNaN(numValue)) {
      setEditWidth(numValue)
    }
  }

  // Handle height input - remove leading zeros, accept any whole number
  const handleHeightChange = (e) => {
    let value = e.target.value
    
    // If empty, allow it (user might be deleting)
    if (value === '') {
      setEditHeight('')
      return
    }
    
    // Parse as integer to remove leading zeros
    const numValue = parseInt(value, 10)
    
    // Only update if it's a valid number
    if (!isNaN(numValue)) {
      setEditHeight(numValue)
    }
  }

  // Fetch full project data if stack_name is missing
  useEffect(() => {
    if (project && !project.stack_name && project.id) {
      const fetchProjectData = async () => {
        try {
          const session = localStorage.getItem('architectauto-auth')
          if (!session) return
          const { token } = JSON.parse(session)
          
          const response = await fetch(`${API_BASE_URL}/projects/${project.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          
          if (response.ok) {
            const data = await response.json()
            setEnrichedProject(data.data)
          }
        } catch (error) {
          console.warn('Failed to fetch project data:', error)
        }
      }
      
      fetchProjectData()
    } else if (project?.stack_name) {
      // If project already has stack_name, use it directly
      setEnrichedProject(project)
    }
  }, [project])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedNodeId, nodes, edges, enrichedProject])

  // Load diagram data from state when component mounts
  useEffect(() => {
    if (diagram?.visualLayout) {
      setNodes(diagram.visualLayout.nodes || [])
      setEdges(diagram.visualLayout.edges || [])
    }
  }, [diagram, setNodes, setEdges])

  useEffect(() => {
    if (selectedNodeId) {
      const selectedNode = nodes.find((n) => n.id === selectedNodeId)
      if (selectedNode) {
        setEditLabel(selectedNode.data.label || '')
        setEditWidth(selectedNode.data.width || 120)
        setEditHeight(selectedNode.data.height || 80)
      }
    }
  }, [selectedNodeId, nodes])

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
      // Update the nodes array to set selected state
      setNodes((current) =>
        current.map((n) =>
          n.id === node.id ? { ...n, selected: true } : { ...n, selected: false }
        )
      )
      
      setSelectedNodeId(node.id)
      setSelectedEdgeId(null)
      setEditLabel(node.data.label || '')
      setEditWidth(node.data.width || 120)
      setEditHeight(node.data.height || 80)
    },
    [setNodes]
  )

  const updateShapeProperties = () => {
    if (!selectedNodeId) return
    
    // Handle empty values - use previous defaults
    const finalWidth = editWidth === '' ? 120 : editWidth
    const finalHeight = editHeight === '' ? 80 : editHeight
    
    // Clamp width and height to limits
    const clampedWidth = clampDimension(finalWidth, SIZE_LIMITS.MIN_WIDTH, SIZE_LIMITS.MAX_WIDTH)
    const clampedHeight = clampDimension(finalHeight, SIZE_LIMITS.MIN_HEIGHT, SIZE_LIMITS.MAX_HEIGHT)
    
    // Update state to show clamped values
    setEditWidth(clampedWidth)
    setEditHeight(clampedHeight)
    
    setNodes((current) =>
      current.map((node) =>
        node.id === selectedNodeId
          ? {
              ...node,
              data: {
                ...node.data,
                label: editLabel,
                width: clampedWidth,
                height: clampedHeight,
              },
            }
          : node
      )
    )
    setMessage('✓ Shape updated')
    setTimeout(() => setMessage(''), 2000)
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Delete' && selectedNodeId) {
      deleteSelectedNode()
    }
    // Handle Ctrl+S to save diagram
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault()
      saveDiagram()
    }
  }

  const onUpdateNode = (nodeId, updates) => {
    setNodes((current) =>
      current.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                ...updates,
              },
            }
          : node
      )
    )
  }

  const handleEdgeClick = (event, edge) => {
    event.stopPropagation()
    setSelectedNodeId(null)
    setSelectedEdgeId(edge.id)
    setEdgeLabel(edge.label || '')
    setEdgeWidth(edge.data?.width || 2)
  }

  const updateEdgeProperties = () => {
    if (!selectedEdgeId) return
    setEdges((current) =>
      current.map((edge) =>
        edge.id === selectedEdgeId
          ? {
              ...edge,
              label: edgeLabel,
              data: {
                ...edge.data,
                width: edgeWidth,
              },
            }
          : edge
      )
    )
    setMessage('✓ Connection updated')
    setTimeout(() => setMessage(''), 2000)
  }

  const deleteSelectedEdge = () => {
    if (!selectedEdgeId) return
    setEdges((current) => current.filter((edge) => edge.id !== selectedEdgeId))
    setSelectedEdgeId(null)
    setMessage('Connection deleted')
    setTimeout(() => setMessage(''), 2000)
  }

  const addShape = (shapeType) => {
    const id = `shape-${Date.now()}`
    let width = 120
    let height = 80

    // Determine dimensions based on shape type
    if (shapeType === 'square') {
      width = 100
      height = 100
    } else if (shapeType === 'circle') {
      width = 80
      height = 80
    } else if (shapeType === 'textbox') {
      width = 150
      height = 40
    }

    const label = shapeType.charAt(0).toUpperCase() + shapeType.slice(1)
    const newNode = {
      id,
      type: 'shapeNode',
      position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
      selected: true,
      data: {
        label,
        shapeType,
        width,
        height,
      },
    }

    // Deselect all existing nodes and add the new one as selected
    setNodes((current) => [
      ...current.map((node) => ({ ...node, selected: false })),
      newNode,
    ])
    setSelectedNodeId(id)
    setSelectedEdgeId(null)
    setEditLabel(label)
    setEditWidth(width)
    setEditHeight(height)
    setMessage(`✓ ${shapeType} added`)
    setTimeout(() => setMessage(''), 2000)
  }

  const deleteSelectedNode = () => {
    if (!selectedNodeId) return
    setNodes((current) => current.filter((node) => node.id !== selectedNodeId))
    setEdges((current) =>
      current.filter(
        (edge) => edge.source !== selectedNodeId && edge.target !== selectedNodeId
      )
    )
    setSelectedNodeId(null)
    setMessage('Shape deleted')
    setTimeout(() => setMessage(''), 2000)
  }

  // Save diagram functionality
  const saveDiagram = async () => {
    if (!project?.id) {
      setMessage('Project not found. Please return to project details.')
      return
    }

    try {
      setMessage('Saving diagram...')

      const session = JSON.parse(localStorage.getItem('architectauto-auth') || '{}')
      const token = session.token

      if (!token) {
        setMessage('Authentication required. Please login again.')
        navigate('/signin')
        return
      }

      // Build the save payload
      const visualLayout = { nodes, edges }

      const payload = {
        name: diagram?.name || project.name,
        diagramType,
        visualLayout,
      }

      const response = await fetch(
        `${API_BASE_URL}/projects/${project.id}/other-diagrams/${diagram?.id || ''}`,
        {
          method: diagram?.id ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.message || 'Failed to save diagram')
        return
      }

      setMessage('✓ Diagram saved successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error saving diagram:', error)
      setMessage('An error occurred while saving the diagram')
    }
  }

  // Export diagram functionality
  const exportDiagram = async () => {
    setMessage('Preparing export options...')

    const format = prompt('Export format? (svg/png/pdf)', 'svg')?.toLowerCase()

    if (!format || !['svg', 'png', 'pdf'].includes(format)) {
      setMessage('Export cancelled or invalid format.')
      return
    }

    try {
      if (format === 'svg') {
        exportAsSVG()
      } else if (format === 'png') {
        await exportAsPNG()
      } else if (format === 'pdf') {
        await exportAsPDF()
      }
    } catch (error) {
      console.error('Export error:', error)
      setMessage('Failed to export diagram')
    }
  }

  // Generate SVG content for export
  const generateSVGContent = () => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

    nodes.forEach((node) => {
      if (node.type === 'shapeNode') {
        const x = node.position.x
        const y = node.position.y
        const width = node.data.width || 120
        const height = node.data.height || 80

        minX = Math.min(minX, x)
        minY = Math.min(minY, y)
        maxX = Math.max(maxX, x + width)
        maxY = Math.max(maxY, y + height)
      }
    })

    const padding = 40
    minX -= padding
    minY -= padding
    maxX += padding
    maxY += padding

    const viewWidth = maxX - minX
    const viewHeight = maxY - minY

    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${viewWidth} ${viewHeight}" width="${viewWidth}" height="${viewHeight}">
      <defs>
        <style>
          .shape-rect { fill: white; stroke: #0066cc; stroke-width: 2; }
          .shape-circle { fill: white; stroke: #0066cc; stroke-width: 2; }
          .shape-text { font-size: 14px; fill: #0f172a; font-family: Arial, sans-serif; }
          .shape-label { font-size: 12px; fill: #0f172a; font-family: Arial, sans-serif; text-anchor: middle; }
          .edge-line { stroke: #666; stroke-width: 2; fill: none; }
          .edge-label { font-size: 11px; fill: #666; font-family: Arial, sans-serif; }
        </style>
      </defs>
      <rect x="${minX}" y="${minY}" width="${viewWidth}" height="${viewHeight}" fill="#fafafa"/>`

    // Add nodes (shapes)
    nodes.forEach((node) => {
      if (node.type === 'shapeNode') {
        const x = node.position.x
        const y = node.position.y
        const width = node.data.width || 120
        const height = node.data.height || 80
        const label = node.data.label || 'Shape'
        const shapeType = node.data.shapeType

        if (shapeType === 'circle') {
          const cx = x + width / 2
          const cy = y + height / 2
          const radius = Math.min(width, height) / 2
          svgContent += `<circle cx="${cx}" cy="${cy}" r="${radius}" class="shape-circle"/>`
          svgContent += `<text x="${cx}" y="${cy + 4}" class="shape-label">${escapeXml(label)}</text>`
        } else if (shapeType === 'textbox') {
          svgContent += `<rect x="${x}" y="${y}" width="${width}" height="${height}" class="shape-rect" rx="4"/>`
          svgContent += `<text x="${x + width / 2}" y="${y + height / 2 + 4}" class="shape-label">${escapeXml(label)}</text>`
        } else {
          // Rectangle or Square
          svgContent += `<rect x="${x}" y="${y}" width="${width}" height="${height}" class="shape-rect" rx="4"/>`
          svgContent += `<text x="${x + width / 2}" y="${y + height / 2 + 4}" class="shape-label">${escapeXml(label)}</text>`
        }
      }
    })

    // Add edges (connections)
    svgContent += `<defs>
      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
      </marker>
    </defs>`

    edges.forEach((edge) => {
      const sourceNode = nodes.find((n) => n.id === edge.source)
      const targetNode = nodes.find((n) => n.id === edge.target)

      if (sourceNode && targetNode && sourceNode.type === 'shapeNode' && targetNode.type === 'shapeNode') {
        const sx = sourceNode.position.x
        const sy = sourceNode.position.y
        const sw = sourceNode.data.width || 120
        const sh = sourceNode.data.height || 80

        const tx = targetNode.position.x
        const ty = targetNode.position.y
        const tw = targetNode.data.width || 120
        const th = targetNode.data.height || 80

        const sourceCenter = { x: sx + sw / 2, y: sy + sh / 2 }
        const targetCenter = { x: tx + tw / 2, y: ty + th / 2 }

        let x1 = sx + sw / 2
        let y1 = sy + sh / 2

        let x2 = tx + tw / 2
        let y2 = ty + th / 2

        const dx = targetCenter.x - sourceCenter.x
        const dy = targetCenter.y - sourceCenter.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist > 0) {
          const angle = Math.atan2(dy, dx)
          const cos = Math.cos(angle)
          const sin = Math.sin(angle)

          if (Math.abs(cos) > Math.abs(sin)) {
            x1 = cos > 0 ? sx + sw : sx
          } else {
            y1 = sin > 0 ? sy + sh : sy
          }

          if (Math.abs(cos) > Math.abs(sin)) {
            x2 = cos > 0 ? tx : tx + tw
          } else {
            y2 = sin > 0 ? ty : ty + th
          }
        }

        svgContent += `<path d="M ${x1} ${y1} L ${x2} ${y2}" class="edge-line" marker-end="url(#arrowhead)"/>`

        if (edge.label) {
          const midX = (x1 + x2) / 2
          const midY = (y1 + y2) / 2
          svgContent += `<text x="${midX}" y="${midY - 5}" class="edge-label" text-anchor="middle">${escapeXml(edge.label)}</text>`
        }
      }
    })

    svgContent += '</svg>'
    return svgContent
  }

  const escapeXml = (str) => {
    if (!str) return ''
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }

  const exportAsSVG = () => {
    const svgContent = generateSVGContent()
    const blob = new Blob([svgContent], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${enrichedProject?.name || 'other-diagram'}.svg`
    link.click()
    URL.revokeObjectURL(url)
    setMessage('✓ Diagram exported as SVG')
    setTimeout(() => setMessage(''), 3000)
  }

  const svgToPNG = async (svgContent, filename) => {
    try {
      const img = new Image()
      const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' })
      const svgUrl = URL.createObjectURL(svgBlob)

      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = svgUrl
      })

      const svgElement = new DOMParser().parseFromString(svgContent, 'text/xml').documentElement
      const viewBox = svgElement.getAttribute('viewBox')
      const [, , viewWidth, viewHeight] = viewBox.split(' ').map(Number)

      const scale = 3
      const canvas = document.createElement('canvas')
      canvas.width = viewWidth * scale
      canvas.height = viewHeight * scale

      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#fafafa'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.scale(scale, scale)
      ctx.drawImage(img, 0, 0)

      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        link.click()
        URL.revokeObjectURL(url)
        setMessage('✓ Diagram exported as PNG')
        setTimeout(() => setMessage(''), 3000)
      })

      URL.revokeObjectURL(svgUrl)
    } catch (error) {
      console.error('PNG conversion error:', error)
      setMessage('Failed to export as PNG.')
    }
  }

  const exportAsPNG = async () => {
    try {
      setMessage('Exporting as PNG...')
      const svgContent = generateSVGContent()
      await svgToPNG(svgContent, `${enrichedProject?.name || 'other-diagram'}.png`)
    } catch (error) {
      console.error('PNG export error:', error)
      setMessage('Failed to export as PNG.')
    }
  }

  const exportAsPDF = async () => {
    try {
      setMessage('Exporting as PDF...')
      const jsPDF = (await import('jspdf')).jsPDF
      const svgContent = generateSVGContent()

      const svgElement = new DOMParser().parseFromString(svgContent, 'text/xml').documentElement
      const viewBox = svgElement.getAttribute('viewBox')
      const [, , viewWidth, viewHeight] = viewBox.split(' ').map(Number)

      const img = new Image()
      const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' })
      const svgUrl = URL.createObjectURL(svgBlob)

      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = svgUrl
      })

      const canvas = document.createElement('canvas')
      canvas.width = viewWidth * 2
      canvas.height = viewHeight * 2
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#fafafa'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.scale(2, 2)
      ctx.drawImage(img, 0, 0)

      const imgData = canvas.toDataURL('image/png')

      const pdfWidth = 210
      const pdfHeight = (viewHeight * pdfWidth) / viewWidth
      const pageHeight = 297

      let heightLeft = pdfHeight
      let position = 0

      const pdf = new jsPDF({
        orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      while (heightLeft > 0) {
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight)
        heightLeft -= pageHeight
        if (heightLeft > 0) {
          pdf.addPage()
          position = heightLeft - pdfHeight
        }
      }

      pdf.save(`${enrichedProject?.name || 'other-diagram'}.pdf`)
      URL.revokeObjectURL(svgUrl)
      setMessage('✓ Diagram exported as PDF')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('PDF export error:', error)
      setMessage('Failed to export as PDF.')
    }
  }

  return (
    <div className="class-diagram-container">
      <header className="class-diagram-header">
        <div className="header-left">
          <button
            type="button"
            className="header-back-btn"
            onClick={() => navigate('/dashboard')}
            title="Back"
          >
            ←
          </button>
          <h1>ArchitectAuto</h1>
        </div>
        <div className="header-center">
          <span className="project-info">
            <strong>{enrichedProject?.name || 'New Project'}</strong>
          </span>
          <span className="divider">•</span>
          <span className="stack-info">{enrichedProject?.stack_name?.toUpperCase() || 'N/A'}</span>
        </div>
        <div className="class-diagram-header-actions">
          <button type="button" className="action-btn" onClick={saveDiagram}>
            Save
          </button>
          <button type="button" className="action-btn" onClick={exportDiagram}>
            Export
          </button>
          <button
            type="button"
            className="profile-icon"
            onClick={() => navigate('/profile')}
            title="Profile"
          >
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
          onEdgeClick={handleEdgeClick}
          onPaneClick={() => {
            console.log('🔲 Pane clicked, deselecting')
            // Clear selected state from all nodes
            setNodes((current) => current.map((n) => ({ ...n, selected: false })))
            setSelectedNodeId(null)
            setSelectedEdgeId(null)
          }}
          setReactFlowInstance={() => {}}
          onUpdateNode={onUpdateNode}
        />

        <aside className="properties-panel">
          <div className="properties-panel-header">
            <h3>Shape Tools</h3>
            {message && <div className="class-diagram-message">{message}</div>}
          </div>

          <div className="shape-toolbar">
            {SHAPE_TOOLS.map((tool) => (
              <button
                key={tool.id}
                type="button"
                className="shape-tool-btn"
                onClick={() => addShape(tool.id)}
                title={tool.label}
              >
                <span className="tool-icon">{tool.icon}</span>
                <span className="tool-label">{tool.label}</span>
              </button>
            ))}
          </div>

          {selectedNodeId && (
            <div className="shape-properties">
              {console.log('🎨 Rendering properties panel for:', selectedNodeId)}
              <h4>Selected Shape</h4>
              
              <div className="selected-shape-info">
                <p>
                  <strong>Type:</strong> {nodes.find(n => n.id === selectedNodeId)?.data?.shapeType}
                </p>
              </div>

              <div className="shape-edit-section">
                <label>Label</label>
                <input
                  type="text"
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  placeholder="Enter label..."
                  className="shape-input"
                />
              </div>

              <div className="shape-edit-row">
                <div className="shape-edit-section">
                  <label>Width (px)</label>
                  <input
                    type="number"
                    value={editWidth}
                    onChange={handleWidthChange}
                    min={SIZE_LIMITS.MIN_WIDTH}
                    max={SIZE_LIMITS.MAX_WIDTH}
                    className="shape-input"
                  />
                </div>
                <div className="shape-edit-section">
                  <label>Height (px)</label>
                  <input
                    type="number"
                    value={editHeight}
                    onChange={handleHeightChange}
                    min={SIZE_LIMITS.MIN_HEIGHT}
                    max={SIZE_LIMITS.MAX_HEIGHT}
                    className="shape-input"
                  />
                </div>
              </div>

              <div className="shape-buttons-group">
                <button
                  type="button"
                  className="create-update-btn"
                  onClick={updateShapeProperties}
                >
                  Update
                </button>
                
                <button
                  type="button"
                  className="delete-btn"
                  onClick={deleteSelectedNode}
                >
                  Delete
                </button>
              </div>
            </div>
          )}

          {selectedEdgeId && (
            <div className="shape-properties">
              <h4>Selected Connection</h4>
              
              <div className="shape-edit-section">
                <label>Label</label>
                <input
                  type="text"
                  value={edgeLabel}
                  onChange={(e) => setEdgeLabel(e.target.value)}
                  placeholder="Enter connection label..."
                  className="shape-input"
                />
              </div>

              <div className="shape-edit-section">
                <label>Line Width (px)</label>
                <input
                  type="number"
                  value={edgeWidth}
                  onChange={(e) => setEdgeWidth(Number(e.target.value))}
                  min="1"
                  max="10"
                  className="shape-input"
                />
              </div>

              <div className="shape-buttons-group">
                <button
                  type="button"
                  className="create-update-btn"
                  onClick={updateEdgeProperties}
                >
                  Update
                </button>
                
                <button
                  type="button"
                  className="delete-btn"
                  onClick={deleteSelectedEdge}
                >
                  Delete
                </button>
              </div>
            </div>
          )}

          <div className="diagram-info">
            <p>
              <strong>Diagram Type:</strong> {diagramType}
            </p>
            <p>
              <strong>Total Shapes:</strong> {nodes.length}
            </p>
            <p>
              <strong>Total Connections:</strong> {edges.length}
            </p>
          </div>
        </aside>
      </main>
    </div>
  )
}

export default OtherDiagram
