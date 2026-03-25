import { EncodingEngine } from './encoding';

export interface FakeProject {
  id: string;
  name: string;
  description: string;
  lastModified: Date;
  files: FakeFile[];
}

export interface FakeFile {
  id: string;
  name: string;
  content: string;
  size: number;
  type: 'code' | 'config' | 'data';
}

export interface FakeLog {
  id: string;
  timestamp: Date;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  source: string;
}

export class FakeDataGenerator {
  private static readonly PROJECT_NAMES = [
    'E-Commerce Backend',
    'Mobile Analytics Dashboard',
    'Authentication Service',
    'Data Processing Pipeline',
    'Real-time Chat Server',
    'Content Management System',
    'Payment Gateway',
    'User Management API',
  ];

  private static readonly FILE_NAMES = {
    code: ['index.js', 'app.js', 'utils.js', 'api.js', 'config.js', 'models.js'],
    config: ['package.json', 'webpack.config.js', 'babel.config.js', '.env', 'docker.yml'],
    data: ['database.json', 'users.json', 'products.json', 'logs.json'],
  };

  private static readonly LOG_MESSAGES = {
    INFO: [
      'Server started on port 3000',
      'Database connection established',
      'API request processed successfully',
      'Cache cleared successfully',
      'Build completed successfully',
      'Deployment finished',
      'User authenticated',
      'Session created',
    ],
    WARN: [
      'API latency exceeding threshold',
      'Memory usage above 80%',
      'Database connection pool exhausted',
      'Rate limit approaching',
      'Certificate expiring soon',
      'Disk space running low',
      'Configuration file missing',
    ],
    ERROR: [
      'Database connection failed',
      'Authentication token invalid',
      'API rate limit exceeded',
      'Memory allocation failed',
      'File system permission denied',
      'Network timeout occurred',
      'Service unavailable',
      'Invalid request parameters',
    ],
    DEBUG: [
      'Processing user request',
      'Cache miss for key',
      'Validating input parameters',
      'Executing database query',
      'Rendering template',
      'Loading configuration',
      'Checking permissions',
      'Logging user activity',
    ],
  };

  private static readonly LOG_SOURCES = [
    'api-server',
    'auth-service',
    'database',
    'cache-layer',
    'load-balancer',
    'monitoring',
    'security',
    'file-system',
  ];

  static generateProjects(count: number = 5): FakeProject[] {
    const projects: FakeProject[] = [];
    
    for (let i = 0; i < count; i++) {
      const project = this.generateProject();
      projects.push(project);
    }
    
    return projects.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
  }

  private static generateProject(): FakeProject {
    const name = this.getRandomElement(this.PROJECT_NAMES);
    const fileCount = Math.floor(Math.random() * 8) + 3;
    const files = this.generateFiles(fileCount);
    
    return {
      id: `project_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      name,
      description: `${name} - A modern web application built with React and Node.js`,
      lastModified: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Last 7 days
      files,
    };
  }

  private static generateFiles(count: number): FakeFile[] {
    const files: FakeFile[] = [];
    const types: Array<'code' | 'config' | 'data'> = ['code', 'config', 'data'];
    
    for (let i = 0; i < count; i++) {
      const type = this.getRandomElement(types);
      const file = this.generateFile(type);
      files.push(file);
    }
    
    return files;
  }

  private static generateFile(type: 'code' | 'config' | 'data'): FakeFile {
    const names = this.FILE_NAMES[type];
    const name = this.getRandomElement(names);
    const content = this.generateFileContent(type);
    
    return {
      id: `file_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      name,
      content,
      size: content.length,
      type,
    };
  }

  private static generateFileContent(type: 'code' | 'config' | 'data'): string {
    switch (type) {
      case 'code':
        return this.generateCodeContent();
      case 'config':
        return this.generateConfigContent();
      case 'data':
        return this.generateDataContent();
      default:
        return this.generateCodeContent();
    }
  }

  private static generateCodeContent(): string {
    const templates = [
      `const express = require('express');
const app = express();

app.get('/api/users', (req, res) => {
  res.json({ users: [] });
});

app.listen(3000, () => {
  console.log('Server running');
});`,
      `function processData(data) {
  return data.map(item => ({
    ...item,
    processed: true,
    timestamp: new Date()
  }));
}

module.exports = { processData };`,
      `class UserService {
  constructor(database) {
    this.db = database;
  }
  
  async findById(id) {
    return await this.db.collection('users').findOne({ _id: id });
  }
}`,
    ];
    
    return this.getRandomElement(templates);
  }

