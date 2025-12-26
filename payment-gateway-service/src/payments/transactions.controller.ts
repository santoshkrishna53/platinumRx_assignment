// src/payments/transactions.controller.ts
import { Controller, Post, Body, Get } from '@nestjs/common';
import { RoutingService } from './routing.service';
import { HealthService } from './health.service';
import { InitiateTransactionDto, CallbackDto } from './dto/payment.dto';

@Controller('transactions')
export class TransactionsController {
    private transactions = new Map<string, any>(); // In-memory DB mock

    constructor(
        private readonly routingService: RoutingService,
        private readonly healthService: HealthService,
    ) { }

    @Post('initiate')
    initiate(@Body() dto: InitiateTransactionDto) {
        const gateway = this.routingService.selectGateway();

        const transaction = {
            ...dto,
            transaction_id: `TXN_${Date.now()}`,
            gateway,
            status: 'pending',
        };

        this.transactions.set(dto.order_id, transaction);
        return transaction;
    }

    @Post('callback')
    callback(@Body() dto: CallbackDto) {
        const txn = this.transactions.get(dto.order_id);
        if (txn) {
            txn.status = dto.status;
            this.transactions.set(dto.order_id, txn);
        }

        this.healthService.recordCallback(dto.gateway, dto.status);
        return { message: 'Status updated', order_id: dto.order_id };
    }

    @Get('health-stats')
    getStats() {
        return this.healthService.getStats();
    }
}