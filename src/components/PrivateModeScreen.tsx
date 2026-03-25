import React, { useEffect, useState } from 'react';
import { SecurityManager } from '../utils/security';
import { io, Socket } from 'socket.io-client';
import { HoldToRevealMessage } from './HoldToRevealMessage';
import '../styles/PrivateModeScreen.css';
import { useIsMobile } from '../hooks/useIsMobile';
import { STORAGE_KEYS } from '../constants/app';

interface PrivateModeScreenProps {
  onModeToggle: () => void;
  onPanicActivate: () => void;
  username: string;
  roomId: string;
  onLogout: () => void;
}

export const PrivateModeScreen: React.FC<PrivateModeScreenProps> = ({
  onModeToggle,
  onPanicActivate,
  username,
  roomId,
  onLogout,
}) => {
  const [messages, setMessages] = useState<Array<{ id: string; encoded: string; senderId: string }>>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [autoReveal, setAutoReveal] = useState<boolean>(() => localStorage.getItem(STORAGE_KEYS.AUTO_REVEAL) === 'true');
  const isMobile = useIsMobile();
  const [mobileActivePanel, setMobileActivePanel] = useState<'main' | 'chat'>('main');

  useEffect(() => {
    if (!isMobile) return;
    setMobileActivePanel('chat');
  }, [isMobile]);

  useEffect(() => {
    const defaultSocketUrl = `${window.location.protocol}//${window.location.hostname}:5000`;
    const wsUrl = (import.meta as any).env?.VITE_SOCKET_URL || defaultSocketUrl;
    const nextSocket = io(wsUrl, {
      transports: ['websocket'],
      auth: { username },
    });

    nextSocket.on('connect', () => {
      nextSocket.emit('join_room', { roomId });
    });

    nextSocket.on('load_messages', async (serverMessages: any[]) => {
      const normalized = await Promise.all(
        (serverMessages || []).map(async (msg: any) => ({
          id: msg.id || `load_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          encoded: msg.encryptedContent || (await SecurityManager.encryptMessage(msg.content || '')),
          senderId: msg.senderId || 'unknown',
        }))
      );
      setMessages(normalized);
    });

    nextSocket.on('new_message', async (msg: any) => {
      const encoded = msg.encryptedContent || (await SecurityManager.encryptMessage(msg.content || ''));
      setMessages((prev) => [
        ...prev,
        {
          id: msg.id || `msg_${Date.now()}`,
          encoded,
          senderId: msg.senderId || 'unknown',
        },
      ]);
    });

    setSocket(nextSocket);
    return () => {
      nextSocket.disconnect();
      setSocket(null);
    };
  }, [roomId, username]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    
    try {
      setIsLoading(true);
      const encoded = await SecurityManager.encryptMessage(inputText);
      if (socket?.connected) {
        socket.emit('send_encrypted_message', { encryptedContent: encoded, roomId });
      } else {
        setMessages(prev => [...prev, { id: `local_${Date.now()}`, encoded, senderId: username }]);
      }
      setInputText('');
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsLoading(false);
    }
  };

  const handleToggleAutoReveal = () => {
    const nextValue = !autoReveal;
    setAutoReveal(nextValue);
    localStorage.setItem(STORAGE_KEYS.AUTO_REVEAL, String(nextValue));
  };

  return (
    <div className="private-mode-screen">
      <div className="top-menu-bar">
        <div className="menu-items">File&nbsp;&nbsp;&nbsp;Edit&nbsp;&nbsp;&nbsp;Selection&nbsp;&nbsp;&nbsp;View&nbsp;&nbsp;&nbsp;Go&nbsp;&nbsp;&nbsp;Run&nbsp;&nbsp;&nbsp;Terminal&nbsp;&nbsp;&nbsp;Help</div>
        <div className="window-title">Stealth Dev</div>
        <div className="header-actions">
          {isMobile && (
            <div className="mobile-view-toggle" role="tablist" aria-label="Mobile view toggle">
              <button
                type="button"
                className={`mobile-view-toggle-button ${mobileActivePanel === 'main' ? 'active' : ''}`}
                onClick={() => setMobileActivePanel('main')}
                aria-pressed={mobileActivePanel === 'main'}
              >
                Editor
              </button>
              <button
                type="button"
                className={`mobile-view-toggle-button ${mobileActivePanel === 'chat' ? 'active' : ''}`}
                onClick={() => setMobileActivePanel('chat')}
                aria-pressed={mobileActivePanel === 'chat'}
              >
                Chat
              </button>
            </div>
          )}
          <button className="header-logout" onClick={onLogout}>Logout</button>
          <button className="panic-button" onClick={onPanicActivate}>
            ●
          </button>
        </div>
      </div>

      <div className="editor-title-tabs">
        <div className="title-tab">crv_palms_learners_portal_web_u...</div>
        <div className="title-tab active">CertificateResults.tsx</div>
        <div className="title-tab">crv_palms_ltc_admin_web_u...</div>
        <div className="title-tab">docker-compose.yml</div>
      </div>

      <div className="content">
        {/* Left Sidebar - File Explorer */}
        {!isMobile && <div className="sidebar-left">
          <div className="section-title">EXPLORER</div>
          <div className="file-explorer">
            <p className="folder">▷ .bolt</p>
            <p className="folder">▷ .claude</p>
            <p className="folder">▷ .vscode</p>
            <p className="folder">▷ data</p>
            <p className="folder">▷ data-import-scripts</p>
            <p className="folder">▷ docs</p>
            <p className="folder">▷ fonts</p>
            <p className="folder">▼ palms_learners_portal_w...</p>
            <p className="file indent">dist</p>
            <p className="file indent">node_modules</p>
            <p className="folder indent">▼ public</p>
            <p className="file double-indent">assets</p>
            <p className="folder double-indent">▼ components</p>
            <p className="file triple-indent">assessments</p>
            <p className="folder triple-indent">▼ certificateVerification</p>
            <p className="file quadruple-indent active">CertificateResults.tsx</p>
            <p className="folder double-indent">common</p>
            <p className="folder double-indent">content</p>
            <p className="folder double-indent">courseLibrary</p>
            <p className="folder double-indent">courseNavigation</p>
            <p className="folder double-indent">dashboard</p>
            <p className="folder double-indent">exams</p>
            <p className="folder double-indent">feedback</p>
            <p className="folder double-indent">header</p>
            <p className="folder double-indent">layout</p>
            <p className="folder double-indent">learner</p>
            <p className="folder double-indent">login</p>
            <p className="folder double-indent">payments</p>
            <p className="folder double-indent">profile</p>
            <p className="folder double-indent">reports</p>
            <p className="folder double-indent">settings</p>
            <p className="file indent">package.json</p>
            <p className="file indent">README.md</p>
            <p className="file indent">tsconfig.json</p>
          </div>
          
          <div className="section-title">OUTLINE</div>
          <div className="file-explorer">
            <p className="file">CertificateResults</p>
            <p className="file indent">useState</p>
            <p className="file indent">useEffect</p>
            <p className="file indent">useParams</p>
            <p className="file indent">useNavigate</p>
            <p className="file indent">certificateService</p>
          </div>
          
          <div className="section-title">TIMELINE</div>
          <div className="file-explorer">
            <p className="file">No timeline entries</p>
          </div>
        </div>}

        {/* Main Area - Editor and Terminal */}
        {(!isMobile || mobileActivePanel === 'main') && <div className="main-area">
          <div className="editor-container">
            <div className="editor-tabs">
              <div className="editor-tab active">
                <span>📄</span>
                <span>CertificateResults.tsx</span>
                <span>×</span>
              </div>
            </div>
            <div
              className="editor-content"
              dangerouslySetInnerHTML={{ __html: `<span class="keyword">import</span> React, { <span class="keyword">useState</span>, <span class="keyword">useEffect</span> } <span class="keyword">from</span> <span class="string">'react'</span>;
<span class="keyword">import</span> { useParams, useNavigate } <span class="keyword">from</span> <span class="string">'react-router-dom'</span>;
<span class="keyword">import</span> { certificateService } <span class="keyword">from</span> <span class="string">'../services/certificateService'</span>;

<span class="keyword">interface</span> <span class="type">CertificateData</span> {
  <span class="keyword">id</span>: <span class="type">string</span>;
  <span class="keyword">studentName</span>: <span class="type">string</span>;
  <span class="keyword">courseName</span>: <span class="type">string</span>;
  <span class="keyword">completionDate</span>: <span class="type">string</span>;
  <span class="keyword">score</span>: <span class="number">0</span>;
  <span class="keyword">status</span>: <span class="string">'completed'</span> | <span class="string">'failed'</span> | <span class="string">'pending'</span>;
}

<span class="keyword">const</span> <span class="function">CertificateResults</span>: <span class="type">React.FC</span> = () => {
  <span class="keyword">const</span> { certificateId } = <span class="function">useParams</span><<span class="type">{ certificateId: string }</span>>();
  <span class="keyword">const</span> navigate = <span class="function">useNavigate</span>();
  <span class="keyword">const</span> [certificate, setCertificate] = <span class="function">useState</span><<span class="type">CertificateData | null</span>>(<span class="keyword">null</span>);
  <span class="keyword">const</span> [loading, setLoading] = <span class="function">useState</span>(<span class="keyword">true</span>);
  <span class="keyword">const</span> [error, setError] = <span class="function">useState</span><<span class="type">string | null</span>>(<span class="keyword">null</span>);

  <span class="function">useEffect</span>(() => {
    <span class="keyword">const</span> <span class="function">loadCertificate</span> = <span class="keyword">async</span> () => {
      <span class="keyword">try</span> {
        <span class="keyword">if</span> (!certificateId) {
          <span class="function">setError</span>(<span class="string">'Certificate ID not provided'</span>);
          <span class="keyword">return</span>;
        }
        
        <span class="keyword">const</span> data = <span class="keyword">await</span> <span class="function">certificateService.getCertificate</span>(certificateId);
        <span class="function">setCertificate</span>(data);
      } <span class="keyword">catch</span> (err) {
        <span class="function">setError</span>(<span class="string">'Failed to load certificate'</span>);
        <span class="keyword">console</span>.<span class="function">error</span>(<span class="string">'Certificate loading error:'</span>, err);
      } <span class="keyword">finally</span> {
        <span class="function">setLoading</span>(<span class="keyword">false</span>);
      }
    };

    <span class="function">loadCertificate</span>();
  }, [certificateId]);

  <span class="keyword">if</span> (loading) {
    <span class="keyword">return</span> <span class="keyword">&lt;div</span> <span class="keyword">className</span>=<span class="string">"loading"</span>&gt;<span class="function">Loading certificate...</span>&lt;/div&gt;;
  }

  <span class="keyword">if</span> (error || !certificate) {
    <span class="keyword">return</span> <span class="keyword">&lt;div</span> <span class="keyword">className</span>=<span class="string">"error"</span>&gt;{error || <span class="string">'Certificate not found'</span>}&lt;/div&gt;;
  }

  <span class="keyword">return</span> (
    <span class="keyword">&lt;div</span> <span class="keyword">className</span>=<span class="string">"certificate-results"</span>&gt;
      <span class="keyword">&lt;h1&gt;</span>Certificate of Completion<span class="keyword">&lt;/h1&gt;</span>
      <span class="keyword">&lt;div</span> <span class="keyword">className</span>=<span class="string">"certificate-info"</span>&gt;
        <span class="keyword">&lt;p&gt;</span><span class="keyword">&lt;strong&gt;</span>Student:<span class="keyword">&lt;/strong&gt;</span> {certificate.studentName}<span class="keyword">&lt;/p&gt;</span>
        <span class="keyword">&lt;p&gt;</span><span class="keyword">&lt;strong&gt;</span>Course:<span class="keyword">&lt;/strong&gt;</span> {certificate.courseName}<span class="keyword">&lt;/p&gt;</span>
        <span class="keyword">&lt;p&gt;</span><span class="keyword">&lt;strong&gt;</span>Completion Date:<span class="keyword">&lt;/strong&gt;</span> {certificate.completionDate}<span class="keyword">&lt;/p&gt;</span>
        <span class="keyword">&lt;p&gt;</span><span class="keyword">&lt;strong&gt;</span>Score:<span class="keyword">&lt;/strong&gt;</span> {certificate.score}%<span class="keyword">&lt;/p&gt;</span>
        <span class="keyword">&lt;p&gt;</span><span class="keyword">&lt;strong&gt;</span>Status:<span class="keyword">&lt;/strong&gt;</span> {certificate.status}<span class="keyword">&lt;/p&gt;</span>
      <span class="keyword">&lt;/div&gt;</span>
    <span class="keyword">&lt;/div&gt;</span>
  );
};

<span class="keyword">export default</span> <span class="function">CertificateResults</span>;` }}
            />
          </div>
          
          <div className="terminal-container">
            <div className="terminal-tabs">
              <div className="terminal-tab">Problems</div>
              <div className="terminal-tab">Output</div>
              <div className="terminal-tab">Debug Console</div>
              <div className="terminal-tab active">Terminal</div>
            </div>
            <div
              className="terminal-content"
              dangerouslySetInnerHTML={{ __html: `<span class="command">$ npm start</span>

<span class="output">&gt; palms-learners_portal_web@1.0.0 start</span>
<span class="output">&gt; react-scripts start</span>

<span class="info">Starting the development server...</span>

<span class="success">Compiled successfully!</span>

<span class="info">You can now view palms_learners_portal_web in the browser.</span>

  <span class="info">Local:</span>            <span class="success">http://localhost:3000</span>
  <span class="info">On Your Network:</span>  <span class="success">http://192.168.1.100:3000</span>

<span class="info">Note that the development build is not optimized.</span>
<span class="info">To create a production build, use npm run build.</span>

<span class="success">webpack compiled successfully</span>

<span class="command">$ npm run build</span>

<span class="output">&gt; palms-learners_portal_web@1.0.0 build</span>
<span class="output">&gt; react-scripts build</span>

<span class="info">Creating an optimized production build...</span>
<span class="success">Compiled successfully.</span>

<span class="info">File sizes after gzip:</span>

  <span class="number">52.65 KB</span>  build/static/js/main.<span class="number">123456</span>.js
  <span class="number">1.78 KB</span>   build/static/js/<span class="number">789</span>.abc.js
  <span class="number">780 B</span>     build/static/css/main.def.css

<span class="info">The project was built assuming it is hosted at /.</span>
<span class="info">You can control this with the homepage field in your package.json.</span>

<span class="success">The build folder is ready to be deployed.</span>` }}
            />
          </div>
        </div>}

        {/* Right Sidebar - Chat */}
        {(!isMobile || mobileActivePanel === 'chat') && <div className="sidebar-right">
          <div className="chat-container">
            <div className="chat-header">
              Proctored and time-bound assess... | Room: {roomId}
            </div>
            <div className="chat-messages">
              {messages.map((message, index: number) => (
                <div 
                  key={message.id || index} 
                  className={`chat-message ${message.senderId === username ? 'sent' : 'received'}`}
                >
                  <HoldToRevealMessage 
                    encodedMessage={message.encoded}
                    holdDuration={500}
                    autoHideDelay={3000}
                    alwaysReveal={autoReveal}
                  />
                </div>
              ))}
              {isLoading && (
                <div className="chat-message received">
                  <div className="message-content">Typing...</div>
                </div>
              )}
            </div>
            <div className="chat-actions">
              <span>19 Files</span>
              <button>Undo All</button>
              <button>Keep All</button>
              <button>Review</button>
              <button onClick={handleToggleAutoReveal}>{autoReveal ? 'Auto Reveal: ON' : 'Auto Reveal: OFF'}</button>
              <button onClick={onModeToggle}>Safe Mode</button>
            </div>
            <div className="chat-input-section">
              <div className="chat-toolbar">
                <span>Get faster responses</span>
                <button className="toolbar-chip">Upgrade to Pro</button>
                <button className="toolbar-chip bright">Set now limit</button>
              </div>
              <div className="chat-input-wrapper">
                <div className="chat-agent-selector">
                  <span>Plan, @ for context, / for commands</span>
                  <select className="agent-select" aria-label="Agent model selector">
                    <option>Agent</option>
                  </select>
                </div>
                <textarea
                  className="chat-input"
                  value={inputText}
                  onChange={(e: any) => setInputText(e.target.value)}
                  placeholder=""
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <button 
                  className="send-button" 
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isLoading}
                >
                  {isLoading ? 'Sending...' : 'Auto'}
                </button>
              </div>
              <div className="status-bar">Ln 10, Col 1 &nbsp; Spaces: 2 &nbsp; UTF-8 &nbsp; CRLF &nbsp; TypeScript JSX</div>
            </div>
          </div>
        </div>}
      </div>
    </div>
  );
};
