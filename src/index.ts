import dotenv from 'dotenv';
import app from './app';
import logger from './utils/logger';
import db from './config/database';

dotenv.config();

const PORT = process.env.PORT || 3000;

db.raw('SELECT 1')
  .then(() => {
    logger.info('Database connection established successfully');
    
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((error) => {
    logger.error('Unable to connect to database:', error);
    process.exit(1);
  });