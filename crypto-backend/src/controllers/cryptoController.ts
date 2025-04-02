import { Response, Request } from 'express';
import { CryptoProvider } from 'src/providers/cryptoProvider';
import { Crypto } from 'src/interfaces/Crypto';
import logger from 'src/utils/logger';

export class CryptoController {
  cryptoProvider: CryptoProvider;

  constructor(cryptoProvider: CryptoProvider) {
    this.cryptoProvider = cryptoProvider;
  }

  addCrypto = async (req: Request, res: Response) => {
    const userId = res.locals.userId;
    const { id, name, symbol, price, trend } = req.body;

    try {
      if (!userId || !id || !name || !symbol || price === undefined || trend === undefined) {
        logger.warn('Datos faltantes al intentar añadir una criptomoneda');
        return res.status(400).json({ error: 'Faltan datos requeridos.' });
      }

      const newCrypto: Crypto = await this.cryptoProvider.addCrypto(userId, id, name, symbol, price, trend);
      logger.info(`Criptomoneda añadida: ${name} (ID: ${id}) para el usuario ${userId}`);
      res.status(201).json(newCrypto);
    } catch (error) {
      logger.error(`Error al añadir la criptomoneda: ${error}`);
      res.status(500).json({ error: 'Error al añadir la criptomoneda.' });
    }
  };

  getCryptos = async (req: Request, res: Response) => {
    try {
      const cryptos: Crypto[] = await this.cryptoProvider.getCryptos();
      logger.info(`Criptomonedas obtenidas`);
      res.status(200).json(cryptos);
    } catch (error) {
      logger.error(`Error al obtener criptomonedas: ${error}`);
      res.status(500).json({ error: 'Error al obtener criptomonedas' });
    }
  };
  
  getUserCryptos = async (req: Request, res: Response) => {
    const userId = res.locals.userId;

    if (!userId) {
      logger.warn('ID de usuario no válido al intentar obtener criptomonedas del usuario');
      return res.status(400).json({ message: 'ID de usuario no válido.' });
    }

    try {
      const userCryptos: Crypto[] = await this.cryptoProvider.getUserCryptos(userId);
      logger.info(`Criptomonedas obtenidas para el usuario: ${userId}`);
      res.status(200).json(userCryptos);
    } catch (error) {
      logger.error(`Error al obtener las criptomonedas del usuario: ${error}`);
      res.status(500).json({ error: 'Error al obtener las criptomonedas del usuario' });
    }
  };

  getCryptoDetails = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = res.locals.userId;

    try {
      const { crypto, priceHistory } = await this.cryptoProvider.getCryptoDetails(id, userId);
      logger.info(`Detalles de criptomoneda obtenidos: ${crypto.name} (ID: ${id}) para el usuario ${userId}`);
      res.status(200).json({ crypto, priceHistory });
    } catch (error) {
      logger.error(`Error al obtener detalles de la criptomoneda: ${error}`);
      res.status(500).json({ error: 'Error al obtener detalles de la criptomoneda' });
    }
  };

  deleteCrypto = async (req: Request, res: Response) => {
    const userId = res.locals.userId;
    const cryptoId = req.params.id;

    try {
      await this.cryptoProvider.deleteCrypto(cryptoId, userId);
      logger.info(`Criptomoneda eliminada (ID: ${cryptoId}) para el usuario ${userId}`);
      res.status(204).send();
    } catch (error) {
      logger.error(`Error al eliminar la criptomoneda: ${error}`);
      res.status(500).json({ error: 'Error al eliminar la criptomoneda' });
    }
  };
}
