// src/payments/dto/payment.dto.ts
import { IsString, IsNumber, IsObject, IsNotEmpty, IsIn } from 'class-validator';

export class InitiateTransactionDto {
    @IsString()
    @IsNotEmpty()
    order_id: string;

    @IsNumber()
    amount: number;

    @IsObject()
    payment_instrument: {
        type: string;
        card_number: string;
        expiry: string;
    };
}

export class CallbackDto {
    @IsString()
    order_id: string;

    @IsString()
    @IsIn(['success', 'failure'])
    status: 'success' | 'failure';

    @IsString()
    gateway: string;

    @IsString()
    reason?: string;
}