import cron from 'node-cron';
import { ApiCryptoProvider } from '../providers/ApiCryptoProvider';
import logger from '../utils/logger';

const cryptoProvider = new ApiCryptoProvider();

const checkAlertsJob = async () => {
    const startTime = Date.now();
    logger.info('Iniciando verificación de alertas');

    try {
        await cryptoProvider.checkAlerts();
        
        const duration = Date.now() - startTime;
        logger.info(`Verificación de alertas completada en ${duration}ms`);
    } catch (error) {
        logger.error(`Error crítico en verificación de alertas: ${error}`);
    }
};

cron.schedule('*/30 * * * *', checkAlertsJob, {
    scheduled: true,
    recoverMissedExecutions: true
});

const alertCheckTimeout = setTimeout(() => {
    logger.warn('La verificación de alertas está tomando más tiempo del esperado');
}, 20 * 60 * 1000); 