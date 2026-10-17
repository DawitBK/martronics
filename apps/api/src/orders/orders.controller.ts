import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { ZodValidationPipe } from '@martronics/kit';
import type { Response } from 'express';
import { CurrentUser, Roles, STAFF, type Principal } from '../common/auth.js';
import {
  checkoutSchema,
  createPaymentSchema,
  idempotencyHeaderSchema,
  idParamsSchema,
  listOrdersQuerySchema,
  type CreatePayment,
  type ListOrdersQuery,
} from './orders.contract.js';
import { OrdersService } from './orders.service.js';

const idParams = new ZodValidationPipe(idParamsSchema);

@Controller('api/v1/orders')
export class OrdersController {
  constructor(@Inject(OrdersService) private readonly orders: OrdersService) {}

  /** Checkout: builds the order from the caller's own cart. */
  @Post()
  async checkout(
    @CurrentUser() user: Principal,
    @Req() req: { headers: unknown },
    @Body(new ZodValidationPipe(checkoutSchema)) _body: unknown,
    @Res({ passthrough: true }) res: Response,
  ) {
    const headers = idempotencyHeaderSchema.parse(req.headers);
    const result = await this.orders.checkout(user, headers['idempotency-key']);
    res.status(result.status);
    if (result.replayed) res.setHeader('Idempotent-Replay', 'true');
    return result.body;
  }

  @Get()
  list(
    @CurrentUser() user: Principal,
    @Query(new ZodValidationPipe(listOrdersQuerySchema)) query: ListOrdersQuery,
  ) {
    return this.orders.list(user, query);
  }

  @Get(':id')
  get(@CurrentUser() user: Principal, @Param(idParams) p: { id: string }) {
    return this.orders.get(user, p.id);
  }

  @Post(':id/cancel')
  @HttpCode(200)
  cancel(@CurrentUser() user: Principal, @Param(idParams) p: { id: string }) {
    return this.orders.cancel(user, p.id);
  }

  @Roles(...STAFF)
  @Post(':id/fulfill')
  @HttpCode(200)
  fulfill(@CurrentUser() user: Principal, @Param(idParams) p: { id: string }) {
    return this.orders.fulfill(user, p.id);
  }

  @Post(':id/payments')
  pay(
    @CurrentUser() user: Principal,
    @Param(idParams) p: { id: string },
    @Body(new ZodValidationPipe(createPaymentSchema)) body: CreatePayment,
  ) {
    return this.orders.pay(user, p.id, body);
  }

  @Get(':id/payments')
  listPayments(@CurrentUser() user: Principal, @Param(idParams) p: { id: string }) {
    return this.orders.listPayments(user, p.id);
  }
}
