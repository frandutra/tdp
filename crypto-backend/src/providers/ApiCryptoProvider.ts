import axios from "axios";
import { CryptoProvider } from "./cryptoProvider";
import { Crypto } from 'src/interfaces/Crypto';
import prisma from "src/prismaClient";
import logger from "src/utils/logger";
import { CryptoAlert } from 'src/interfaces/CryptoAlert';
import { EmailService } from '../utils/emailService';

export class ApiCryptoProvider extends CryptoProvider {
    private emailService: EmailService;

    constructor() {
        super();
        this.emailService = new EmailService();
    }

    async addCrypto(userId: string, id: string, name: string, symbol: string, price: number, trend: number): Promise<Crypto> {
        try {
            return await prisma.cryptocurrency.create({
                data: {
                    id, 
                    user: {
                        connect: { id: userId },
                    },
                    name,
                    symbol,
                    price,
                    trend,
                },
            });
        } catch (error) {
            logger.error(`Error al agregar la criptomoneda para el usuario ${userId}: ${error}`);
            throw new Error('Error al agregar la criptomoneda');
        }
    }

    async getCryptos(): Promise<Crypto[]> { 
        try {
            const response = await axios.get('https://api.coincap.io/v2/assets');
            return response.data.data.map((crypto: any) => ({
                id: crypto.id,
                userId: '', 
                name: crypto.name,
                symbol: crypto.symbol,
                price: parseFloat(crypto.priceUsd) || 0,
                trend: parseFloat(crypto.changePercent24Hr) || 0, 
            }));
        } catch (error) {
            logger.error(`Error al obtener criptomonedas de la API externa: ${error}`);
            throw new Error('Error al obtener criptomonedas');
        }
    }

    async getUserCryptos(userId: string): Promise<Crypto[]> { 
        try {
            const cryptos = await prisma.cryptocurrency.findMany({
                where: {
                    userId: userId,
                },
            });
            logger.info(`Criptomonedas obtenidas para el usuario ${userId}`)
            return cryptos.map((crypto) => ({
                id: crypto.id,
                userId: crypto.userId,
                name: crypto.name,
                symbol: crypto.symbol,
                price: crypto.price,
                trend: crypto.trend,
            }));
        } catch (error) {
            logger.error(`Error al obtener criptomonedas del usuario ${userId}: ${error}`);
            throw new Error('Error al obtener criptomonedas del usuario');
        }
    }

    async deleteCrypto(cryptoId: string, userId: string): Promise<void> {
        try {
            await prisma.cryptocurrency.delete({
                where: {
                    id_userId: {
                        id: cryptoId,
                        userId: userId,
                    }
                }
            });
            logger.info(`Criptomoneda eliminada para el usuario ${userId}: ID ${cryptoId}`);
        } catch (error) {
            logger.error(`Error al eliminar la criptomoneda para el usuario ${userId}: ${error}`);
            throw new Error('Error al eliminar la criptomoneda');
        }
    }

    async getCryptoDetails(id: string, userId: string): Promise<{ crypto: Crypto; priceHistory: any[] }> { 
        try {
            const crypto = await prisma.cryptocurrency.findUnique({
                where: {
                    id_userId: {
                        id: id,   
                        userId: userId,  
                    },
                },
            });

            if (!crypto) {
                logger.warn(`Criptomoneda no encontrada para el usuario ${userId}: ID ${id}`);
                throw new Error('Criptomoneda no encontrada');
            }

            const historyResponse = await axios.get(`https://api.coincap.io/v2/assets/${id}/history?interval=d1&start=${Date.now() - 6 * 30 * 24 * 60 * 60 * 1000}&end=${Date.now()}`);
            logger.info(`Detalles de la criptomoneda obtenidos para el usuario ${userId}: ${crypto.name}`);
            
            return {
                crypto: {
                    id: crypto.id,
                    userId: crypto.userId, 
                    name: crypto.name,
                    symbol: crypto.symbol,
                    price: crypto.price,
                    trend: crypto.trend,
                },
                priceHistory: historyResponse.data.data,
            };
        } catch (error) {
            logger.error(`Error al obtener detalles de la criptomoneda para el usuario ${userId}: ${error}`);
            throw new Error('Error al obtener detalles de la criptomoneda');
        }
    }

