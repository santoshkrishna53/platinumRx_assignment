import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TransactionsController } from './payments/transactions.controller';
import { RoutingService } from './payments/routing.service';
import { HealthService } from './payments/health.service';

@Module({
  imports: [],
  controllers: [AppController, TransactionsController],
  providers: [AppService, RoutingService, HealthService],
})
export class AppModule {}
