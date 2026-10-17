import { Module, type DynamicModule } from '@nestjs/common';
import { HealthModule } from '@martronics/kit';
import type pg from 'pg';
import { AuthModule } from './auth/auth.module.js';
import { CatalogModule } from './catalog/catalog.module.js';
import type { AuthConfig } from './common/auth.js';
import type { PaymentProvider } from './orders/payment-provider.js';
import { DbModule, POOL } from './db/db.module.js';
import { OpenApiController } from './openapi.js';
import { OrdersModule } from './orders/orders.module.js';

@Module({})
export class AppModule {
  static register(
    databaseUrl: string,
    auth: AuthConfig,
    paymentProvider?: PaymentProvider,
  ): DynamicModule {
    return {
      module: AppModule,
      imports: [
        DbModule.forRoot(databaseUrl),
        AuthModule.forRoot(auth),
        HealthModule.registerAsync({
          inject: [POOL],
          useFactory: ((pool: pg.Pool) => ({
            database: async () => {
              await pool.query('select 1');
            },
          })) as never,
        }),
        CatalogModule,
        OrdersModule.register(paymentProvider),
      ],
      controllers: [OpenApiController],
    };
  }
}
