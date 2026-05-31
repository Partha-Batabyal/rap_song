import jwt from 'jsonwebtoken';
import { dbService } from '../services/dbService.js';

export const protect = async (req, res, next) => {
  let token;

  // Read token from authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'rapvault_super_secret_jwt_key_999123');

      // Get user from database service
      const user = await dbService.findUserById(decoded.id);

      if (!user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // Attach user object to request
      req.user = user;
      next();
    } catch (error) {
      console.error('JWT Token Verification Error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};
