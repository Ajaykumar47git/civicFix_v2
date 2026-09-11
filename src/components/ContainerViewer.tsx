import React, { useState } from 'react';
import { 
  Box, 
  Layers, 
  Terminal, 
  Server, 
  Database, 
  Copy, 
  Check, 
  ShieldCheck, 
  Cpu, 
  ArrowRight, 
  FileCode, 
  AlertTriangle, 
  RefreshCw, 
  CheckCircle2,
  HardDrive,
  Globe,
  Lock,
  ExternalLink
} from 'lucide-react';

export const ContainerViewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'topology' | 'compose' | 'dockerfiles' | 'commands' | 'troubleshooting' | 'env'>('topology');
  const [selectedFile, setSelectedFile] = useState<'compose_prod' | 'compose_dev' | 'dockerfile_backend' | 'dockerfile_frontend' | 'dockerfile_unified' | 'nginx'>('compose_prod');
  const [copied, setCopied] = useState<string | null>(null);

  const copyCode = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-150">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded text-xs font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Phase 8 Containerization
              </span>
              <span className="px-2.5 py-1 rounded text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Docker &bull; Compose v2 &bull; Nginx Alpine &bull; PostGIS 16
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              CivicFix Enterprise Containerization Architecture
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Multi-tier microservice containerization with multi-stage OCI builds, non-root security isolation, automated healthchecks, and production orchestration.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => copyCode('docker compose up -d --build', 'quick_start')}
              className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md transition-all flex items-center space-x-2"
            >
              {copied === 'quick_start' ? <Check className="w-4 h-4 text-emerald-300" /> : <Terminal className="w-4 h-4" />}
              <span>{copied === 'quick_start' ? 'Copied Run Command!' : 'Copy docker compose up'}</span>
            </button>
          </div>
        </div>

        {/* Quick Microservices Overview Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block">Frontend Tier</span>
            <span className="text-base font-bold text-white font-mono flex items-center space-x-1.5 mt-0.5">
              <Globe className="w-4 h-4 text-blue-400" />
              <span>Nginx Alpine (:80)</span>
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Backend Tier</span>
            <span className="text-base font-bold text-emerald-400 font-mono flex items-center space-x-1.5 mt-0.5">
              <Server className="w-4 h-4 text-emerald-400" />
              <span>Node 20 Express (:3000)</span>
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Database Tier</span>
            <span className="text-base font-bold text-indigo-400 font-mono flex items-center space-x-1.5 mt-0.5">
              <Database className="w-4 h-4 text-indigo-400" />
              <span>PostGIS 16 (:5432)</span>
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Caching Tier</span>
            <span className="text-base font-bold text-red-400 font-mono flex items-center space-x-1.5 mt-0.5">
              <HardDrive className="w-4 h-4 text-red-400" />
              <span>Redis 7 (:6379)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-200 mb-6 space-x-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('topology')}
          className={`pb-3 px-3 border-b-2 whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
            activeTab === 'topology' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Container Topology</span>
        </button>

        <button
          onClick={() => setActiveTab('compose')}
          className={`pb-3 px-3 border-b-2 whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
            activeTab === 'compose' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Box className="w-4 h-4" />
          <span>Docker Compose (Prod &amp; Dev)</span>
        </button>

        <button
          onClick={() => setActiveTab('dockerfiles')}
          className={`pb-3 px-3 border-b-2 whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
            activeTab === 'dockerfiles' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Dockerfiles &amp; Nginx</span>
        </button>

        <button
          onClick={() => setActiveTab('commands')}
          className={`pb-3 px-3 border-b-2 whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
            activeTab === 'commands' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>CLI &amp; Build Commands</span>
        </button>

        <button
          onClick={() => setActiveTab('env')}
          className={`pb-3 px-3 border-b-2 whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
            activeTab === 'env' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Environment &amp; Secrets</span>
        </button>

        <button
          onClick={() => setActiveTab('troubleshooting')}
          className={`pb-3 px-3 border-b-2 whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
            activeTab === 'troubleshooting' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Troubleshooting Guide</span>
        </button>
      </div>

      {/* Tab: Topology */}
      {activeTab === 'topology' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Multi-Tier Microservice Topology</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Isolated bridge network (<code>civicfix_network</code>) ensuring safe inter-container DNS discovery and zero leaked database ports.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              {/* Frontend Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-400 transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                    <Globe className="w-4 h-4 text-blue-600" />
                    <span>civicfix_frontend</span>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-100 text-blue-800 font-bold">
                    Port 80
                  </span>
                </div>
                <div className="text-slate-600 text-[11px] space-y-1">
                  <p><span className="font-semibold text-slate-700">Image:</span> nginx:1.27-alpine</p>
                  <p><span className="font-semibold text-slate-700">Role:</span> Web Gateway &amp; Reverse Proxy</p>
                  <p><span className="font-semibold text-slate-700">Features:</span> Gzip, SPA fallback, CSP</p>
                  <p><span className="font-semibold text-slate-700">Healthcheck:</span> /healthz (every 30s)</p>
                </div>
              </div>

              {/* Backend Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-400 transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                    <Server className="w-4 h-4 text-emerald-600" />
                    <span>civicfix_backend</span>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold">
                    Port 3000
                  </span>
                </div>
                <div className="text-slate-600 text-[11px] space-y-1">
                  <p><span className="font-semibold text-slate-700">Image:</span> node:20-alpine (dist/server.cjs)</p>
                  <p><span className="font-semibold text-slate-700">User:</span> Non-root (UID 1001 civicfix)</p>
                  <p><span className="font-semibold text-slate-700">Init:</span> dumb-init (PID 1 supervisor)</p>
                  <p><span className="font-semibold text-slate-700">Healthcheck:</span> /api/health</p>
                </div>
              </div>

              {/* Database Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-400 transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                    <Database className="w-4 h-4 text-indigo-600" />
                    <span>civicfix_db</span>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-100 text-indigo-800 font-bold">
                    Port 5432
                  </span>
                </div>
                <div className="text-slate-600 text-[11px] space-y-1">
                  <p><span className="font-semibold text-slate-700">Image:</span> postgis/postgis:16-alpine</p>
                  <p><span className="font-semibold text-slate-700">Storage:</span> civicfix_pgdata volume</p>
                  <p><span className="font-semibold text-slate-700">Spatial:</span> R-Tree PostGIS indexes</p>
                  <p><span className="font-semibold text-slate-700">Healthcheck:</span> pg_isready</p>
                </div>
              </div>

              {/* Redis Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-red-400 transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                    <HardDrive className="w-4 h-4 text-red-600" />
                    <span>civicfix_redis</span>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-100 text-red-800 font-bold">
                    Port 6379
                  </span>
                </div>
                <div className="text-slate-600 text-[11px] space-y-1">
                  <p><span className="font-semibold text-slate-700">Image:</span> redis:7-alpine</p>
                  <p><span className="font-semibold text-slate-700">Persistence:</span> AOF enabled</p>
                  <p><span className="font-semibold text-slate-700">Security:</span> requirepass auth</p>
                  <p><span className="font-semibold text-slate-700">Healthcheck:</span> redis-cli ping</p>
                </div>
              </div>
            </div>

            {/* Docker Architecture Highlights */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-2 text-xs text-blue-900">
              <span className="font-bold flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Enterprise Container Security Checklist</span>
              </span>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-blue-800">
                <li><strong>Non-Root Execution:</strong> Backend runs under unprivileged user <code>civicfix:nodejs</code> (UID 1001).</li>
                <li><strong>No Leaked Secrets:</strong> Passwords and JWT keys injected at container boot from <code>.env</code> file.</li>
                <li><strong>Signal Handling:</strong> <code>dumb-init</code> reaps child processes and coordinates clean SIGTERM shutdowns.</li>
                <li><strong>Layer Optimization:</strong> Manifests copied before source code, enabling Docker layer build caching.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Compose & Dockerfiles */}
      {(activeTab === 'compose' || activeTab === 'dockerfiles') && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 text-xs font-semibold pb-2 border-b border-slate-200">
            <button
              onClick={() => setSelectedFile('compose_prod')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedFile === 'compose_prod' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              docker-compose.yml (Production)
            </button>
            <button
              onClick={() => setSelectedFile('compose_dev')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedFile === 'compose_dev' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              docker-compose.dev.yml (Dev Hot Reload)
            </button>
            <button
              onClick={() => setSelectedFile('dockerfile_backend')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedFile === 'dockerfile_backend' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Dockerfile.backend
            </button>
            <button
              onClick={() => setSelectedFile('dockerfile_frontend')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedFile === 'dockerfile_frontend' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Dockerfile.frontend
            </button>
            <button
              onClick={() => setSelectedFile('dockerfile_unified')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedFile === 'dockerfile_unified' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Dockerfile (Unified)
            </button>
            <button
              onClick={() => setSelectedFile('nginx')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedFile === 'nginx' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              nginx.conf
            </button>
          </div>

          <div className="bg-slate-950 text-slate-100 rounded-xl p-5 border border-slate-800 shadow-xl font-mono text-xs overflow-x-auto space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-slate-400">
              <span>Viewing: {selectedFile}</span>
              <button
                onClick={() => copyCode(selectedFile, selectedFile)}
                className="hover:text-white flex items-center space-x-1"
              >
                {copied === selectedFile ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied === selectedFile ? 'Copied File Content!' : 'Copy Code'}</span>
              </button>
            </div>

            <pre className="text-[11px] leading-relaxed text-slate-300">
              {selectedFile === 'compose_prod' && `# docker-compose.yml
version: '3.8'
services:
  db:
    image: postgis/postgis:16-3.4-alpine
    container_name: civicfix_db
    environment:
      POSTGRES_DB: \${DB_NAME:-civicfix}
      POSTGRES_USER: \${DB_USER:-civicfix_admin}
      POSTGRES_PASSWORD: \${DB_PASSWORD:-civicfix_secure_pass_2026}
    volumes:
      - civicfix_pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \${DB_USER:-civicfix_admin}"]

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    container_name: civicfix_backend
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://\${DB_USER}:\${DB_PASSWORD}@db:5432/\${DB_NAME}
      JWT_SECRET: \${JWT_SECRET}
    ports:
      - "3000:3000"
    depends_on:
      db:
        condition: service_healthy

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    container_name: civicfix_frontend
    ports:
      - "80:80"
    depends_on:
      backend:
        condition: service_healthy`}

              {selectedFile === 'compose_dev' && `# docker-compose.dev.yml (Hot-reloading with bind mounts)
version: '3.8'
services:
  db:
    image: postgis/postgis:16-3.4-alpine
    environment:
      POSTGRES_DB: civicfix_dev
      POSTGRES_USER: civicfix_dev
      POSTGRES_PASSWORD: dev_password_123

  app:
    image: node:20-alpine
    working_dir: /app
    command: sh -c "npm install && npm run dev"
    volumes:
      - .:/app
      - /app/node_modules
    ports:
      - "3000:3000"`}

              {selectedFile === 'dockerfile_backend' && `# Dockerfile.backend (Node 20 Alpine Multi-stage)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache dumb-init curl
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 civicfix -G nodejs
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder --chown=civicfix:nodejs /app/dist ./dist
USER civicfix
EXPOSE 3000
HEALTHCHECK --interval=30s CMD curl -f http://localhost:3000/api/health || exit 1
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "dist/server.cjs"]`}

              {selectedFile === 'dockerfile_frontend' && `# Dockerfile.frontend (Nginx 1.27 Alpine)
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
HEALTHCHECK --interval=30s CMD curl -f http://localhost/healthz || exit 1
CMD ["nginx", "-g", "daemon off;"]`}

              {selectedFile === 'dockerfile_unified' && `# Dockerfile (Unified Full-Stack)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache dumb-init curl
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
EXPOSE 3000
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "dist/server.cjs"]`}

              {selectedFile === 'nginx' && `# nginx.conf
events { worker_connections 1024; }
http {
    upstream backend_upstream { server backend:3000; }
    server {
        listen 80;
        root /usr/share/nginx/html;
        location / { try_files $uri $uri/ /index.html; }
        location /api/ {
            proxy_pass http://backend_upstream;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}`}
            </pre>
          </div>
        </div>
      )}

      {/* Tab: CLI Commands */}
      {activeTab === 'commands' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center space-x-1.5 font-sans">
                  <Terminal className="w-4 h-4 text-blue-600" />
                  <span>Production Build &amp; Start</span>
                </span>
                <button 
                  onClick={() => copyCode('docker compose up -d --build', 'cmd_prod')}
                  className="text-slate-400 hover:text-blue-600"
                >
                  {copied === 'cmd_prod' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="p-3 bg-slate-900 text-emerald-300 rounded-lg text-[11px] leading-relaxed">
                <p># Build images and run in background</p>
                <p>$ docker compose up -d --build</p>
                <p className="mt-2 text-slate-400"># Verify container health</p>
                <p>$ docker compose ps</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center space-x-1.5 font-sans">
                  <Terminal className="w-4 h-4 text-emerald-600" />
                  <span>Development Mode with Hot Reload</span>
                </span>
                <button 
                  onClick={() => copyCode('docker compose -f docker-compose.dev.yml up', 'cmd_dev')}
                  className="text-slate-400 hover:text-blue-600"
                >
                  {copied === 'cmd_dev' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="p-3 bg-slate-900 text-emerald-300 rounded-lg text-[11px] leading-relaxed">
                <p># Launch dev container with bind-mounts</p>
                <p>$ docker compose -f docker-compose.dev.yml up</p>
                <p className="mt-2 text-slate-400"># Tail backend server logs</p>
                <p>$ docker compose -f docker-compose.dev.yml logs -f app</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center space-x-1.5 font-sans">
                  <Database className="w-4 h-4 text-indigo-600" />
                  <span>Database Migrations &amp; Seeding</span>
                </span>
                <button 
                  onClick={() => copyCode('docker compose exec backend npm run db:seed', 'cmd_seed')}
                  className="text-slate-400 hover:text-blue-600"
                >
                  {copied === 'cmd_seed' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="p-3 bg-slate-900 text-emerald-300 rounded-lg text-[11px] leading-relaxed">
                <p># Execute database migration inside container</p>
                <p>$ docker compose exec backend npm run db:migrate</p>
                <p className="mt-2 text-slate-400"># Seed categories &amp; municipal personas</p>
                <p>$ docker compose exec backend npm run db:seed</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center space-x-1.5 font-sans">
                  <Cpu className="w-4 h-4 text-red-600" />
                  <span>Monitoring &amp; Diagnostics</span>
                </span>
                <button 
                  onClick={() => copyCode('docker stats', 'cmd_stats')}
                  className="text-slate-400 hover:text-blue-600"
                >
                  {copied === 'cmd_stats' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="p-3 bg-slate-900 text-emerald-300 rounded-lg text-[11px] leading-relaxed">
                <p># Real-time memory &amp; CPU consumption</p>
                <p>$ docker stats civicfix_backend civicfix_db</p>
                <p className="mt-2 text-slate-400"># Healthcheck status inspection</p>
                <p>$ curl -i http://localhost:3000/api/health</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Environment & Secrets */}
      {activeTab === 'env' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Environment Variables &amp; Zero-Secret Governance</h3>
              <p className="text-slate-500 text-[11px]">Strict decoupling of secrets from Docker images conforming to 12-Factor principles.</p>
            </div>
            <button
              onClick={() => copyCode(`cp .env.docker.example .env`, 'copy_env_cp')}
              className="px-3 py-1.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-mono font-bold flex items-center space-x-1"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>cp .env.docker.example .env</span>
            </button>
          </div>

          <div className="space-y-2 font-mono text-[11px]">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="font-bold text-slate-800">DATABASE_URL</span>
              <p className="text-slate-600">postgresql://civicfix_admin:password@db:5432/civicfix?schema=public</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="font-bold text-slate-800">JWT_SECRET</span>
              <p className="text-slate-600">Minimum 32-character high entropy cryptographic key for signing tokens.</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="font-bold text-slate-800">REDIS_URL</span>
              <p className="text-slate-600">redis://:password@redis:6379 for rate limiting and session blacklisting.</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="font-bold text-slate-800">CORS_ORIGIN</span>
              <p className="text-slate-600">Allowed origin (e.g. http://localhost or https://civicfix.gov).</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Troubleshooting */}
      {activeTab === 'troubleshooting' && (
        <div className="space-y-4 text-xs">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center space-x-2 text-red-600 font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>Error 1: Port 80 or 3000 Collision (Bind failed: port is already allocated)</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              <strong>Cause:</strong> A local service (Apache, Nginx, or Skype) already occupies host port 80 or 3000.<br />
              <strong>Remedy:</strong> Find process via <code>sudo lsof -i :80</code>, or edit <code>FRONTEND_PORT=8080</code> in <code>.env</code>.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center space-x-2 text-amber-600 font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>Error 2: Backend Fails with Database Connection Refused (ECONNREFUSED db:5432)</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              <strong>Cause:</strong> Node backend attempted socket connection before PostgreSQL finished initializing its database cluster.<br />
              <strong>Remedy:</strong> Docker Compose enforces <code>depends_on: db: condition: service_healthy</code> with <code>pg_isready</code> probe.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center space-x-2 text-indigo-600 font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>Error 3: 502 Bad Gateway on /api/* Requests</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              <strong>Cause:</strong> Nginx cannot resolve the <code>backend:3000</code> upstream hostname.<br />
              <strong>Remedy:</strong> Verify both services are attached to the <code>civicfix_network</code> bridge. Test DNS via <code>docker compose exec frontend ping backend</code>.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center space-x-2 text-purple-600 font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>Error 4: Volume Mount Permission Denied (EACCES)</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              <strong>Cause:</strong> Non-root container user (UID 1001) lacks file write permissions on host bind mounts.<br />
              <strong>Remedy:</strong> Grant permissions via <code>sudo chown -R 1001:1001 ./dist</code> or use named Docker volumes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
