import app from './app.js';
import { appConfig } from './config/config.js';
import { createServer } from 'http';
import { socketService } from './services/socketService.js';

const port = appConfig.app.port;
const httpServer = createServer(app);

socketService.initialize(httpServer);

httpServer.listen(port, () => {
    console.log(`Server running on port ${port} in ${appConfig.app.env} mode`);
}); 