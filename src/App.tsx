import React, { useEffect } from 'react';
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SafeModeScreen } from './components/SafeModeScreen';
import { PrivateModeScreen } from './components/PrivateModeScreen';
import { useAppMode } from './hooks/useAppMode';
import { SecurityManager } from './utils/security';
import { autoSafety } from './utils/autoSafety';

const App: React.FC = () => {
  const { isPrivateMode, isPanicMode, togglePrivateMode, activatePanicMode } = useAppMode();
  const [username, setUsername] = useState<string>(() => localStorage.getItem('stealth_username') || '');
  const [roomId, setRoomId] = useState<string>(() => localStorage.getItem('stealth_room_id') || 'general');
  const [usernameInput, setUsernameInput] = useState('');
  const [roomInput, setRoomInput] = useState('general');

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Use a shared key for multi-user private mode so message reveal stays consistent.
        SecurityManager.setSecretKey('stealth_dev_key_2024');
        
        // Initialize auto safety features
        autoSafety.initialize();
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initializeApp();
  }, []);

  const handlePanicActivate = () => {
    activatePanicMode();
    alert('Panic Mode Activated: All sensitive content has been hidden.');
  };

  const handleModeToggle = () => {
    togglePrivateMode();
  };

  const handleLogin = () => {
    const cleanName = usernameInput.trim();
    const cleanRoom = roomInput.trim() || 'general';
    if (!cleanName) return;
    localStorage.setItem('stealth_username', cleanName);
    localStorage.setItem('stealth_room_id', cleanRoom);
    setUsername(cleanName);
    setRoomId(cleanRoom);
  };

  const handleLogout = () => {
    localStorage.removeItem('stealth_username');
    localStorage.removeItem('stealth_room_id');
    setUsername('');
    setRoomId('general');
    setUsernameInput('');
    setRoomInput('general');
  };

  if (!username) {
    return (
      <div className="app auth-screen">
        <div className="auth-card">
          <h2>Chat Login</h2>
          <p>Use different usernames on two devices/tabs to chat.</p>
          <input
            className="auth-input"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            placeholder="Enter username"
          />
          <input
            className="auth-input"
            value={roomInput}
            onChange={(e) => setRoomInput(e.target.value)}
            placeholder="Room id (example: general)"
          />
          <button className="auth-button" onClick={handleLogin} disabled={!usernameInput.trim()}>
            Enter Chat
          </button>
        </div>
      </div>
    );
  }

  // In panic mode, always show safe mode
  if (isPanicMode) {
    return (
      <div className="app">
        <Router>
          <Routes>
            <Route 
              path="*" 
              element={
                <SafeModeScreen 
                  onModeToggle={handleModeToggle}
                  onPanicActivate={handlePanicActivate}
                  username={username}
                  roomId={roomId}
                  onLogout={handleLogout}
                />
              } 
            />
          </Routes>
        </Router>
      </div>
    );
  }

  // Normal mode switching
  return (
    <div className="app">
      <Router>
        <Routes>
          <Route 
            path="/" 
            element={
              isPrivateMode ? (
                <PrivateModeScreen 
                  onModeToggle={handleModeToggle}
                  onPanicActivate={handlePanicActivate}
                  username={username}
                  roomId={roomId}
                  onLogout={handleLogout}
                />
              ) : (
                <SafeModeScreen 
                  onModeToggle={handleModeToggle}
                  onPanicActivate={handlePanicActivate}
                  username={username}
                  roomId={roomId}
                  onLogout={handleLogout}
                />
              )
            } 
          />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
