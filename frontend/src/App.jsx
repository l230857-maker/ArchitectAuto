import './App.css'
import { Routes, Route } from 'react-router-dom'
import SignIn from './components/pages/SignIn/SignIn'
import SignUp from './components/pages/SignUp/SignUp'
import Dashboard from './components/pages/Dashboard/Dashboard'
import StackSelector from './components/pages/StackSelector/StackSelector'
import DiagramSelector from './components/pages/DiagramSelector/DiagramSelector'
import UserProfile from './components/pages/UserProfile/UserProfile'

function App() {
  return (
    <Routes>
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/stack-selector" element={<StackSelector />} />
      <Route path="/diagram-selector" element={<DiagramSelector />} />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/" element={<SignIn />} />
    </Routes>
  )
}

export default App
