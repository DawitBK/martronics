import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Put } from '@nestjs/common';
import { ZodValidationPipe } from '@martronics/kit';
import { CurrentUser, type Principal } from '../common/auth.js';
import { productParamsSchema, setCartItemSchema, type SetCartItem } from './cart.contract.js';
import { CartService } from './cart.service.js';

const productParams = new ZodValidationPipe(productParamsSchema);

/** The signed-in user's own cart. There is no cart id in any URL, so nobody can address another cart. */
@Controller('api/v1/cart')
export class CartController {
  constructor(@Inject(CartService) private readonly cart: CartService) {}

  @Get()
  get(@CurrentUser() user: Principal) {
    return this.cart.get(user);
  }

  @Put('items/:productId')
  setItem(
    @CurrentUser() user: Principal,
    @Param(productParams) p: { productId: string },
    @Body(new ZodValidationPipe(setCartItemSchema)) body: SetCartItem,
  ) {
    return this.cart.setItem(user, p.productId, body);
  }

  @Delete('items/:productId')
  removeItem(@CurrentUser() user: Principal, @Param(productParams) p: { productId: string }) {
    return this.cart.removeItem(user, p.productId);
  }

  @Delete()
  @HttpCode(204)
  async clear(@CurrentUser() user: Principal) {
    await this.cart.clear(user);
  }
}
