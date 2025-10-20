import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import MainLayout from './pages/MainLayout'

/**
 * 主应用组件
 * 功能：管理路由和登录状态
 */
function App() {
  // 登录状态（目前存在内存中，刷新会丢失）
  // 后续可以改为从 localStorage 读取
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // 处理登录
  const handleLogin = () => {
    setIsLoggedIn(true)
    // 可以在这里保存到 localStorage
    localStorage.setItem('isLoggedIn', 'true')
  }

  // 处理登出
  const handleLogout = () => {
    setIsLoggedIn(false)
    localStorage.removeItem('isLoggedIn')
  }

  return (
    <Router>
      <Routes>
        {/* 登录页面 */}
        <Route 
          path="/login" 
          element={
            isLoggedIn ? <Navigate to="/home" /> : <LoginPage onLogin={handleLogin} />
          } 
        />
        
        {/* 主界面（需要登录才能访问） */}
        <Route 
          path="/*" 
          element={
            isLoggedIn ? <MainLayout onLogout={handleLogout} /> : <Navigate to="/login" />
          } 
        />
      </Routes>
    </Router>
  )
}

export default App

