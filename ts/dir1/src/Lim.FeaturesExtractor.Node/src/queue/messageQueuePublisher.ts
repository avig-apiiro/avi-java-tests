import axios from 'axios';
import { config } from '../config';
import { LimLogger } from '../internals/Logger';
import { QueueMessage } from './queueMessageTypes';

const instance = axios.create({
  baseURL: config.app.messageQueuePublisherBaseUrl,
  timeout: 15 * 1000
});

const logger = new LimLogger("PUBLISHER", __filename);

export const publishAsync = async (payload: QueueMessage): Promise<boolean> => {
  try{
    await instance.post('/api/publish', payload);
    return true;
  }
  catch (error){
    logger.error(`Failed to publish queue message, ${JSON.stringify(payload)}, ${error}\n${!error ? '' : error.stack}`);
    return false;
  }
}