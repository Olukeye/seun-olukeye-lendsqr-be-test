import axios from 'axios';
import logger from '../../utils/logger';

const ADJUTOR_API_URL = process.env.ADJUTOR_API_URL || 'https://adjutor.lendsqr.com/v2';
const ADJUTOR_API_KEY = process.env.ADJUTOR_API_KEY || '';

export class AdjutorService {
  async checkBlacklist(identity: string): Promise<boolean> {
    try {
      const response = await axios.get(
        `${ADJUTOR_API_URL}/verification/karma/${identity}`,
        {
          headers: {
            Authorization: `Bearer ${ADJUTOR_API_KEY}`,
          },
          timeout: 5000,
        }
      );

      return response.data && response.data.status === 'success';
    } catch (error: any) {
      if (error.response?.status === 404) {
        return false;
      }

      logger.error('Adjutor API error:', error.message);

      return false;
    }
  }
}

export default new AdjutorService();