    async createAlert(userId: string, cryptoId: string, thresholdPercentage: number): Promise<CryptoAlert> {
        try {
            const alert = await prisma.cryptoAlert.create({
                data: {
                    userId,
                    cryptoId,
                    thresholdPercentage,
                }
            });
    
            // Obtener el usuario y su email
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { email: true }
            });
    
            if (user?.email) {
                await this.emailService.sendAlertEmail(
                    user.email,
                    cryptoId,
                    0, // No se necesita precio actual en este caso
                    thresholdPercentage,
                    true
                );
            }
    
            return alert;
        } catch (error) {
            logger.error(`Error al crear alerta para el usuario ${userId}: ${error}`);
            throw new Error('Error al crear la alerta');
        }
    }
    

    async getUserAlerts(userId: string): Promise<CryptoAlert[]> {
        try {
            return await prisma.cryptoAlert.findMany({
                where: { userId, isActive: true },
                include: { cryptocurrency: true }
            });
        } catch (error) {
            logger.error(`Error al obtener alertas del usuario ${userId}: ${error}`);
            throw new Error('Error al obtener las alertas');
        }
    }

    async deleteAlert(alertId: string, userId: string): Promise<void> {
        try {
            await prisma.cryptoAlert.delete({
                where: {
                    id: alertId,
                    userId: userId
                }
            });
        } catch (error) {
            logger.error(`Error al eliminar alerta ${alertId}: ${error}`);
            throw new Error('Error al eliminar la alerta');
        }
    }

    async checkAlerts(): Promise<void> {
        try {
            const activeAlerts = await prisma.cryptoAlert.findMany({
                where: { isActive: true },
                include: { cryptocurrency: true, user: true }
            });
    
            for (const alert of activeAlerts) {
                try {
                    const currentPrice = await this.getCurrentPrice(alert.cryptoId);
                    const originalPrice = alert.cryptocurrency.price;
                    const priceChange = ((currentPrice - originalPrice) / originalPrice) * 100;
    
                    // Verificar si el valor absoluto del cambio de precio supera el umbral
                    if (Math.abs(priceChange) >= alert.thresholdPercentage) {
                        await this.handleAlert(alert, currentPrice, alert.user);
    
                        // Actualizar el precio almacenado para futuras comparaciones
                        await prisma.cryptocurrency.update({
                            where: { 
                                id_userId: { 
                                    id: alert.cryptoId, 
                                    userId: alert.userId 
                                } 
                            },
                            data: { price: currentPrice }
                        });
                    }
                } catch (errorProcesamientoAlerta) {
                    logger.error(`Error procesando alerta para cripto ${alert.cryptoId}: ${errorProcesamientoAlerta}`);
                    // Continuar procesando otras alertas incluso si una falla
                    continue;
                }
            }
        } catch (error) {
            logger.error(`Error verificando alertas: ${error}`);
            throw new Error('Error verificando alertas');
        }
    }

    async updateAlert(alertId: string, userId: string, updates: { isActive?: boolean, thresholdPercentage?: number }): Promise<CryptoAlert> {
        try {
            return await prisma.cryptoAlert.update({
                where: { id: alertId, userId: userId },
                data: updates
            });
        } catch (error) {
            logger.error(`Error al actualizar alerta ${alertId}: ${error}`);
            throw new Error('Error al actualizar la alerta');
        }
    }

    private async getCurrentPrice(cryptoId: string): Promise<number> {
        const response = await axios.get(`https://api.coincap.io/v2/assets/${cryptoId}`);
        return parseFloat(response.data.data.priceUsd);
    }

    private async handleAlert(alert: any, currentPrice: number, user: any) {
        try {
            await prisma.alertHistory.create({
                data: {
                    alertId: alert.id,
                    userId: alert.userId,
                    price: currentPrice,
                }
            });

            // Enviar email
            await this.emailService.sendAlertEmail(
                user.email,
                alert.cryptocurrency.name,
                currentPrice,
                alert.thresholdPercentage,
                false
            );

        } catch (error) {
            logger.error(`Error procesando alerta: ${error}`);
        }
    }
}