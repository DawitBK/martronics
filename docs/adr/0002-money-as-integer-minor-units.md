# ADR-0002: Money is integer minor units

**Status:** accepted

Prices, totals and payment amounts are `bigint` columns holding santim (1 ETB = 100 santim), and
JSON numbers that are whole integers. The legacy app stored `DECIMAL(10,2)` and did arithmetic on
JavaScript numbers. Integers make sums exact, make the contract unambiguous (`12050`, never
`120.5` or `"120.50"`), and let the database enforce `>= 0` with a check constraint. A currency
column exists on orders and payments (always `ETB` today) so a second currency is a data change.

**Rejected:** `numeric` strings (every client must parse them), floats (rounding).
