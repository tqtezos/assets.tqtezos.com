---
id: admin-lambda
title: Getting started with the AdminLambda contract
sidebar_label: AdminLambda Quick Start
---

## Introduction

The [AdminLambda](https://github.com/tqtezos/admin-lambda) contract
accepts a `lambda` from the `SENDER` in its storage and executes it.
That lambda may update the allowed-`SENDER` `address` in storage.

In other words, it's a modification of the
[Generic Multisig](https://github.com/murbard/smart-contracts/blob/master/multisig/michelson/generic.tz)
contract:
- The `(unit %default)` entrypoint is elided
- Only one administrator (so the `threshold = 1`)
- The signature check is replaced with a `SENDER` check
- The `change_keys` and `operation` entrypoints are combined

### Using Taquito

See the [taquito readme](https://github.com/tqtezos/admin-lambda/tree/012f6a0b3515bcdb223ee109478e6146a26f09cc/taquito)
in the [admin-lambda repo](https://github.com/tqtezos/admin-lambda)
for examples using [Taquito](https://github.com/ecadlabs/taquito).

## AdminLambda Contract

```haskell
parameter (lambda address (pair (list operation) address)) ;
storage address ;
code { DUP ;
       CAR ;
       SWAP ;
       CDR ;
       DUP ;
       SENDER ;
       COMPARE ;
       EQ ;
       IF { EXEC } { FAILWITH } }
```

Its storage is the administrator's `address`
and it has a single entrypoint:

```haskell
lambda address (pair (list operation)
                     address)
```

- The input to the `lambda` is the current administrator's `address`
- The output of the `lambda` is a list of `operation`'s to run and the new administrator's `address`
- The `lambda` gets `EXEC`uted if and only if `SENDER` is equal to the current administrator's address


### Origination

```bash
$ tezos-client --wait none originate contract AdminLambda \
  transferring 0 from $BOB_ADDRESS running \
  "$(curl https://raw.githubusercontent.com/tqtezos/admin-lambda/012f6a0b3515bcdb223ee109478e6146a26f09cc/admin_lambda.tz)" \
  --init "\"$BOB_ADDRESS\"" --burn-cap 0.354

  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   224  100   224    0     0   2382      0 --:--:-- --:--:-- --:--:--  2382
Waiting for the node to be bootstrapped before injection...
Current head: BKq3SE7psZ1H (timestamp: 2020-10-20T19:18:05-00:00, validation: 2020-10-20T19:18:34-00:00)
Node is bootstrapped, ready for injecting operations.
Estimated gas: 12274 units (will add 100 for safety)
Estimated storage: 354 bytes added (will add 20 for safety)
Operation successfully injected in the node.
Operation hash is 'ooLMGjrMMiKCxNXJDtVqeYfqcQZi3DA6Atcw2cFGmuDBvKqNcpC'
NOT waiting for the operation to be included.
Use command
  tezos-client wait for ooLMGjrMMiKCxNXJDtVqeYfqcQZi3DA6Atcw2cFGmuDBvKqNcpC to be included --confirmations 30 --branch BLLHBu4Gt9g9zMP8hNPamdh3kcvgzLHrKVGzn2UGF5kXPp7ti1n
and/or an external block explorer to make sure that it has been included.
This sequence of operations was run:
  Manager signed operations:
    From: tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm
    Fee to the baker: ꜩ0.001578
    Expected counter: 624033
    Gas limit: 12374
    Storage limit: 374 bytes
    Balance updates:
      tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm ............. -ꜩ0.001578
      fees(tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU,400) ... +ꜩ0.001578
    Origination:
      From: tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm
      Credit: ꜩ0
      Script:
        { parameter (lambda address (pair (list operation) address)) ;
          storage address ;
          code { DUP ;
                 CAR ;
                 SWAP ;
                 CDR ;
                 DUP ;
                 SENDER ;
                 COMPARE ;
                 EQ ;
                 IF { EXEC } { FAILWITH } } }
        Initial storage: "tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm"
        No delegate for this contract
        This origination was successfully applied
        Originated contracts:
          KT1JPmnRk2v9y9MEyCwges5is2reucDFgM7n
        Storage size: 97 bytes
        Paid storage size diff: 97 bytes
        Consumed gas: 12274
        Balance updates:
          tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm ... -ꜩ0.097
          tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm ... -ꜩ0.257

New contract KT1JPmnRk2v9y9MEyCwges5is2reucDFgM7n originated.
Contract memorized as AdminLambda.
```

Make a `bash` variable for it:

```bash
ADMIN_LAMBDA='KT1JPmnRk2v9y9MEyCwges5is2reucDFgM7n'
```

### Originate a `FA2`

See the [`FA2` SmartPy Tutorial](https://assets.tqtezos.com/docs/token-contracts/fa2/1-fa2-smartpy/)
for more detail.

Fetch the contract:

```bash
wget -O fa2_default.tz \
        'https://gitlab.com/smondet/fa2-smartpy/-/raw/a58e9f11/michelson/20200724-170337+0000_8cee712_contract.tz'
```

Originate it with Bob as the admin:

```bash
$ tezos-client --wait none originate contract myfa2 \
               transferring 0 from $BOB_ADDRESS \
               running fa2_default.tz \
               --init "(Pair (Pair \"$BOB_ADDRESS\" (Pair 0 {})) (Pair (Pair Unit {}) (Pair False {})))" \
               --burn-cap 10 \
               --no-print-source

Waiting for the node to be bootstrapped before injection...
Current head: BKuFW2Lm2U7X (timestamp: 2020-09-18T18:31:58-00:00, validation: 2020-09-18T18:32:51-00:00)
Node is bootstrapped, ready for injecting operations.
Estimated gas: 130465 units (will add 100 for safety)
Estimated storage: 4453 bytes added (will add 20 for safety)
Operation successfully injected in the node.
Operation hash is 'opFFjfYJj13SvsoHo1ZPe6AYCLoaqhB7ujwbkNjeM6kgE5d9KJX'
NOT waiting for the operation to be included.
Use command
  tezos-client wait for opFFjfYJj13SvsoHo1ZPe6AYCLoaqhB7ujwbkNjeM6kgE5d9KJX to be included --confirmations 30 --branch BKuFW2Lm2U7XDrbAjvrsg1tpUrqRFWE3mnN98mtfAAh1DpQsa6g
and/or an external block explorer to make sure that it has been included.
This sequence of operations was run:
  Manager signed operations:
    From: tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm
    Fee to the baker: ꜩ0.017402
    Expected counter: 624021
    Gas limit: 130565
    Storage limit: 4473 bytes
    Balance updates:
      tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm ............. -ꜩ0.017402
      fees(tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU,358) ... +ꜩ0.017402
    Origination:
      From: tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm
      Credit: ꜩ0
      Script:
        { ... }
        Initial storage:
          (Pair (Pair "tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm" (Pair 0 {}))
                (Pair (Pair Unit {}) (Pair False {})))
        No delegate for this contract
        This origination was successfully applied
        Originated contracts:
          KT1TUb1czajTExzPiSqaPBzDSYf85VqZ5PzT
        Storage size: 4196 bytes
        Updated big_maps:
          New map(18447) of type (big_map nat (pair (nat %token_id)
                (pair (string %symbol)
                      (pair (string %name) (pair (nat %decimals) (map %extras string string))))))
          New map(18446) of type (big_map (pair (address %owner) (address %operator)) unit)
          New map(18445) of type (big_map (pair address nat) nat)
        Paid storage size diff: 4196 bytes
        Consumed gas: 130465
        Balance updates:
          tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm ... -ꜩ4.196
          tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm ... -ꜩ0.257

New contract KT1TUb1czajTExzPiSqaPBzDSYf85VqZ5PzT originated.
Contract memorized as myfa2.
```

Make a `bash` variable for it:

```bash
FA2_ADDRESS='KT1TUb1czajTExzPiSqaPBzDSYf85VqZ5PzT'
```

Mint `100 TK0` tokens to Bob:

```bash
$ tezos-client transfer 0 from $BOB_ADDRESS to $FA2_ADDRESS \
                --entrypoint mint \
                --arg "(Pair (Pair \"$BOB_ADDRESS\" 100) (Pair \"TK0\" 0))" \
                --burn-cap 3

Waiting for the node to be bootstrapped before injection...
Current head: BLJF7Xu3bjHc (timestamp: 2020-09-18T18:38:28-00:00, validation: 2020-09-18T18:38:41-00:00)
Node is bootstrapped, ready for injecting operations.
Estimated gas: 114098 units (will add 100 for safety)
Estimated storage: 163 bytes added (will add 20 for safety)
Operation successfully injected in the node.
Operation hash is 'ooFdrXZeF1C4rB56fCkkHdiXXJ1amHX9s8X6NkLTSv52tV99vdK'
NOT waiting for the operation to be included.
Use command
  tezos-client wait for ooFdrXZeF1C4rB56fCkkHdiXXJ1amHX9s8X6NkLTSv52tV99vdK to be included --confirmations 30 --branch BLJF7Xu3bjHchanBUfqoGX96ndm4xUKbpsMkjiPx56ZiM94yeVN
and/or an external block explorer to make sure that it has been included.
This sequence of operations was run:
  Manager signed operations:
    From: tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm
    Fee to the baker: ꜩ0.011742
    Expected counter: 624022
    Gas limit: 114198
    Storage limit: 183 bytes
    Balance updates:
      tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm ............. -ꜩ0.011742
      fees(tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU,358) ... +ꜩ0.011742
    Transaction:
      Amount: ꜩ0
      From: tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm
      To: KT1TUb1czajTExzPiSqaPBzDSYf85VqZ5PzT
      Entrypoint: mint
      Parameter: (Pair (Pair "tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm" 100) (Pair "TK0" 0))
      This transaction was successfully applied
      Updated storage:
        (Pair (Pair 0x0000aad02222472cdf9892a3011c01caf6407f027081 (Pair 1 18445))
              (Pair (Pair Unit 18446) (Pair False 18447)))
      Updated big_maps:
        Set map(18447)[0] to (Pair 0 (Pair "TK0" (Pair "" (Pair 0 {}))))
        Set map(18445)[(Pair 0x0000aad02222472cdf9892a3011c01caf6407f027081 0)] to 100
      Storage size: 4359 bytes
      Paid storage size diff: 163 bytes
      Consumed gas: 114098
      Balance updates:
        tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm ... -ꜩ0.163
```

### Use Bob's `AdminLambda` to allow Fred to transfer 5 TK0

Bob transfers `5 TK0` tokens to his `AdminLambda` contract:

```bash
$ tezos-client transfer 0 from $BOB_ADDRESS to $FA2_ADDRESS \
                --entrypoint transfer \
                --arg "{ Pair \"$BOB_ADDRESS\" {Pair \"$ADMIN_LAMBDA\" (Pair 0 5)} }" \
                --burn-cap 0.067

Waiting for the node to be bootstrapped before injection...
Current head: BM4xHpzGufJ8 (timestamp: 2020-10-20T19:22:35-00:00, validation: 2020-10-20T19:22:58-00:00)
Node is bootstrapped, ready for injecting operations.
Estimated gas: 116167 units (will add 100 for safety)
Estimated storage: 67 bytes added (will add 20 for safety)
Operation successfully injected in the node.
Operation hash is 'oosmJywTSS3JnRbR1HsdL5zu1GQYHby9fCC4q1z3kwW4tvjQNCn'
Waiting for the operation to be included...

Fatal error:
  transfer simulation failed
```

Bob needs to set his `AdminLambda` contract's operator to Fred.

We'll need a `lambda` with the following type:

```haskell
lambda address (pair [operation] address)
```

The following `lambda`:
- Pushes the `FA2`'s address onto the stack and ensures it has the appropriate
  `update_operators` entrypoint
- Specifies that no Tez are transferred
- Sets the `AdminLambda`'s operator to Fred

```haskell
lambda address (pair [operation] address)

{ PUSH address "$FA2_ADDRESS%update_operators";
  CONTRACT (list (or (pair address address) (pair address address)));
  ASSERT_SOME;
  PUSH mutez 0;
  PUSH (list (or (pair address address) (pair address address))) { Left (Pair "$ADMIN_LAMBDA" "$FRED_ADDRESS") };
  TRANSFER_TOKENS;
  DIP { NIL operation };
  CONS;
  PAIR }
```

Bob submits it to his `AdminLambda`:

```bash
$ tezos-client transfer 0 from $BOB_ADDRESS to $ADMIN_LAMBDA \
  --arg "{ PUSH address \"$FA2_ADDRESS%update_operators\"; \
           CONTRACT (list (or (pair address address) (pair address address))); \
           ASSERT_SOME; \
           PUSH mutez 0; \
           PUSH (list (or (pair address address) (pair address address))) { Left (Pair \"$ADMIN_LAMBDA\" \"$FRED_ADDRESS\") }; \
           TRANSFER_TOKENS; \
           DIP { NIL operation }; \
           CONS; \
           PAIR }" \
  --burn-cap 0.067

Waiting for the node to be bootstrapped before injection...
Current head: BKoBfQSorZ37 (timestamp: 2020-10-20T19:24:05-00:00, validation: 2020-10-20T19:24:16-00:00)
Node is bootstrapped, ready for injecting operations.
Estimated gas: 196601 units (will add 100 for safety)
Estimated storage: 67 bytes added (will add 20 for safety)
Operation successfully injected in the node.
Operation hash is 'ooRx3BP765gfoAHSViwsi59kT14m3twYR6Je8arjbeuRxBDPcE3'
Waiting for the operation to be included...

Fatal error:
  transfer simulation failed
```

### Using Fred's allowance

Fred can now transfer up to `5 TK0` tokens from Bob's `AdminLambda`.

Here, Fred transfers `3 TK0` tokens to Alice:

```bash
$ tezos-client transfer 0 from $FRED_ADDRESS to $FA2_ADDRESS \
                --entrypoint transfer \
                --arg "{ Pair \"$ADMIN_LAMBDA\" {Pair \"$ALICE_ADDRESS\" (Pair 0 3)} }" \
                --burn-cap 0.000001
Waiting for the node to be bootstrapped before injection...
Current head: BMLZuUTzRMXJ (timestamp: 2020-10-20T19:25:05-00:00, validation: 2020-10-20T19:25:23-00:00)
Node is bootstrapped, ready for injecting operations.
Estimated gas: 118401 units (will add 100 for safety)
Estimated storage: no bytes added
Operation successfully injected in the node.
Operation hash is 'ooHWig3nx85C3eQSbAskdLUY2gpmm9eU5VFSPP2igqqoffBog5Z'
Waiting for the operation to be included...
```

By inspecting the resulting operation hash, we can see that the `AdminLambda`'s
balance of `TK0` tokens is now `2` and Alice's balance `TK0` tokens has
increased from `3` to `6`:

```bash
$ tezos-client get receipt for 'ooHWig3nx85C3eQSbAskdLUY2gpmm9eU5VFSPP2igqqoffBog5Z'

Operation found in block: BLFyfJyNxDmdMMQEXDYyfFW1s8U9vTE2FPWArsPySFsfeTTvA8o (pass: 3, offset: 0)
Manager signed operations:
  From: tz1RwoEdg4efDQHarsw6aKtMUYvg278Gv1ir
  Fee to the baker: ꜩ0.012218
  Expected counter: 623982
  Gas limit: 118501
  Storage limit: 0 bytes
  Balance updates:
    tz1RwoEdg4efDQHarsw6aKtMUYvg278Gv1ir ............. -ꜩ0.012218
    fees(tz1VxS7ff4YnZRs8b4mMP4WaMVpoQjuo1rjf,400) ... +ꜩ0.012218
  Transaction:
    Amount: ꜩ0
    From: tz1RwoEdg4efDQHarsw6aKtMUYvg278Gv1ir
    To: KT1TUb1czajTExzPiSqaPBzDSYf85VqZ5PzT
    Entrypoint: transfer
    Parameter: { Pair "KT1JPmnRk2v9y9MEyCwges5is2reucDFgM7n"
                      { Pair "tz1R3vJ5TV8Y5pVj8dicBR23Zv8JArusDkYr" (Pair 0 3) } }
    This transaction was successfully applied
    Updated storage:
      (Pair (Pair 0x0000aad02222472cdf9892a3011c01caf6407f027081 (Pair 1 18445))
            (Pair (Pair Unit 18446) (Pair False 18447)))
    Updated big_maps:
      Set map(18445)[(Pair 0x00003b5d4596c032347b72fb51f688c45200d0cb50db 0)] to 6
      Set map(18445)[(Pair 0x016b9cdd4f804139c0bd9918fa28da3b2581c17e5900 0)] to 2
    Storage size: 4694 bytes
    Consumed gas: 118401
```

