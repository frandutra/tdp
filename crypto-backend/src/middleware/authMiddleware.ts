import { Response,Request, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from 'src/utils/logger';

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    logger.warn('Acceso denegado: no se proporcionó el token.');
    return res.status(403).json({ message: 'Acceso denegado: no se proporcionó el token.' });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET no está definido');
    }

    const decoded = jwt.verify(token, secret) as { userId: string };
    res.locals.userId = decoded.userId;
    logger.info(`Token verificado para el usuario ID: ${decoded.userId}`);
    next();

  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      logger.warn('Token expirado');
      return res.status(401).json({ message: 'El token ha expirado. Por favor, inicia sesión nuevamente.' });
    } else if (error.name === 'JsonWebTokenError') {
      logger.warn('Token inválido');
      return res.status(401).json({ message: 'Token inválido. Por favor, inicia sesión nuevamente.' });
    } else {
      logger.error(`Error en la autenticación del token: ${error}`);
      return res.status(500).json({ message: 'Error en la autenticación del token.' });
    }
  }
};
