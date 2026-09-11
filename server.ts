/**
 * CivicFix Express Backend Server Entry Point
 */
import express from 'express';
import path from 'path';
import { backend } from './src/backend';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const sendApiResponse = (res: express.Response, result: any) => {
    if ('data' in result) {
      res.status(result.status).json(result.data);
    } else {
      res.status(result.status).json(result.body);
    }
  };

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'CivicFix Municipal Backend', timestamp: new Date().toISOString() });
  });

  // Swagger Documentation
  app.get('/api/v1/swagger.json', (req, res) => {
    res.json(backend.swaggerSpec);
  });

  // Auth Routes
  app.post('/api/v1/auth/register', async (req, res) => {
    const response = await backend.authController.register(req.body);
    sendApiResponse(res, response);
  });

  app.post('/api/v1/auth/login', async (req, res) => {
    const response = await backend.authController.login(req.body);
    sendApiResponse(res, response);
  });

  app.get('/api/v1/auth/me', async (req, res) => {
    const response = await backend.authController.getCurrentUser(req as any);
    sendApiResponse(res, response);
  });

  app.post('/api/v1/auth/refresh-token', async (req, res) => {
    const response = await backend.authController.refreshToken(req.body);
    sendApiResponse(res, response);
  });

  app.post('/api/v1/auth/logout', async (req, res) => {
    const response = await backend.authController.logout(req as any);
    sendApiResponse(res, response);
  });

  // Citizen Issue Reporting Routes
  app.post('/api/v1/citizen/issues', async (req, res) => {
    const response = await backend.issueController.createIssue(req as any, req.body);
    sendApiResponse(res, response);
  });

  app.get('/api/v1/citizen/issues', async (req, res) => {
    const response = await backend.issueController.getMyIssues(req as any, req.query as any);
    sendApiResponse(res, response);
  });

  app.get('/api/v1/citizen/issues/:id', async (req, res) => {
    const response = await backend.issueController.getIssueById(req as any, req.params.id);
    sendApiResponse(res, response);
  });

  // Public Issue Tracking & Reference Data
  app.get('/api/v1/public/issues/:code', async (req, res) => {
    const response = await backend.issueController.trackPublicIssue(req.params.code);
    sendApiResponse(res, response);
  });

  app.get('/api/v1/public/categories', async (req, res) => {
    const response = await backend.issueController.getCategories();
    sendApiResponse(res, response);
  });

  // Vite middleware for development vs static dist for production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CivicFix Backend Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
