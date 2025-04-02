import { Crypto } from 'src/interfaces/Crypto';
import { CryptoAlert } from 'src/interfaces/CryptoAlert';

export abstract class CryptoProvider {
    abstract getCryptos(): Promise<Crypto[]>;

    abstract getUserCryptos(userId: string): Promise<Crypto[]>;

    abstract deleteCrypto(cryptoId: string, userId: string): Promise<void>;

    abstract addCrypto(
        userId: string,
        id: string,
        name: string,
        symbol: string,
        price: number,
        trend: number
    ): Promise<Crypto>; 

    abstract getCryptoDetails(id: string, userId: string): Promise<{ crypto: Crypto; priceHistory: any[] }>;

    abstract createAlert(
        userId: string,
        cryptoId: string,
        thresholdPercentage: number
    ): Promise<CryptoAlert>;

    abstract getUserAlerts(userId: string): Promise<CryptoAlert[]>;

    abstract deleteAlert(alertId: string, userId: string): Promise<void>;

    abstract checkAlerts(): Promise<void>;

    abstract updateAlert(alertId: string, userId: string, updates: { isActive?: boolean, thresholdPercentage?: number }): Promise<CryptoAlert>;
}