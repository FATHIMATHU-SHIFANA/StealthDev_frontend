import React, { useEffect } from 'react';
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SafeModeScreen } from './components/SafeModeScreen';
import { PrivateModeScreen } from './components/PrivateModeScreen';
import { useAppMode } from './hooks/useAppMode';
import { SecurityManager } from './utils/security';
import { autoSafety } from './utils/autoSafety';
import { DEFAULTS, STORAGE_KEYS } from './constants/app';

const App: React.FC = () => {
  const { isPrivateMode, isPanicMode, togglePrivateMode, activatePanicMode } = useAppMode();
  const [username, setUsername] = useState<string>(() => localStorage.getItem(STORAGE_KEYS.USERNAME) || '');
  const [roomId, setRoomId] = useState<string>(() => localStorage.getItem(STORAGE_KEYS.ROOM_ID) || DEFAULTS.ROOM_ID);
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [roomInput, setRoomInput] = useState<string>(DEFAULTS.ROOM_ID);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Use a shared key for multi-user private mode so message reveal stays consistent.
        SecurityManager.setSecretKey(DEFAULTS.SECRET_KEY);
        
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
    const cleanRoom = roomInput.trim() || DEFAULTS.ROOM_ID;
    if (!cleanName) return;

    // Always start chat sessions in private mode after login.
    SecurityManager.setPrivateMode(true);
    SecurityManager.setPanicMode(false);

    localStorage.setItem(STORAGE_KEYS.USERNAME, cleanName);
    localStorage.setItem(STORAGE_KEYS.ROOM_ID, cleanRoom);
    setUsername(cleanName);
    setRoomId(cleanRoom);
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.USERNAME);
    localStorage.removeItem(STORAGE_KEYS.ROOM_ID);
    setUsername('');
    setRoomId(DEFAULTS.ROOM_ID);
    setUsernameInput('');
    setRoomInput(DEFAULTS.ROOM_ID);
  };

  if (!username) {
    return (
      <div className="app auth-screen">
        <div className="auth-card">
          <h2>Chat Login</h2>
          <p>Use different usernames on two devices/tabs to chat.</p>
          <form
            className="auth-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            <div className="auth-stack">
              <input
                className="auth-input"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Enter username"
                autoFocus
                autoComplete="username"
                inputMode="text"
              />
              <input
                className="auth-input"
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value)}
                placeholder="Room id (example: general)"
                autoComplete="off"
                inputMode="text"
              />
              <button className="auth-button" type="submit" disabled={!usernameInput.trim()}>
                Enter Chat
              </button>
            </div>
          </form>
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
