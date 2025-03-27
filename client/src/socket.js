import { io } from 'socket.io-client';
import APP_URL from './components/config.js';

const socket = io(APP_URL, { transports: ['websocket'] });

export default socket;
