# ADR-0004: Checkout settles stock and price in the database

**Status:** accepted

The legacy checkout read stock, compared in JavaScript and wrote it back, so two simultaneous
orders could both pass. Checkout now takes stock with one conditional
`UPDATE ... WHERE stock >= quantity RETURNING name, price`, one row at a time in a fixed (product
id) order so overlapping carts cannot deadlock. The price snapshot comes from the row that update
locked, never from the client or from an earlier read. Any short line aborts the whole
transaction, so an order is all or nothing. Checkout takes no body: the cart on the server is the
only input. A repeated `Idempotency-Key` returns the stored response; the key is claimed inside
the same transaction, so a double-click yields one order.

Payment never holds a database transaction open across the gateway call: a pending payment is
committed first, the gateway is called, then a second transaction settles it. A charge that
succeeds for an order cancelled in the meantime is recorded and queued for refund (outbox topic
`payment.refund-required`). A unique partial index allows at most one successful payment per
order.
