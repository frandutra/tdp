import nodemailer from 'nodemailer';
import logger from '../utils/logger';

export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS 
            }
        });
    }

    async sendAlertEmail(to: string, cryptoName: string, currentPrice: number, thresholdPercentage: number, isCreation: boolean) {
        try {
            const subject = isCreation 
                ? `Alerta creada para ${cryptoName}`
                : `Alerta de Precio - ${cryptoName}`;
            
            const body = isCreation 
                ? `<p>Has creado una alerta para <strong>${cryptoName}</strong> con un umbral del ${thresholdPercentage}%.</p>`
                : `<p>Se ha detectado un cambio significativo en el precio de <strong>${cryptoName}</strong>.</p>
                   <p>Precio actual: ${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(currentPrice)}</p>
                   <p>Umbral configurado: ${thresholdPercentage}%</p>`;
    
            await this.transporter.sendMail({
                from: process.env.EMAIL_USER,
                to,
                subject,
                html: ` 
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h1 style="color: #333;">${subject}</h1>
                        ${body}
                        <hr>
                        <p style="color: #666; font-size: 12px;">Este es un mensaje automático, por favor no responder.</p>
                    </div>
                `
            });
    
            logger.info(`Correo enviado a ${to}: ${subject}`);
        } catch (error) {
            logger.error(`Error enviando email: ${error}`);
            throw error;
        }
    }

    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}
