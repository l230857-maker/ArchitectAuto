import './App.css'
import { Routes, Route } from 'react-router-dom'
import SignIn from './components/pages/SignIn/SignIn'
import SignUp from './components/pages/SignUp/SignUp'
import Dashboard from './components/pages/Dashboard/Dashboard'
import StackSelector from './components/pages/StackSelector/StackSelector'
import DiagramSelector from './components/pages/DiagramSelector/DiagramSelector'
import ProjectDetails from './components/pages/ProjectDetails/ProjectDetails'
import ClassDiagram from './components/pages/ClassDiagram/ClassDiagram'
import OtherDiagram from './components/pages/OtherDiagram/OtherDiagram'
import UserProfile from './components/pages/UserProfile/UserProfile'

function App() {
  return (
    <Routes>
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/stack-selector" element={<StackSelector />} />
      <Route path="/diagram-selector" element={<DiagramSelector />} />
      <Route path="/project-details" element={<ProjectDetails />} />
      <Route path="/class-diagram" element={<ClassDiagram />} />
      <Route path="/other-diagram" element={<OtherDiagram />} />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/" element={<SignIn />} />
    </Routes>
  )
}

export default App
