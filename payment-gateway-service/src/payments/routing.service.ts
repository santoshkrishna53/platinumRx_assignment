// src/payments/routing.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HealthService } from './health.service';

@Injectable()
export class RoutingService {
    constructor(private readonly healthService: HealthService) { }

    private gateways = [
        { id: 'razorpay', weight: 70 },
        { id: 'payu', weight: 20 },
        { id: 'cashfree', weight: 10 },
    ];

    selectGateway(): string {
        const healthyGateways = this.gateways.filter(g => this.healthService.isAvailable(g.id));

        if (healthyGateways.length === 0) {
            throw new HttpException('All payment gateways are currently down.', HttpStatus.SERVICE_UNAVAILABLE);
        }

        const totalWeight = healthyGateways.reduce((sum, g) => sum + g.weight, 0);
        let random = Math.random() * totalWeight;

        for (const gateway of healthyGateways) {
            if (random < gateway.weight) return gateway.id;
            random -= gateway.weight;
        }

        return healthyGateways[0].id;
    }
}