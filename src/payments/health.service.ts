// src/payments/health.service.ts
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class HealthService {
    private readonly logger = new Logger(HealthService.name);
    private gatewayStats = new Map<string, any>();

    // Thresholds
    private readonly FAILURE_THRESHOLD = 0.1; // 10% failure = unhealthy
    private readonly WINDOW_MS = 15 * 60 * 1000; // 15 mins
    private readonly COOLDOWN_MS = 30 * 60 * 1000; // 30 mins

    recordCallback(gatewayId: string, status: 'success' | 'failure') {
        const stats = this.gatewayStats.get(gatewayId) || { total: 0, failures: [], unhealthyUntil: null };

        stats.total++;
        if (status === 'failure') {
            stats.failures.push(Date.now());
        }

        this.updateHealthStatus(gatewayId, stats);
        this.gatewayStats.set(gatewayId, stats);
    }

    private updateHealthStatus(gatewayId: string, stats: any) {
        const now = Date.now();
        // Filter failures within the 15-min window
        stats.failures = stats.failures.filter(timestamp => now - timestamp < this.WINDOW_MS);

        const failureRate = stats.failures.length / (stats.total || 1);

        if (failureRate >= this.FAILURE_THRESHOLD && stats.total > 5) {
            stats.unhealthyUntil = now + this.COOLDOWN_MS;
            this.logger.error(`🚨 Gateway ${gatewayId} tripped circuit! Disabled for 30 mins.`);
        }
    }

    isAvailable(gatewayId: string): boolean {
        const stats = this.gatewayStats.get(gatewayId);
        if (!stats || !stats.unhealthyUntil) return true;
        return Date.now() > stats.unhealthyUntil;
    }

    getStats() {
        return Object.fromEntries(this.gatewayStats);
    }
}