export interface CryptoAlert {
    id: string;
    userId: string;
    cryptoId: string;
    thresholdPercentage: number;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}