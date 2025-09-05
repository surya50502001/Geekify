import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'
import { Keyboard } from '@capacitor/keyboard'

// Mobile optimizations
if (Capacitor.isNativePlatform()) {
  StatusBar.setStyle({ style: Style.Dark })
  StatusBar.setBackgroundColor({ color: '#000000' })
  
  Keyboard.addListener('keyboardWillShow', () => {
    document.body.style.paddingBottom = '0px'
  })
  
  Keyboard.addListener('keyboardWillHide', () => {
    document.body.style.paddingBottom = '0px'
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)