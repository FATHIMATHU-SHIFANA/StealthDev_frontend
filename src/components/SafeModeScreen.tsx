import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import '../styles/SafeModeScreen.css';
import { SAFE_MODE_RESPONSE_TEXTS, SAFE_MODE_CODE_SNIPPETS } from '../constants/chatMocks';

interface SafeModeScreenProps {
  onModeToggle: () => void;
  onPanicActivate: () => void;
  username: string;
  roomId: string;
  onLogout: () => void;
}

export const SafeModeScreen: React.FC<SafeModeScreenProps> = ({
  onModeToggle,
  onPanicActivate,
  username,
  roomId,
  onLogout,
}) => {
  const SAFE_MODE_BOT_SENDER_ID = 'safe_mode_bot';
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Array<{ id: string; content: string; senderId: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

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

    nextSocket.on('load_messages', (serverMessages: any[]) => {
      const normalized = (serverMessages || []).map((msg: any) => ({
        id: msg.id || `load_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        content: msg.content || '',
        senderId: msg.senderId || 'unknown',
      }));
      setMessages(normalized);
    });

    nextSocket.on('new_message', (msg: any) => {
      setMessages((prev) => [
        ...prev,
        {
          id: msg.id || `msg_${Date.now()}`,
          content: msg.content || '',
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

  const getRandomElement = (items: string[]): string => {
    if (!items.length) return '';
    return items[Math.floor(Math.random() * items.length)];
  };

  const buildSafeModeReply = (userText: string): string => {
    const includeSnippet = userText.length > 40 || Math.random() > 0.55;
    const baseReply = getRandomElement(SAFE_MODE_RESPONSE_TEXTS) || 'All systems operational.';
    if (!includeSnippet) return baseReply;

    const snippet = getRandomElement(SAFE_MODE_CODE_SNIPPETS);
    return snippet ? `${baseReply}\n\n${snippet}` : baseReply;
  };

  const queueSafeModeReply = (userText: string) => {
    const replyDelayMs = 550 + Math.floor(Math.random() * 900);
    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `safe_reply_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          content: buildSafeModeReply(userText),
          senderId: SAFE_MODE_BOT_SENDER_ID,
        },
      ]);
      setIsLoading(false);
    }, replyDelayMs);
  };

  const handleInputSubmit = async () => {
    if (!inputText.trim()) return;
    
    try {
      setIsLoading(true);
      const textToSend = inputText.trim();
      
      if (socket?.connected) {
        socket.emit('send_message', { content: textToSend, roomId });
      } else {
        setMessages((prev) => [...prev, { id: `local_${Date.now()}`, content: textToSend, senderId: username }]);
      }
      queueSafeModeReply(textToSend);
      
      setInputText('');
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsLoading(false);
    }
  };

  
  return (
    <div className="safe-mode-screen">
      <div className="top-menu-bar">
        <div className="menu-items">File&nbsp;&nbsp;&nbsp;Edit&nbsp;&nbsp;&nbsp;Selection&nbsp;&nbsp;&nbsp;View&nbsp;&nbsp;&nbsp;Go&nbsp;&nbsp;&nbsp;Run&nbsp;&nbsp;&nbsp;Terminal&nbsp;&nbsp;&nbsp;Help</div>
        <div className="window-title">Stealth Dev</div>
        <div className="header-actions">
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
        <div className="sidebar-left">
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
        </div>

        {/* Main Area - Editor and Terminal */}
        <div className="main-area">
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
        </div>

        {/* Right Sidebar - Chat */}
        <div className="sidebar-right">
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
                  <div className="message-content">{message.content}</div>
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
              <button onClick={onModeToggle}>Private Mode</button>
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
                  onChange={(e) => setInputText((e.target as any).value)}
                  placeholder=""
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleInputSubmit();
                    }
                  }}
                />
                <button className="send-button" onClick={handleInputSubmit} disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Auto'}
                </button>
              </div>
              <div className="status-bar">Ln 10, Col 1 &nbsp; Spaces: 2 &nbsp; UTF-8 &nbsp; CRLF &nbsp; TypeScript JSX</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
