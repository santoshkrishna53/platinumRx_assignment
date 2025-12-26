// src/payments/health.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { StatsType } from './types/stats.type';

@Injectable()
export class HealthService {
    private readonly logger = new Logger(HealthService.name);
    private gatewayStats = new Map<string, StatsType>();

    // Thresholds
    private readonly FAILURE_THRESHOLD = 0.1; // 10% failure = unhealthy
    // private readonly WINDOW_MS = 15 * 60 * 1000; // 15 mins
    private readonly WINDOW_MS = 15 * 60 * 1000; // 5 mins
    private readonly COOLDOWN_MS = 30 * 60 * 1000; // 30 mins

    recordCallback(gatewayId: string, status: 'success' | 'failure', orderId: string) {
        let stats = this.gatewayStats.get(gatewayId);

        if (!stats) {
            stats = {
                total: 0,
                orders: [],
                unhealthyUntil: null,
                failures: 0,
            };
        }

        stats.orders.push({
            orderid: orderId,
            status: status,
            timestamp: Date.now()
        })

        this.updateHealthStatus(gatewayId, stats);
        this.gatewayStats.set(gatewayId, stats);
    }

    private updateHealthStatus(gatewayId: string, stats: StatsType) {
        const now = Date.now();

        // all orders in last window. 
        const orders = stats.orders.filter(order => now - order.timestamp < this.WINDOW_MS);
        const failedOrders = orders.filter(order => order.status === 'failure');
        const totalOrders = orders.length;
        // // Filter failures within the 15-min window
        // stats.failures = stats.orders.filter(order => {
        //     now - order.timestamp < this.WINDOW_MS
        // }).length;

        // const failedAttempts = stats.orders.filter(order => order.status === 'failure').length;

        // const totalStats = stats.filter(timestamp => now - timestamp < this.WINDOW_MS);

        const failureRate = failedOrders.length / (totalOrders || 1);

        if (failureRate >= this.FAILURE_THRESHOLD) {
            stats.unhealthyUntil = now + this.COOLDOWN_MS;
            this.logger.error(`🚨 Gateway ${gatewayId} tripped circuit! Disabled for 30 mins.`);
        }
    }

    isAvailable(gatewayId: string, orderId: string): boolean {
        const stats = this.gatewayStats.get(gatewayId);
        const orderAlreadyFailed = stats?.orders.find(order => order.orderid === orderId && order.status === 'failure');
        if(orderAlreadyFailed) return false;
        if (!stats || !stats.unhealthyUntil) return true;
        return Date.now() > stats.unhealthyUntil;
    }

    getStats() {
        return Object.fromEntries(this.gatewayStats);
    }
}