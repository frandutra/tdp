import { Request, Response } from 'express';
import { CryptoProvider } from 'src/providers/cryptoProvider';
import logger from 'src/utils/logger';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AlertController {
    constructor(private cryptoProvider: CryptoProvider) {}

    createAlert = async (req: Request, res: Response) => {
        const userId = res.locals.userId;
        const { cryptoId, thresholdPercentage } = req.body;

        try {
            const alert = await this.cryptoProvider.createAlert(
                userId,
                cryptoId,
                thresholdPercentage
            );
            logger.info(`Alerta creada para usuario ${userId}, crypto ${cryptoId}`);
            res.status(201).json(alert);
        } catch (error) {
            logger.error(`Error al crear alerta: ${error}`);
            res.status(500).json({ error: 'Error al crear la alerta' });
        }
    };

    getUserAlerts = async (req: Request, res: Response) => {
        const userId = res.locals.userId;

        try {
            const alerts = await this.cryptoProvider.getUserAlerts(userId);
            res.status(200).json(alerts);
        } catch (error) {
            logger.error(`Error al obtener alertas: ${error}`);
            res.status(500).json({ error: 'Error al obtener las alertas' });
        }
    };

    deleteAlert = async (req: Request, res: Response) => {
        const userId = res.locals.userId;
        const alertId = req.params.id;

        try {
            await this.cryptoProvider.deleteAlert(alertId, userId);
            res.status(204).send();
        } catch (error) {
            logger.error(`Error al eliminar alerta: ${error}`);
            res.status(500).json({ error: 'Error al eliminar la alerta' });
        }
    };

    updateAlert = async (req: Request, res: Response) => {
        const userId = res.locals.userId;
        const alertId = req.params.id;
        const { thresholdPercentage, isActive } = req.body;

        try {
            const alert = await this.cryptoProvider.updateAlert(
                alertId,
                userId,
                { thresholdPercentage, isActive }
            );
            logger.info(`Alerta ${alertId} actualizada para usuario ${userId}`);
            res.status(200).json(alert);
        } catch (error) {
            logger.error(`Error al actualizar alerta: ${error}`);
            res.status(500).json({ error: 'Error al actualizar la alerta' });
        }
    };

    toggleAlert = async (req: Request, res: Response) => {
        const userId = res.locals.userId;
        const alertId = req.params.id;
        const { isActive } = req.body;

        try {
            const alert = await this.cryptoProvider.updateAlert(
                alertId,
                userId,
                { isActive }
            );
            const status = isActive ? 'activada' : 'pausada';
            logger.info(`Alerta ${alertId} ${status} para usuario ${userId}`);
            res.status(200).json(alert);
        } catch (error) {
            logger.error(`Error al cambiar estado de alerta: ${error}`);
            res.status(500).json({ error: 'Error al cambiar estado de la alerta' });
        }
    };

    getAlertHistory = async (req: Request, res: Response) => {
        const userId = res.locals.userId;
        const alertId = req.params.id;

        try {
            const history = await prisma.alertHistory.findMany({
                where: {
                    alertId,
                    userId
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            res.status(200).json(history);
        } catch (error) {
            logger.error(`Error al obtener historial de alertas: ${error}`);
            res.status(500).json({ error: 'Error al obtener historial de alertas' });
        }
    };

    getAllAlertHistory = async (req: Request, res: Response) => {
        const userId = res.locals.userId;

        try {
            const history = await prisma.alertHistory.findMany({
                where: {
                    userId
                },
                include: {
                    alert: {
                        include: {
                            cryptocurrency: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            res.status(200).json(history);
        } catch (error) {
            logger.error(`Error al obtener historial de alertas: ${error}`);
            res.status(500).json({ error: 'Error al obtener historial de alertas' });
        }
    };
}