import { Module, type DynamicModule } from '@nestjs/common';
import { CartController } from '../cart/cart.controller.js';
import { CartService } from '../cart/cart.service.js';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';
import { PAYMENT_PROVIDER, TestPaymentProvider, type PaymentProvider } from './payment-provider.js';

@Module({})
export class OrdersModule {
  /** Pass a real gateway implementation (Chapa, Telebirr, Stripe) here; the default approves everything. */
  static register(provider: PaymentProvider = new TestPaymentProvider()): DynamicModule {
    return {
      module: OrdersModule,
      controllers: [CartController, OrdersController],
      providers: [CartService, OrdersService, { provide: PAYMENT_PROVIDER, useValue: provider }],
    };
  }
}
