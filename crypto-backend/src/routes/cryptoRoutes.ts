import express from 'express';
import { CryptoController } from '../controllers/cryptoController';
import { verifyToken } from 'src/middleware/authMiddleware';
import { ApiCryptoProvider } from 'src/providers/ApiCryptoProvider';
import { AlertController } from '../controllers/alertController';

const router = express.Router();
const cryptoController = new CryptoController(new ApiCryptoProvider());
const alertController = new AlertController(new ApiCryptoProvider());

// Obtener todas las criptomonedas (protegido)
router.get('/cryptos', verifyToken, cryptoController.getCryptos);

// Obtener criptomonedas favoritas del usuario (protegido)
router.get('/cryptos/favorites', verifyToken, cryptoController.getUserCryptos);

// Obtener detalles de una criptomoneda específica (protegido)
router.get('/cryptos/:id', verifyToken, cryptoController.getCryptoDetails);

// Agregar una nueva criptomoneda (protegido)
router.post('/cryptos', verifyToken, cryptoController.addCrypto);

// Eliminar una criptomoneda específica (protegido)
router.delete('/cryptos/:id', verifyToken, cryptoController.deleteCrypto);

// Rutas de alertas
router.post('/alerts', verifyToken, alertController.createAlert);
router.get('/alerts', verifyToken, alertController.getUserAlerts);
router.delete('/alerts/:id', verifyToken, alertController.deleteAlert);
router.put('/alerts/:id', verifyToken, alertController.updateAlert);
router.patch('/alerts/:id/toggle', verifyToken, alertController.toggleAlert);
router.get('/alerts/:id/history', verifyToken, alertController.getAlertHistory);
router.get('/alert-history', verifyToken, alertController.getAllAlertHistory);

export default router;
