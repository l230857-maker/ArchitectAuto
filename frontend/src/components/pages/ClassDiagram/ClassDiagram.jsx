import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Position, useEdgesState, useNodesState } from 'reactflow'
import Canvas from '../../Canvas/Canvas'
import './ClassDiagram.css'
import { API_BASE_URL } from '../../../lib/api'

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

// Data type options for attributes
const DATA_TYPES = [
  'number',
  'boolean',
  'array',
  'object',
  'Date',
]

// Return type options for methods
const RETURN_TYPES = [
  'number',
  'boolean',
  'array',
  'object',
  'Date',
]

// Relationship type options
const RELATIONSHIP_TYPES = [
  'association',
  'inheritance',
  'composition',
  'aggregation',
  'dependency',
]

function ClassDiagram() {
  const navigate = useNavigate()
  const location = useLocation()
  const project = location.state?.project
  const diagram = location.state?.diagram
  const from = location.state?.from || 'project-details'
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
  
  // New class creation - attribute management
  const [newAttrName, setNewAttrName] = useState('')
  const [newAttrType, setNewAttrType] = useState('')
  const [newAttributesList, setNewAttributesList] = useState([])
  const [newMethodName, setNewMethodName] = useState('')
  const [newMethodReturn, setNewMethodReturn] = useState('')
  const [newMethodsList, setNewMethodsList] = useState([])
  
  // Edit class - attribute management
  const [editAttrName, setEditAttrName] = useState('')
  const [editAttrType, setEditAttrType] = useState('')
  const [editAttributesList, setEditAttributesList] = useState([])
  const [editMethodName, setEditMethodName] = useState('')
  const [editMethodReturn, setEditMethodReturn] = useState('')
  const [editMethodsList, setEditMethodsList] = useState([])
  const [enrichedProject, setEnrichedProject] = useState(project)

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

  // Listen for Ctrl+S to save diagram
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        saveDiagram()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [nodes, edges, enrichedProject])

  // Load diagram data from state when component mounts
  useEffect(() => {
    if (diagram?.visualLayout) {
      console.log('📥 Loading saved class diagram:', diagram)
      setNodes(diagram.visualLayout.nodes || [])
      setEdges(diagram.visualLayout.edges || [])
    }
  }, [diagram, setNodes, setEdges])

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
        setEditAttributesList(node.data.attributes || [])
        setEditMethodsList(node.data.methods || [])
      } else {
        setAttributes('')
        setMethods('')
        setEditAttributesList([])
        setEditMethodsList([])
      }
      setMode('default')
    },
    [setSelectedNodeId],
  )

  const resetBuilderForms = () => {
    setNewClassName('')
    setNewClassAttributes('')
    setNewClassMethods('')
    setNewAttrName('')
    setNewAttrType('')
    setNewAttributesList([])
    setNewMethodName('')
    setNewMethodReturn('')
    setNewMethodsList([])
    setRelationSource('')
    setRelationTarget('')
    setRelationLabel('association')
    setRelationCardinality('one-to-one')
  }

  const addNewAttribute = () => {
    if (!newAttrName.trim()) {
      setMessage('Attribute name is required.')
      return
    }
    const newAttr = `${newAttrName.trim()}${newAttrType.trim() ? ': ' + newAttrType.trim() : ''}`
    setNewAttributesList((prev) => [...prev, newAttr])
    setNewAttrName('')
    setNewAttrType('')
  }

  const removeNewAttribute = (index) => {
    setNewAttributesList((prev) => prev.filter((_, i) => i !== index))
  }

  const addNewMethod = () => {
    if (!newMethodName.trim()) {
      setMessage('Method name is required.')
      return
    }
    const newMethod = `${newMethodName.trim()}${newMethodReturn.trim() ? ': ' + newMethodReturn.trim() : ''}`
    setNewMethodsList((prev) => [...prev, newMethod])
    setNewMethodName('')
    setNewMethodReturn('')
  }

  const removeNewMethod = (index) => {
    setNewMethodsList((prev) => prev.filter((_, i) => i !== index))
  }

  const addEditAttribute = () => {
    if (!editAttrName.trim()) {
      setMessage('Attribute name is required.')
      return
    }
    const newAttr = `${editAttrName.trim()}${editAttrType.trim() ? ': ' + editAttrType.trim() : ''}`
    setEditAttributesList((prev) => [...prev, newAttr])
    setEditAttrName('')
    setEditAttrType('')
  }

  const removeEditAttribute = (index) => {
    setEditAttributesList((prev) => prev.filter((_, i) => i !== index))
  }

  const addEditMethod = () => {
    if (!editMethodName.trim()) {
      setMessage('Method name is required.')
      return
    }
    const newMethod = `${editMethodName.trim()}${editMethodReturn.trim() ? ': ' + editMethodReturn.trim() : ''}`
    setEditMethodsList((prev) => [...prev, newMethod])
    setEditMethodName('')
    setEditMethodReturn('')
  }

  const removeEditMethod = (index) => {
    setEditMethodsList((prev) => prev.filter((_, i) => i !== index))
  }

  const startCreateClass = () => {
    setMode('createClass')
    setSelectedNodeId(null)
    setClassName('')
    setAttributes('')
    setMethods('')
    setNewClassName('')
    setNewAttrName('')
    setNewAttrType('')
    setNewAttributesList([])
    setNewMethodName('')
    setNewMethodReturn('')
    setNewMethodsList([])
    setMessage('')
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

    if (!className.trim() || editAttributesList.length === 0) {
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
                attributes: editAttributesList,
                methods: editMethodsList,
              },
            }
          : node,
      ),
    )
    setMessage('Class updated successfully.')
  }

  const createClassBlock = () => {
    if (!newClassName.trim() || newAttributesList.length === 0) {
      setMessage('Class name and at least one attribute are required to create a new class.')
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
        attributes: newAttributesList,
        methods: newMethodsList,
        width: 260,
        height: 220,
      },
    }

    setNodes((current) => [...current, newNode])
    setSelectedNodeId(id)
    setClassName(newClassName.trim())
    setAttributes(newAttributesList.join('\n'))
    setMethods(newMethodsList.join('\n'))
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

  // Parse attributes and methods from string format (e.g., "name: string") to structured format
  const parseAttributes = (attributesList) => {
    return attributesList.map((attr) => {
      const parts = attr.split(':').map((p) => p.trim())
      return {
        name: parts[0],
        type: parts[1] || 'string',
      }
    })
  }

  const parseMethods = (methodsList) => {
    return methodsList.map((method) => {
      const parts = method.split(':').map((p) => p.trim())
      return {
        name: parts[0],
        returnType: parts[1] || 'void',
        parameters: [],
      }
    })
  }

  // Build structured UML from nodes and edges
  const buildStructuredUML = () => {
    const classes = nodes
      .filter((node) => node.type === 'classNode')
      .map((node) => ({
        id: node.id,
        name: node.data.label,
        attributes: parseAttributes(node.data.attributes || []),
        methods: parseMethods(node.data.methods || []),
      }))

    const relationships = edges.map((edge) => ({
      from: edge.source,
      to: edge.target,
      type: extractRelationshipType(edge.label),
    }))

    return { classes, relationships }
  }

  const extractRelationshipType = (label) => {
    if (!label) return 'association'
    const types = ['association', 'inheritance', 'composition', 'aggregation', 'dependency']
    for (const type of types) {
      if (label.toLowerCase().includes(type)) {
        return type
      }
    }
    return 'association'
  }

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
      const structuredUML = buildStructuredUML()

      const payload = {
        name: diagram?.name || project.name,
        visualLayout,
        structuredUML,
      }

      const response = await fetch(
        `${API_BASE_URL}/projects/${project.id}/class-diagrams/${location.state?.diagram?.id}`,
        {
          method: 'PUT',
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

  const exportDiagram = async () => {
    setMessage('Preparing export options...')
    
    // Create a simple dialog for export format selection
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

  const generateSVGContent = () => {
    // Calculate bounding box of all nodes
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

    nodes.forEach((node) => {
      if (node.type === 'classNode') {
        const x = node.position.x
        const y = node.position.y
        const width = node.data.width || 260
        const height = node.data.height || 220

        minX = Math.min(minX, x)
        minY = Math.min(minY, y)
        maxX = Math.max(maxX, x + width)
        maxY = Math.max(maxY, y + height)
      }
    })

    // Add padding
    const padding = 40
    minX -= padding
    minY -= padding
    maxX += padding
    maxY += padding

    const viewWidth = maxX - minX
    const viewHeight = maxY - minY

    // Create SVG with dynamic viewBox
    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${viewWidth} ${viewHeight}" width="${viewWidth}" height="${viewHeight}">
      <defs>
        <style>
          .class-node { fill: white; stroke: #0066cc; stroke-width: 2; }
          .class-header { fill: #0066cc; }
          .class-title { font-size: 14px; font-weight: bold; fill: white; font-family: Arial, sans-serif; }
          .class-attribute { font-size: 12px; fill: black; font-family: monospace; }
          .divider-line { stroke: #0066cc; stroke-width: 1; }
          .edge-line { stroke: #666; stroke-width: 2; fill: none; }
          .edge-label { font-size: 11px; fill: #666; font-family: Arial, sans-serif; }
        </style>
      </defs>
      <rect x="${minX}" y="${minY}" width="${viewWidth}" height="${viewHeight}" fill="#fafafa"/>`

    // Add nodes (classes)
    nodes.forEach((node) => {
      if (node.type === 'classNode') {
        const x = node.position.x
        const y = node.position.y
        const width = node.data.width || 260
        const height = node.data.height || 220

        // Main rectangle
        svgContent += `<rect x="${x}" y="${y}" width="${width}" height="${height}" class="class-node" rx="4"/>`

        // Header background
        const headerHeight = 35
        svgContent += `<rect x="${x}" y="${y}" width="${width}" height="${headerHeight}" class="class-header" rx="4"/>`

        // Title
        svgContent += `<text x="${x + 10}" y="${y + 23}" class="class-title">${escapeXml(node.data.label)}</text>`

        // Divider line after title
        svgContent += `<line x1="${x}" x2="${x + width}" y1="${y + headerHeight}" y2="${y + headerHeight}" class="divider-line"/>`

        // Attributes
        let attrY = y + headerHeight + 18
        ;(node.data.attributes || []).forEach((attr) => {
          svgContent += `<text x="${x + 10}" y="${attrY}" class="class-attribute">${escapeXml(attr)}</text>`
          attrY += 18
        })

        // Divider line before methods
        svgContent += `<line x1="${x}" x2="${x + width}" y1="${attrY}" y2="${attrY}" class="divider-line"/>`

        // Methods
        let methodY = attrY + 15
        ;(node.data.methods || []).forEach((method) => {
          svgContent += `<text x="${x + 10}" y="${methodY}" class="class-attribute">${escapeXml(method)}</text>`
          methodY += 18
        })
      }
    })

    // Add edges (relationships) with arrow markers
    svgContent += `<defs>
      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
      </marker>
    </defs>`

    edges.forEach((edge) => {
      const sourceNode = nodes.find((n) => n.id === edge.source)
      const targetNode = nodes.find((n) => n.id === edge.target)

      if (sourceNode && targetNode && sourceNode.type === 'classNode' && targetNode.type === 'classNode') {
        const sx = sourceNode.position.x
        const sy = sourceNode.position.y
        const sw = sourceNode.data.width || 260
        const sh = sourceNode.data.height || 220

        const tx = targetNode.position.x
        const ty = targetNode.position.y
        const tw = targetNode.data.width || 260
        const th = targetNode.data.height || 220

        // Calculate connection points on the edges of rectangles
        const sourceCenter = { x: sx + sw / 2, y: sy + sh / 2 }
        const targetCenter = { x: tx + tw / 2, y: ty + th / 2 }

        // Determine which edge of the source box the line exits from
        let x1 = sx + sw / 2
        let y1 = sy + sh / 2

        // Determine which edge of the target box the line enters
        let x2 = tx + tw / 2
        let y2 = ty + th / 2

        // Calculate proper connection points
        const dx = targetCenter.x - sourceCenter.x
        const dy = targetCenter.y - sourceCenter.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist > 0) {
          const angle = Math.atan2(dy, dx)
          const cos = Math.cos(angle)
          const sin = Math.sin(angle)

          // Exit point from source (right edge if moving right, etc)
          if (Math.abs(cos) > Math.abs(sin)) {
            x1 = cos > 0 ? sx + sw : sx
          } else {
            y1 = sin > 0 ? sy + sh : sy
          }

          // Entry point to target
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

  const exportAsSVG = () => {
    const svgContent = generateSVGContent()
    const blob = new Blob([svgContent], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${enrichedProject?.name || 'class-diagram'}.svg`
    link.click()
    URL.revokeObjectURL(url)
    setMessage('✓ Diagram exported as SVG')
    setTimeout(() => setMessage(''), 3000)
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

  const svgToPNG = async (svgContent, filename) => {
    try {
      // Create a temporary image element
      const img = new Image()
      const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' })
      const svgUrl = URL.createObjectURL(svgBlob)

      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = svgUrl
      })

      // Get SVG dimensions from viewBox
      const svgElement = new DOMParser().parseFromString(svgContent, 'text/xml').documentElement
      const viewBox = svgElement.getAttribute('viewBox')
      const [, , viewWidth, viewHeight] = viewBox.split(' ').map(Number)

      // Create canvas with appropriate size (3x for quality)
      const scale = 3
      const canvas = document.createElement('canvas')
      canvas.width = viewWidth * scale
      canvas.height = viewHeight * scale

      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#fafafa'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.scale(scale, scale)
      ctx.drawImage(img, 0, 0)

      // Download PNG
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
      await svgToPNG(svgContent, `${enrichedProject?.name || 'class-diagram'}.png`)
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

      // Parse SVG to get dimensions
      const svgElement = new DOMParser().parseFromString(svgContent, 'text/xml').documentElement
      const viewBox = svgElement.getAttribute('viewBox')
      const [, , viewWidth, viewHeight] = viewBox.split(' ').map(Number)

      // Create a temporary image from SVG
      const img = new Image()
      const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' })
      const svgUrl = URL.createObjectURL(svgBlob)

      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = svgUrl
      })

      // Create canvas to render SVG
      const canvas = document.createElement('canvas')
      canvas.width = viewWidth * 2
      canvas.height = viewHeight * 2
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#fafafa'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.scale(2, 2)
      ctx.drawImage(img, 0, 0)

      const imgData = canvas.toDataURL('image/png')

      // Calculate PDF dimensions
      const pdfWidth = 210 // A4 width in mm
      const pdfHeight = (viewHeight * pdfWidth) / viewWidth
      const pageHeight = 297 // A4 height in mm

      let heightLeft = pdfHeight
      let position = 0

      const pdf = new jsPDF({
        orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      // Add image(s) to PDF, handling multi-page diagrams
      while (heightLeft > 0) {
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight)
        heightLeft -= pageHeight
        if (heightLeft > 0) {
          pdf.addPage()
          position = heightLeft - pdfHeight
        }
      }

      pdf.save(`${enrichedProject?.name || 'class-diagram'}.pdf`)
      URL.revokeObjectURL(svgUrl)
      setMessage('✓ Diagram exported as PDF')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('PDF export error:', error)
      setMessage('Failed to export as PDF.')
    }
  }

  const generateCode = async () => {
    setMessage('Generating code...')
    try {
      console.log('Diagram object:', diagram)
      
      if (!diagram) {
        setMessage('No diagram found. Please save the diagram first.')
        return
      }

      // Try different possible ID field names
      const diagramId = diagram._id || diagram.id
      
      if (!diagramId) {
        console.error('Diagram object keys:', Object.keys(diagram))
        setMessage('Diagram ID not found. Please refresh and try again.')
        return
      }

      const session = localStorage.getItem('architectauto-auth')
      if (!session) {
        setMessage('Authentication required. Please login again.')
        return
      }

      const { token } = JSON.parse(session)

      const response = await fetch(`${API_BASE_URL}/projects/generate/${diagramId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        try {
          const error = JSON.parse(errorText)
          setMessage(`Code generation failed: ${error.message}`)
        } catch {
          setMessage(`Code generation failed with status ${response.status}`)
        }
        return
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'generated-code.zip'
      link.click()
      URL.revokeObjectURL(url)

      setMessage('✓ Code generated and downloaded successfully')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('Code generation failed.')
      console.error('Code generation error:', error)
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
            onClick={() => navigate('/dashboard')}
            title="Back"
          >
            ←
          </button>
          <h1>ArchitectAuto</h1>
        </div>
        <div className="header-center">
          <span className="project-info"><strong>{enrichedProject?.name || 'New Project'}</strong></span>
          <span className="divider">•</span>
          <span className="stack-info">{enrichedProject?.stack_name?.toUpperCase() || 'N/A'}</span>
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
          {enrichedProject?.stack_name?.toLowerCase() === 'mern' && (
            <button type="button" className="action-btn generate-btn" onClick={generateCode}>
              Generate Code
            </button>
          )}
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

                <div className="attributes-section">
                  <label>Attributes <span className="required-tag">*</span></label>
                  <div className="attribute-input-group">
                    <input
                      type="text"
                      value={newAttrName}
                      onChange={(event) => setNewAttrName(event.target.value)}
                      placeholder="Attribute name"
                      onKeyPress={(e) => e.key === 'Enter' && addNewAttribute()}
                    />
                    <select
                      value={newAttrType}
                      onChange={(event) => setNewAttrType(event.target.value)}
                      className="type-select"
                      title="Select data type"
                    >
                      <option value="">Select type</option>
                      {DATA_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="add-btn"
                      onClick={addNewAttribute}
                      title="Add attribute"
                    >
                      +
                    </button>
                  </div>
                  <div className="items-list">
                    {newAttributesList.map((attr, index) => (
                      <div key={index} className="item-tag">
                        <span>{attr}</span>
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => removeNewAttribute(index)}
                          title="Remove"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="methods-section">
                  <label>Methods</label>
                  <div className="attribute-input-group">
                    <input
                      type="text"
                      value={newMethodName}
                      onChange={(event) => setNewMethodName(event.target.value)}
                      placeholder="Method name"
                      onKeyPress={(e) => e.key === 'Enter' && addNewMethod()}
                    />
                    <select
                      value={newMethodReturn}
                      onChange={(event) => setNewMethodReturn(event.target.value)}
                      title="Select return type"
                    >
                      <option value="">Select type</option>
                      {RETURN_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="add-btn"
                      onClick={addNewMethod}
                      title="Add method"
                    >
                      +
                    </button>
                  </div>
                  <div className="items-list">
                    {newMethodsList.map((method, index) => (
                      <div key={index} className="item-tag">
                        <span>{method}</span>
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => removeNewMethod(index)}
                          title="Remove"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

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
                  <select value={relationLabel} onChange={(event) => setRelationLabel(event.target.value)}>
                    <option value="">Select relationship type</option>
                    {RELATIONSHIP_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
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

                <div className="attributes-section">
                  <label>Attributes <span className="required-tag">*</span></label>
                  <div className="attribute-input-group">
                    <input
                      type="text"
                      value={editAttrName}
                      onChange={(event) => setEditAttrName(event.target.value)}
                      placeholder="Attribute name"
                      onKeyPress={(e) => e.key === 'Enter' && addEditAttribute()}
                    />
                    <select
                      value={editAttrType}
                      onChange={(event) => setEditAttrType(event.target.value)}
                      className="type-select"
                      title="Select data type"
                    >
                      <option value="">Select type</option>
                      {DATA_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="add-btn"
                      onClick={addEditAttribute}
                      title="Add attribute"
                    >
                      +
                    </button>
                  </div>
                  <div className="items-list">
                    {editAttributesList.map((attr, index) => (
                      <div key={index} className="item-tag">
                        <span>{attr}</span>
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => removeEditAttribute(index)}
                          title="Remove"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="methods-section">
                  <label>Methods</label>
                  <div className="attribute-input-group">
                    <input
                      type="text"
                      value={editMethodName}
                      onChange={(event) => setEditMethodName(event.target.value)}
                      placeholder="Method name"
                      onKeyPress={(e) => e.key === 'Enter' && addEditMethod()}
                    />
                    <select
                      value={editMethodReturn}
                      onChange={(event) => setEditMethodReturn(event.target.value)}
                      title="Select return type"
                    >
                      <option value="">Select type</option>
                      {RETURN_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="add-btn"
                      onClick={addEditMethod}
                      title="Add method"
                    >
                      +
                    </button>
                  </div>
                  <div className="items-list">
                    {editMethodsList.map((method, index) => (
                      <div key={index} className="item-tag">
                        <span>{method}</span>
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => removeEditMethod(index)}
                          title="Remove"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

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
