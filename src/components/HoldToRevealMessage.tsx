import React, { useState, useEffect, useRef } from 'react';
import { SecurityManager } from '../utils/security';
import '../styles/HoldToRevealMessage.css';

interface HoldToRevealMessageProps {
  encodedMessage: string;
  holdDuration?: number;
  autoHideDelay?: number;
  alwaysReveal?: boolean;
}

export const HoldToRevealMessage: React.FC<HoldToRevealMessageProps> = ({
  encodedMessage,
  holdDuration = 500,
  autoHideDelay = 3000,
  alwaysReveal = false,
}) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [decodedMessage, setDecodedMessage] = useState('');
  const [isHolding, setIsHolding] = useState(false);
  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoHideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (holdTimeoutRef.current) {
        clearTimeout(holdTimeoutRef.current);
      }
      if (autoHideTimeoutRef.current) {
        clearTimeout(autoHideTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (alwaysReveal) {
      const decodeImmediately = async () => {
        try {
          const decoded = await SecurityManager.decryptMessage(encodedMessage);
          setDecodedMessage(decoded);
          setIsRevealed(true);
        } catch (error) {
          console.error('Failed to decode message:', error);
        }
      };
      decodeImmediately();
      return;
    }

    // When auto reveal is turned off, force message back to masked state.
    setIsHolding(false);
    setIsRevealed(false);
    setDecodedMessage('');
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
    }
    if (autoHideTimeoutRef.current) {
      clearTimeout(autoHideTimeoutRef.current);
    }
  }, [alwaysReveal, encodedMessage]);

  const handleMouseDown = () => {
    if (alwaysReveal) {
      return;
    }
    setIsHolding(true);
    
    holdTimeoutRef.current = setTimeout(async () => {
      try {
        const decoded = await SecurityManager.decryptMessage(encodedMessage);
        setDecodedMessage(decoded);
        setIsRevealed(true);
        
        // Set auto-hide timer
        autoHideTimeoutRef.current = setTimeout(() => {
          setIsRevealed(false);
          setDecodedMessage('');
        }, autoHideDelay);
      } catch (error) {
        console.error('Failed to decode message:', error);
      }
    }, holdDuration);
  };

  const handleMouseUp = () => {
    if (alwaysReveal) {
      return;
    }
    setIsHolding(false);
    
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
    }
  };

  const handleMouseLeave = () => {
    if (alwaysReveal) {
      return;
    }
    setIsHolding(false);
    
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
    }
  };

  const displayMessage = isRevealed ? decodedMessage : encodedMessage.split('|')[0];

  return (
    <div
      className={`hold-to-reveal-message ${isHolding ? 'holding' : ''} ${isRevealed ? 'revealed' : ''} ${alwaysReveal ? 'always-revealed' : ''}`}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {isHolding && !alwaysReveal && <div className="hint">Hold to reveal...</div>}
      {isRevealed && <div className="revealed-indicator" />}
      <div className="message-text">
        {displayMessage}
      </div>
    </div>
  );
};
