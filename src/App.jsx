import React, { useState } from 'react'

function App() {
  const [message, setMessage] = useState('Welcome to Advanced Dithering Suite!')

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
      minHeight: '100vh',
      color: 'white'
    }}>
      <h1>🎨 Advanced Dithering Suite</h1>
      <p>{message}</p>
      
      <div style={{ marginTop: '20px' }}>
        <h2>🚀 Next Steps:</h2>
        <ol>
          <li>Choose your conversation branch</li>
          <li>Start developing your component</li>
          <li>Use `npm run create:component ComponentName` to generate templates</li>
          <li>Test with `npm run dev`</li>
        </ol>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>📋 Available Commands:</h3>
        <ul>
          <li><code>npm run dev</code> - Start development server</li>
          <li><code>npm run create:component YourComponent</code> - Generate component</li>
          <li><code>npm run setup:branches</code> - Create all conversation branches</li>
          <li><code>npm run test</code> - Run tests</li>
        </ul>
      </div>
    </div>
  )
}

export default App
