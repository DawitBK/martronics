export const PAYMENT_PROVIDER = 'PAYMENT_PROVIDER';

export interface ChargeRequest {
  /** Stable per payment attempt; providers use it to refuse a double charge. */
  reference: string;
  amountMinor: number;
  currency: string;
  method: string;
}

export interface ChargeResult {
  status: 'succeeded' | 'failed';
  providerRef: string;
}

/**
 * The seam to a real gateway (for example Chapa, Telebirr or Stripe). Orders only ever call this
 * port, so adding a provider means one new class and no change to order logic.
 */
export interface PaymentProvider {
  readonly name: string;
  charge(request: ChargeRequest): Promise<ChargeResult>;
}

/** Deterministic stand-in used in development and tests: it approves every charge. */
export class TestPaymentProvider implements PaymentProvider {
  readonly name = 'test';

  async charge(request: ChargeRequest): Promise<ChargeResult> {
    return { status: 'succeeded', providerRef: `test_${request.reference}` };
  }
}
