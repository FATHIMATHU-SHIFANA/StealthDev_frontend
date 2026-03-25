import { useState, useEffect } from 'react';
import { SecurityManager } from '../utils/security';

export const useAppMode = () => {
  const [isPrivateMode, setIsPrivateMode] = useState(true);
  const [isPanicMode, setIsPanicMode] = useState(false);

  useEffect(() => {
    loadModeStates();
  }, []);

  const loadModeStates = async () => {
    try {
      const privateMode = SecurityManager.getPrivateMode();
      const panicMode = SecurityManager.getPanicMode();

      setIsPrivateMode(privateMode);
      setIsPanicMode(panicMode);
    } catch (error) {
      console.error('Failed to load mode states:', error);
    }
  };

  const togglePrivateMode = async () => {
    try {
      const newState = !isPrivateMode;
      await SecurityManager.setPrivateMode(newState);
      setIsPrivateMode(newState);
      
      // If entering private mode, exit panic mode
      if (newState && isPanicMode) {
        await SecurityManager.setPanicMode(false);
        setIsPanicMode(false);
      }
    } catch (error) {
      console.error('Failed to toggle private mode:', error);
    }
  };

  const activatePanicMode = async () => {
    try {
      await SecurityManager.setPanicMode(true);
      setIsPanicMode(true);
      
      // Panic mode overrides private mode
      if (isPrivateMode) {
        await SecurityManager.setPrivateMode(false);
        setIsPrivateMode(false);
      }
    } catch (error) {
      console.error('Failed to activate panic mode:', error);
    }
  };

  const deactivatePanicMode = async () => {
    try {
      await SecurityManager.setPanicMode(false);
      setIsPanicMode(false);
    } catch (error) {
      console.error('Failed to deactivate panic mode:', error);
    }
  };

  return {
    isPrivateMode,
    isPanicMode,
    togglePrivateMode,
    activatePanicMode,
    deactivatePanicMode,
  };
};
