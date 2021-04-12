---
id: vesting
title: Getting started with the Vesting contract
sidebar_label: Vesting Contract Quick Start
---

# Introduction

A _money stream_ is a series of payments at regular intervals, such as a salary,
subscription, or other contractual disbursement.

The [_Vesting Contract_](https://github.com/tqtezos/vesting-contract) represents
an on-chain stream of Tez to a fixed address: the amount of available funds is
updated each second and anyone may vest available funds to the target address.

An example of the Vesting Contract may be found [on Edo2Net](https://better-call.dev/edo2net/KT1VdxSaoxxwBb7s9ZWDCbvR4NN54qfkwE1Q/operations).

## Use Cases

- Salaries
- Grants
  * Fund sub-projects over time
- Subscriptions
  * Content creation
  * Rent
  * Parking
  * CDPs
- Contracts
  * Consultancies
  * Vendors
- "Reversible" fundraising: introduced [at Devcon4 by @frozeman](https://cryptoindia.io/lukso-ama-recap/),
  investors' funds are held in streaming contracts and returned as the project evolves.

# Vesting Contract

The Vesting Contract holds Tez and periodically allows some of them to be
transferred to a fixed address, i.e. "_vested_":

```haskell
parameter (or (option %setDelegate key_hash)
              (nat %vest))
```

In particular, anyone may call `vest` with `(n %nat)`, transferring `n ticks`
worth of funds to the target `address`, or failing if `n ticks` have not passed
since the stream began.

The number of tokens that may be transferred at a given time is specified by a
"_vesting schedule_", which includes:
- `(start_time %timestamp)`: When the vesting begins
- `(nat %seconds_per_tick)`: The time period between allowing more Tez is a `tick`
- `(nat %mutez_per_tick)`: The number of additional `mutez` that may be vested
  each tick after `start_time`

## Vesting Schedule Example

Suppose we originate the contract with `60 mutez` and then set:
- `timestamp := now`
- `seconds_per_tick := 60`
- `mutez_per_tick := 1`

Then we can have the following scenarios:

- One minute after origination, anyone may trigger the flush of `1 mutez`.
- If no one flushes the contract after origination, `10 minutes` later,
  anyone may trigger the flush of _up to_ `10 Mutez`.
- If the maximum number is flushed `5 minutes` after origination (`5 Mutez`),
  anyone may flush up to `10 Mutez` `10 minutes` later
- One hour (`60 minutes`) after origination, the entire balance of the contract may be flushed.


## Setting Up

### Tezos-client

Follow instructions in [Client Setup](/docs/setup/1-tezos-client) to set up
  `tezos-client` and create a test network wallet with two addresses.

### Originate and Use

#### Storage

```ocaml
Pair (Pair target_address
           delegate_admin)
     (Pair vested_ticks
           (Pair start_time
                 (Pair seconds_per_tick
                       mutez_per_tick)))
```

- `(address %target_address)`: The `address` that Tez are vested to
- `(address %delegate_admin)`: The `address` that may call `setDelegate`
- `(nat %vested_ticks)`: This should be `0`; it represents the number of ticks
  already transferred (i.e. none at origination)
- `(start_time %timestamp)`: When the vesting begins
- `(nat %seconds_per_tick)`: The time period between allowing more Tez is a `tick`
- `(nat %mutez_per_tick)`: The number of additional `mutez` that may be vested
  each tick after `start_time`

We use the following storage values:

```bash
TARGET_ADDRESS="tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm"
DELEGATE_ADMIN_ADDRESS="tz1QS8VYYVDjv7iReBzXeheL6x63A1oATTj8"
START_TIME="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
SECONDS_PER_TICK=30
MUTEZ_PER_TICK=1
```

Replace `TARGET_ADDRESS` and `DELEGATE_ADMIN_ADDRESS` with your two addresses
from the [Client Setup](/docs/setup/1-tezos-client).

#### Origination

```bash
$ tezos-client --wait none originate contract VestingContract \
  transferring 1000 from tz1QS8VYYVDjv7iReBzXeheL6x63A1oATTj8 running \
  "$(curl https://raw.githubusercontent.com/tqtezos/vesting-contract/113508ec81eec9d59f7726b7ae51a16eafc07201/contracts/vesting_tez.tz)" \
  --init "Pair (Pair \"$TARGET_ADDRESS\" \
                     \"$DELEGATE_ADMIN_ADDRESS\") \
               (Pair 0 \
                     (Pair \"$START_TIME\" \
                           (Pair $SECONDS_PER_TICK \
                                 $MUTEZ_PER_TICK)))" \
  --burn-cap 0.21375

  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100  2702  100  2702    0     0  27855      0 --:--:-- --:--:-- --:--:-- 27855

Waiting for the node to be bootstrapped...
Current head: BML2zXFjbnbK (timestamp: 2021-04-12T19:27:33.000-00:00, validation: 2021-04-12T19:27:45.927-00:00)
Node is bootstrapped.
Estimated gas: 3968.092 units (will add 100 for safety)
Estimated storage: 855 bytes added (will add 20 for safety)
Operation successfully injected in the node.
Operation hash is 'oniSfreqxdhraBtLZQ3pfo61m2LTG12fHamhE29As2cVJZoZ9eg'
NOT waiting for the operation to be included.
Use command
  tezos-client wait for oniSfreqxdhraBtLZQ3pfo61m2LTG12fHamhE29As2cVJZoZ9eg to be included --confirmations 30 --branch BML2zXFjbnbK193FM83TzSiFdsNfBQkxR73yc6LvPn8TwCAzuvy
and/or an external block explorer to make sure that it has been included.
This sequence of operations was run:
  Manager signed operations:
    From: tz1QS8VYYVDjv7iReBzXeheL6x63A1oATTj8
    Fee to the baker: ꜩ0.001288
    Expected counter: 323911
    Gas limit: 4069
    Storage limit: 875 bytes
    Balance updates:
      tz1QS8VYYVDjv7iReBzXeheL6x63A1oATTj8 ................. -ꜩ0.001288
      fees(the baker who will include this operation,81) ... +ꜩ0.001288
    Origination:
      From: tz1QS8VYYVDjv7iReBzXeheL6x63A1oATTj8
      Credit: ꜩ1000
      Script:
        { parameter (or (option %setDelegate key_hash) (nat %vest)) ;
          storage
            (pair (pair %wrapped (address %target) (address %delegateAdmin))
                  (pair (nat %vested)
                        (pair %schedule (timestamp %epoch) (pair (nat %secondsPerTick) (nat %tokensPerTick))))) ;
          code { DUP ;
                 CAR ;
                 DIP { CDR } ;
                 IF_LEFT
                   { SWAP ;
                     DUP ;
                     DIP { CAR ;
                           CDR ;
                           SENDER ;
                           COMPARE ;
                           EQ ;
                           IF { DIP { NIL operation } ; SET_DELEGATE ; CONS } { FAILWITH } } ;
                     SWAP ;
                     PAIR }
                   { PAIR ;
                     DUP ;
                     CAR ;
                     DIP { CDR ;
                           DUP ;
                           DIP { CAR } ;
                           CDR ;
                           DUP ;
                           DIP { CDR } ;
                           DUP ;
                           CDR ;
                           DIP { CAR } } ;
                     DUP ;
                     DIP { DIP { DIP { DUP } ;
                                 DUP ;
                                 CAR ;
                                 NOW ;
                                 SUB ;
                                 DIP { CDR ; CAR } ;
                                 EDIV ;
                                 IF_NONE { FAILWITH } { CAR } ;
                                 SUB ;
                                 ISNAT } ;
                           SWAP ;
                           IF_NONE
                             { FAILWITH }
                             { DIP { DUP } ; SWAP ; COMPARE ; LE ; IF { ADD } { FAILWITH } } ;
                           DIP { DUP } ;
                           SWAP ;
                           DIP { PAIR ; SWAP ; DUP } ;
                           CDR ;
                           CDR } ;
                     MUL ;
                     SWAP ;
                     CAR ;
                     CONTRACT unit ;
                     IF_NONE
                       { FAILWITH }
                       { SWAP ;
                         PUSH mutez 1 ;
                         MUL ;
                         UNIT ;
                         TRANSFER_TOKENS ;
                         DIP { NIL operation } ;
                         CONS } ;
                     DIP { PAIR } ;
                     PAIR } } }
        Initial storage:
          (Pair (Pair "tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm" "tz1QS8VYYVDjv7iReBzXeheL6x63A1oATTj8")
                (Pair 0 (Pair "2021-04-12T19:26:15Z" (Pair 30 1))))
        No delegate for this contract
        This origination was successfully applied
        Originated contracts:
          KT1VdxSaoxxwBb7s9ZWDCbvR4NN54qfkwE1Q
        Storage size: 598 bytes
        Paid storage size diff: 598 bytes
        Consumed gas: 3968.092
        Balance updates:
          tz1QS8VYYVDjv7iReBzXeheL6x63A1oATTj8 ... -ꜩ0.1495
          tz1QS8VYYVDjv7iReBzXeheL6x63A1oATTj8 ... -ꜩ0.06425
          tz1QS8VYYVDjv7iReBzXeheL6x63A1oATTj8 ... -ꜩ1000
          KT1VdxSaoxxwBb7s9ZWDCbvR4NN54qfkwE1Q ... +ꜩ1000

New contract KT1VdxSaoxxwBb7s9ZWDCbvR4NN54qfkwE1Q originated.
Contract memorized as VestingContract.
```

Make a bash variable for the contract:

```bash
VESTING_TEZ="KT1VdxSaoxxwBb7s9ZWDCbvR4NN54qfkwE1Q"
```

#### Use

##### Vesting

To vest some Tez, submit the number of ticks to the `vest` entrypoint.

Submitting too many ticks will error:

```bash
$ tezos-client --wait none transfer 0 from tz1QS8VYYVDjv7iReBzXeheL6x63A1oATTj8 to $VESTING_TEZ \
  --entrypoint vest --arg 100

Waiting for the node to be bootstrapped...
Current head: BMZTK7igVKF1 (timestamp: 2021-04-12T19:30:03.000-00:00, validation: 2021-04-12T19:30:07.664-00:00)
Node is bootstrapped.
This simulation failed:
  Manager signed operations:
    From: tz1QS8VYYVDjv7iReBzXeheL6x63A1oATTj8
    Fee to the baker: ꜩ0
    Expected counter: 323912
    Gas limit: 1040000
    Storage limit: 60000 bytes
    Transaction:
      Amount: ꜩ0
      From: tz1QS8VYYVDjv7iReBzXeheL6x63A1oATTj8
      To: KT1VdxSaoxxwBb7s9ZWDCbvR4NN54qfkwE1Q
      Entrypoint: vest
      Parameter: 100
      This operation FAILED.

Runtime error in contract KT1VdxSaoxxwBb7s9ZWDCbvR4NN54qfkwE1Q:
  01: { parameter (or (option %setDelegate key_hash) (nat %vest)) ;
  ..
  66:              PAIR } } }
At line 46 characters 72 to 80,
script reached FAILWITH instruction
with 100
Fatal error:
  transfer simulation failed
```

But it will succeed for a valid number of ticks:

```bash
$ date -u +"%Y-%m-%dT%H:%M:%SZ"; tezos-client --wait none transfer 0 from \
  tz1QS8VYYVDjv7iReBzXeheL6x63A1oATTj8 to $VESTING_TEZ \
  --entrypoint vest --arg 3

2021-04-12T19:35:55Z

Waiting for the node to be bootstrapped...
Current head: BMZbTmv1LkJM (timestamp: 2021-04-12T19:35:53.000-00:00, validation: 2021-04-12T19:35:57.932-00:00)
Node is bootstrapped.
Estimated gas: 6511.264 units (will add 100 for safety)
Estimated storage: no bytes added
Operation successfully injected in the node.
Operation hash is 'oob6EEbGYAhurENdBDxLBxZwUDGKykKQTBqsN2X7sncjmS46YDY'
NOT waiting for the operation to be included.
Use command
  tezos-client wait for oob6EEbGYAhurENdBDxLBxZwUDGKykKQTBqsN2X7sncjmS46YDY to be included --confirmations 30 --branch BMZbTmv1LkJMLhVkRbUneu1d5TXtNeW9TDJTsJbyYPw685NboCQ
and/or an external block explorer to make sure that it has been included.
This sequence of operations was run:
  Manager signed operations:
    From: tz1QS8VYYVDjv7iReBzXeheL6x63A1oATTj8
    Fee to the baker: ꜩ0.000924
    Expected counter: 323913
    Gas limit: 6612
    Storage limit: 0 bytes
    Balance updates:
      tz1QS8VYYVDjv7iReBzXeheL6x63A1oATTj8 ................. -ꜩ0.000924
      fees(the baker who will include this operation,81) ... +ꜩ0.000924
    Transaction:
      Amount: ꜩ0
      From: tz1QS8VYYVDjv7iReBzXeheL6x63A1oATTj8
      To: KT1VdxSaoxxwBb7s9ZWDCbvR4NN54qfkwE1Q
      Entrypoint: vest
      Parameter: 3
      This transaction was successfully applied
      Updated storage:
        { Pair 0x0000aad02222472cdf9892a3011c01caf6407f027081
               0x000034987ab608ae4bcca818e9e7631a1ec3aed88d4b ;
          3 ;
          1618255575 ;
          30 ;
          1 }
      Storage size: 598 bytes
      Consumed gas: 5084.264
    Internal operations:
      Transaction:
        Amount: ꜩ0.000003
        From: KT1VdxSaoxxwBb7s9ZWDCbvR4NN54qfkwE1Q
        To: tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm
        This transaction was successfully applied
        Consumed gas: 1427
        Balance updates:
          KT1VdxSaoxxwBb7s9ZWDCbvR4NN54qfkwE1Q ... -ꜩ0.000003
          tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm ... +ꜩ0.000003
```


##### Setting The Delegate

To (un)set the delegate, call `setDelegate` as the `delegate_admin`.

Here we unset the delegate by submitting `None` for the `arg`ument. The delegate
may be set to `delegate_address` by submitting `Some delegate_address` instead.

```bash
$ tezos-client --wait none transfer 0 from $DELEGATE_ADMIN_ADDRESS to $VESTING_TEZ \
  --entrypoint setDelegate --arg None

Waiting for the node to be bootstrapped...
Current head: BM2eAs3f7dzb (timestamp: 2021-04-12T19:39:23.000-00:00, validation: 2021-04-12T19:39:55.181-00:00)
Node is bootstrapped.
Estimated gas: 5831.197 units (will add 100 for safety)
Estimated storage: no bytes added
Operation successfully injected in the node.
Operation hash is 'onxY7wepLar5ETrd6ie78PHZVew9DsVqzxCCe34VxKn5rbagCXf'
NOT waiting for the operation to be included.
Use command
  tezos-client wait for onxY7wepLar5ETrd6ie78PHZVew9DsVqzxCCe34VxKn5rbagCXf to be included --confirmations 30 --branch BM2eAs3f7dzbDsV59FKW94CKR8QjpmUymzgNPUUJ1mKiL4XFdPF
and/or an external block explorer to make sure that it has been included.
This sequence of operations was run:
  Manager signed operations:
    From: tz1QS8VYYVDjv7iReBzXeheL6x63A1oATTj8
    Fee to the baker: ꜩ0.000863
    Expected counter: 323914
    Gas limit: 5932
    Storage limit: 0 bytes
    Balance updates:
      tz1QS8VYYVDjv7iReBzXeheL6x63A1oATTj8 ................. -ꜩ0.000863
      fees(the baker who will include this operation,81) ... +ꜩ0.000863
    Transaction:
      Amount: ꜩ0
      From: tz1QS8VYYVDjv7iReBzXeheL6x63A1oATTj8
      To: KT1VdxSaoxxwBb7s9ZWDCbvR4NN54qfkwE1Q
      Entrypoint: setDelegate
      Parameter: None
      This transaction was successfully applied
      Updated storage:
        { Pair 0x0000aad02222472cdf9892a3011c01caf6407f027081
               0x000034987ab608ae4bcca818e9e7631a1ec3aed88d4b ;
          3 ;
          1618255575 ;
          30 ;
          1 }
      Storage size: 598 bytes
      Consumed gas: 4831.197
    Internal operations:
      Delegation:
        Contract: KT1VdxSaoxxwBb7s9ZWDCbvR4NN54qfkwE1Q
        To: nobody
        This delegation was successfully applied
        Consumed gas: 1000
```

