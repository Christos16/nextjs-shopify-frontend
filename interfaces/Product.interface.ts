export interface IProduct {
    name: string;
    category: string;
    price: number | string;
    commissionPercent?: number;
}