  private static generateConfigContent(): string {
    const templates = [
      `{
  "name": "stealth-app",
  "version": "1.0.0",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "express": "^4.18.0"
  }
}`,
      `module.exports = {
  development: {
    database: 'mongodb://localhost:27017/dev',
    port: 3000
  },
  production: {
    database: process.env.DB_URL,
    port: process.env.PORT || 3000
  }
};`,
      `PORT=3000
NODE_ENV=development
DB_URL=mongodb://localhost:27017/stealth
JWT_SECRET=your-secret-key
API_RATE_LIMIT=100`,
    ];
    
    return this.getRandomElement(templates);
  }

  private static generateDataContent(): string {
    const templates = [
      `{
  "users": [
    { "id": 1, "name": "John Doe", "email": "john@example.com" },
    { "id": 2, "name": "Jane Smith", "email": "jane@example.com" }
  ],
  "total": 2
}`,
      `{
  "products": [
    { "id": "p1", "name": "Product 1", "price": 29.99 },
    { "id": "p2", "name": "Product 2", "price": 49.99 }
  ],
  "categories": ["electronics", "clothing"]
}`,
      `[
  { "timestamp": "2024-01-01T00:00:00Z", "event": "user_login", "user_id": 1 },
  { "timestamp": "2024-01-01T00:05:00Z", "event": "page_view", "page": "/dashboard" }
]`,
    ];
    
    return this.getRandomElement(templates);
  }

  static generateLogs(count: number = 20): FakeLog[] {
    const logs: FakeLog[] = [];
    const levels: Array<'INFO' | 'WARN' | 'ERROR' | 'DEBUG'> = ['INFO', 'WARN', 'ERROR', 'DEBUG'];
    
    for (let i = 0; i < count; i++) {
      const level = this.getRandomElement(levels);
      const log = this.generateLog(level);
      logs.push(log);
    }
    
    return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  private static generateLog(level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG'): FakeLog {
    const messages = this.LOG_MESSAGES[level];
    const message = this.getRandomElement(messages);
    const source = this.getRandomElement(this.LOG_SOURCES);
    
    return {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000), // Last 24 hours
      level,
      message,
      source,
    };
  }

  static generateEncodedMessages(count: number = 10): string[] {
    const messages: string[] = [];
    const realMessages = [
      'Hey, are you there?',
      'Yes, I am here. What\'s up?',
      'Did you see the latest update?',
      'No, what happened?',
      'They released new security features',
      'That\'s interesting, tell me more',
      'The encryption is now end-to-end',
      'That\'s great for privacy',
      'How was your day?',
      'Pretty good, just working on code',
      'Same here, debugging some issues',
      'Need any help with that?',
      'Maybe later, thanks for asking',
      'No problem, let me know if you need anything',
      'Will do, talk to you later',
    ];
    
    for (let i = 0; i < count; i++) {
      const realMessage = this.getRandomElement(realMessages);
      const encoded = EncodingEngine.encode(realMessage);
      messages.push(encoded);
    }
    
    return messages;
  }

  private static getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  static generateSystemStatus() {
    return {
      cpu: Math.floor(Math.random() * 100),
      memory: Math.floor(Math.random() * 100),
      disk: Math.floor(Math.random() * 100),
      network: Math.floor(Math.random() * 100),
      uptime: Math.floor(Math.random() * 30 * 24 * 60 * 60), // Last 30 days in seconds
      processes: Math.floor(Math.random() * 50) + 10,
    };
  }

  static generateBuildLogs(): string[] {
    const buildSteps = [
      'Starting build process...',
      'Cleaning previous build artifacts',
      'Installing dependencies',
      'Compiling source code',
      'Running tests',
      'Building production bundle',
      'Optimizing assets',
      'Generating source maps',
      'Build completed successfully',
    ];
    
    return buildSteps.map(step => EncodingEngine.encode(step, 'dummy_key', { style: 'logs' }));
  }
}
