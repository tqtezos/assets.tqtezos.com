---
id: 3-fa12-lorentz
title: Create an Instance of an FA1.2 Contract on the Tezos Blockchain
sidebar_label: FA1.2 Lorentz
---


## Introduction to lorentz-contract-param


[lorentz-contract-metadata](https://github.com/tqtezos/lorentz-contract-metadata) - is
a version of FA1.2 with FA2-style metadata.

More information regarding FA2-style metadata may be found in
[TZIP-12](https://gitlab.com/tzip/tzip/-/blob/master/proposals/tzip-12/tzip-12.md#token_metadata).

Install `lorentz-contract-metadata` tools by following
[installation instructions in `lorentz-contract-metadata` source code
repository](
https://github.com/tqtezos/lorentz-contract-metadata/blob/master/README.md)


## Originate

The `FA1.2` contract must be initialized with several storage parameters:

```haskell
Pair
  {}                   -- Empty ledger big_map
  (Pair
      "$ALICE_ADDRESS" -- Administrator address
      (Pair
          False        -- Is all activity currently paused? (no)
          0            -- Total supply of tokens
      )
  )
```

As well as inlined metadata parameters:

- `symbol`: `string`
- `name`: `string`
- `decimals`: `nat`, the number of digits to use after the decimal point when displaying token amounts.
- `extras`: `map string string`, all other metadata parameters

Note: FA2-style metadata also includes the `nat` value: `token_id`,
which is defined to be `0` for single-token contracts, such as FA1.2.

For this example, we'll use:

- `symbol`: `TOK`
- `name`: `Token`
- `decimals`: `0`
- `extras`: `{}`



Instead of providing contract parameters in raw Michelson, we can use
`lorentz-contract-metadata` to generate them.

To originate the contract, run:

```shell
$ tezos-client --wait none originate contract ManagedLedger \
  transferring 0 from $ALICE_ADDRESS running \
  "$(lorentz-contract-metadata Metadata print \
  --token-symbol "TOK" \
  --token-name "Token" \
  --token-decimals 0 \
  --oneline)" \
  --init "$(lorentz-contract-metadata Metadata init \
  --admin $ALICE_ADDRESS \
  --initial-ledger '[]')" --burn-cap 5.033 --force

Waiting for the node to be bootstrapped before injection...
Current head: BLoWu4vMmzZb (timestamp: 2020-03-31T19:35:39-00:00, validation: 2020-03-31T19:36:23-00:00)
Node is bootstrapped, ready for injecting operations.
Estimated gas: 142649 units (will add 100 for safety)
Estimated storage: 5033 bytes added (will add 20 for safety)
Operation successfully injected in the node.
Operation hash is 'onnLanKjRG4E64eevGpPP2TFteheNoDEyy8uDMdZGHPgy18YWkC'
NOT waiting for the operation to be included.
Use command
  tezos-client wait for onnLanKjRG4E64eevGpPP2TFteheNoDEyy8uDMdZGHPgy18YWkC to be included --confirmations 30 --branch BLoWu4vMmzZbwYkJG8VimgkLis2xS3YSFAMFi4jEuWJ9mHVmKP5
and/or an external block explorer to make sure that it has been included.
This sequence of operations was run:
  Manager signed operations:
    From: tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm
    Fee to the baker: ꜩ0.001259
    Expected counter: 623911
    Gas limit: 10000
    Storage limit: 0 bytes
    Balance updates:
      tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm ............. -ꜩ0.001259
      fees(tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU,150) ... +ꜩ0.001259
    Revelation of manager public key:
      Contract: tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm
      Key: edpkuPTVBFtbYd6gZWryXypSYYq6g7FvyucwphoU78T1vmGkbhj6qb
      This revelation was successfully applied
      Consumed gas: 10000
  Manager signed operations:
    From: tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm
    Fee to the baker: ꜩ0.019169
    Expected counter: 623912
    Gas limit: 142749
    Storage limit: 5053 bytes
    Balance updates:
      tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm ............. -ꜩ0.019169
      fees(tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU,150) ... +ꜩ0.019169
    Origination:
      From: tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm
      Credit: ꜩ0
      Script:
        {...}
        Initial storage:
          (Pair {} (Pair "tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm" (Pair False 0)))
        No delegate for this contract
        This origination was successfully applied
        Originated contracts:
          KT18apu7iDnqnUeXdMv3ZVjs81DTPWK6f1Me
        Storage size: 4776 bytes
        Updated big_maps:
          New map(735) of type (big_map address (pair nat (map address nat)))
        Paid storage size diff: 4776 bytes
        Consumed gas: 142649
        Balance updates:
          tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm ... -ꜩ4.776
          tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm ... -ꜩ0.257

New contract KT18apu7iDnqnUeXdMv3ZVjs81DTPWK6f1Me originated.
```

Note we abbreviate large `Script` contents with `{...}`

Make a variable for the new contract address:

```shell
FA12_ADDRESS=KT18apu7iDnqnUeXdMv3ZVjs81DTPWK6f1Me
```

Note that it may take some time for the blockchain network to include
our operations (typically no more than a few minutes). To check
operation status use its hash to get a receipt:

```shell
$ tezos-client get receipt for onnLanKjRG4E64eevGpPP2TFteheNoDEyy8uDMdZGHPgy18YWkC

Operation found in block: BLBBGyNZKoi7hrZeszBUmjtfeg8JcjdZMxpUyVTPj24cyyRJQeF (pass: 3, offset: 1)
Manager signed operations:
  From: tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm
  Fee to the baker: ꜩ0.001259
  Expected counter: 623911
  Gas limit: 10000
  Storage limit: 0 bytes
  Balance updates:
    tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm ............. -ꜩ0.001259
    fees(tz1RomaiWJV3NFDZWTMVR2aEeHknsn3iF5Gi,150) ... +ꜩ0.001259
  Revelation of manager public key:
    Contract: tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm
    Key: edpkuPTVBFtbYd6gZWryXypSYYq6g7FvyucwphoU78T1vmGkbhj6qb
    This revelation was successfully applied
    Consumed gas: 10000
Manager signed operations:
  From: tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm
  Fee to the baker: ꜩ0.019169
  Expected counter: 623912
  Gas limit: 142749
  Storage limit: 5053 bytes
  Balance updates:
    tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm ............. -ꜩ0.019169
    fees(tz1RomaiWJV3NFDZWTMVR2aEeHknsn3iF5Gi,150) ... +ꜩ0.019169
  Origination:
    From: tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm
    Credit: ꜩ0
    Script:
      {...}
      Initial storage:
        (Pair {} (Pair "tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm" (Pair False 0)))
      No delegate for this contract
      This origination was successfully applied
      Originated contracts:
        KT18apu7iDnqnUeXdMv3ZVjs81DTPWK6f1Me
      Storage size: 4776 bytes
      Updated big_maps:
        New map(735) of type (big_map address (pair nat (map address nat)))
      Paid storage size diff: 4776 bytes
      Consumed gas: 142649
      Balance updates:
        tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm ... -ꜩ4.776
        tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm ... -ꜩ0.257
```

## Views

When a contract parameter has a non-unit return type, e.g. `Get Total
Supply`, which returns the total supply of tokens, the contract needs
to be able to store the result somewhere. In particular, another
contract accepting the return value.

For the following examples, we need contracts accepting `address`,
`nat`, and `token_metadata` values:


### For nat

```shell
$ tezos-client --wait none originate contract nat_storage transferring 0 \
  from $ALICE_ADDRESS running "{ parameter nat ; storage nat ; code { CAR ; NIL operation ; PAIR } }" \
  --init 0 --burn-cap 0.295

Waiting for the node to be bootstrapped before injection...
Current head: BKspjAccRQML (timestamp: 2020-03-31T19:40:49-00:00, validation: 2020-03-31T19:41:12-00:00)
Node is bootstrapped, ready for injecting operations.
Estimated gas: 10909 units (will add 100 for safety)
Estimated storage: 295 bytes added (will add 20 for safety)
Operation successfully injected in the node.
Operation hash is 'onfjhheM6UMKwGYbr93a1XiJMEFUa4GyCgxfWJUvZrdGQVrL5RC'
NOT waiting for the operation to be included.
Use command
  tezos-client wait for onfjhheM6UMKwGYbr93a1XiJMEFUa4GyCgxfWJUvZrdGQVrL5RC to be included --confirmations 30 --branch BKspjAccRQMLX8JFRtGUzRzenRnBStZiyPWigNihmUmWq3nwyf1
and/or an external block explorer to make sure that it has been included.
This sequence of operations was run:
  Manager signed operations:
    From: tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm
    Fee to the baker: ꜩ0.001368
    Expected counter: 623913
    Gas limit: 11009
    Storage limit: 315 bytes
    Balance updates:
      tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm ............. -ꜩ0.001368
      fees(tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU,150) ... +ꜩ0.001368
    Origination:
      From: tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm
      Credit: ꜩ0
      Script:
        { parameter nat ; storage nat ; code { CAR ; NIL operation ; PAIR } }
        Initial storage: 0
        No delegate for this contract
        This origination was successfully applied
        Originated contracts:
          KT1CTP1Bm1DvWCfeDibe8p5EDAAUa4XX4c34
        Storage size: 38 bytes
        Paid storage size diff: 38 bytes
        Consumed gas: 10909
        Balance updates:
          tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm ... -ꜩ0.038
          tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm ... -ꜩ0.257

New contract KT1CTP1Bm1DvWCfeDibe8p5EDAAUa4XX4c34 originated.
```


### For address

```shell
$ tezos-client --wait none originate contract address_storage transferring 0 \
  from $ALICE_ADDRESS running "{ parameter address ; storage address ; code { CAR ; NIL operation ; PAIR } }" \
  --init "\"$ALICE_ADDRESS\"" --burn-cap 0.32

Waiting for the node to be bootstrapped before injection...
Current head: BKveReSTZqs9 (timestamp: 2020-03-31T19:46:17-00:00, validation: 2020-03-31T19:46:29-00:00)
Node is bootstrapped, ready for injecting operations.
Estimated gas: 11314 units (will add 100 for safety)
Estimated storage: 320 bytes added (will add 20 for safety)
Operation successfully injected in the node.
Operation hash is 'oo8CFWkqaRuV4UGm6Ng87WJNYnU3q4YjC1txQcngF4BiF2URQ1V'
NOT waiting for the operation to be included.
Use command
  tezos-client wait for oo8CFWkqaRuV4UGm6Ng87WJNYnU3q4YjC1txQcngF4BiF2URQ1V to be included --confirmations 30 --branch BKveReSTZqs9u1hCQzubvS2zm5c3vpeRjxNHnphpsULhNgwjgAZ
and/or an external block explorer to make sure that it has been included.
This sequence of operations was run:
  Manager signed operations:
    From: tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm
    Fee to the baker: ꜩ0.001448
    Expected counter: 623914
    Gas limit: 11414
    Storage limit: 340 bytes
    Balance updates:
      tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm ............. -ꜩ0.001448
      fees(tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU,150) ... +ꜩ0.001448
    Origination:
      From: tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm
      Credit: ꜩ0
      Script:
        { parameter address ;
          storage address ;
          code { CAR ; NIL operation ; PAIR } }
        Initial storage: "tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm"
        No delegate for this contract
        This origination was successfully applied
        Originated contracts:
          KT1LHvWNJhjGBehhNjd6BeNd1bzJkxhDd4fJ
        Storage size: 63 bytes
        Paid storage size diff: 63 bytes
        Consumed gas: 11314
        Balance updates:
          tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm ... -ꜩ0.063
          tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm ... -ꜩ0.257

New contract KT1LHvWNJhjGBehhNjd6BeNd1bzJkxhDd4fJ originated.
```


### For token_metadata

First, define:

```shell
TOKEN_METADATA_TYPE="(list (pair (nat %token_id) (pair (string %symbol) (pair (string %name) (pair (nat %decimals) (map %extras string string))))))"
```

```shell
$ tezos-client --wait none originate contract metadata_storage transferring 0 \
  from $ALICE_ADDRESS running "{ parameter $TOKEN_METADATA_TYPE ; storage $TOKEN_METADATA_TYPE ; code { CAR ; NIL operation ; PAIR } }" \
  --init '{Pair 0 (Pair "SYMBOL" (Pair "NAME" (Pair 0 {})))}' --burn-cap 0.493 --force

Waiting for the node to be bootstrapped before injection...
Current head: BLFoMNaKmThy (timestamp: 2020-03-31T20:40:53-00:00, validation: 2020-03-31T20:41:04-00:00)
Node is bootstrapped, ready for injecting operations.
Estimated gas: 14859 units (will add 100 for safety)
Estimated storage: 493 bytes added (will add 20 for safety)
Operation successfully injected in the node.
Operation hash is 'opBNgPdvWG6siEEZTFdZXJgpm6gVF6SeZLjR7HJwab2BFjoPoWY'
NOT waiting for the operation to be included.
Use command
  tezos-client wait for opBNgPdvWG6siEEZTFdZXJgpm6gVF6SeZLjR7HJwab2BFjoPoWY to be included --confirmations 30 --branch BLFoMNaKmThye5b5qa5yJA2hzNWNhtu6c1wvz84xCg3d3oaa3Pg
and/or an external block explorer to make sure that it has been included.
This sequence of operations was run:
  Manager signed operations:
    From: tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm
    Fee to the baker: ꜩ0.001961
    Expected counter: 623925
    Gas limit: 14959
    Storage limit: 513 bytes
    Balance updates:
      tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm ............. -ꜩ0.001961
      fees(tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU,150) ... +ꜩ0.001961
    Origination:
      From: tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm
      Credit: ꜩ0
      Script:
        { parameter
            (list (pair (nat %token_id)
                        (pair (string %symbol)
                              (pair (string %name) (pair (nat %decimals) (map %extras string string)))))) ;
          storage
            (list (pair (nat %token_id)
                        (pair (string %symbol)
                              (pair (string %name) (pair (nat %decimals) (map %extras string string)))))) ;
          code { CAR ; NIL operation ; PAIR } }
        Initial storage: { Pair 0 (Pair "SYMBOL" (Pair "NAME" (Pair 0 {}))) }
        No delegate for this contract
        This origination was successfully applied
        Originated contracts:
          KT1MRPDw2zXGPdL8CrzSaFS9jiqUDM8tpPNn
        Storage size: 236 bytes
        Paid storage size diff: 236 bytes
        Consumed gas: 14859
        Balance updates:
          tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm ... -ꜩ0.236
          tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm ... -ꜩ0.257

New contract KT1MRPDw2zXGPdL8CrzSaFS9jiqUDM8tpPNn originated.
```


Note: you may have to set/increase the burn cap to allow the
contract(s) to be originated, e.g.:

```shell
$ tezos-client --wait none originate contract address_storage transferring 0 \
  from $ALICE_ADDRESS running "{ parameter address ; storage address ; code { CAR ; NIL operation ; PAIR } }" \
  --init "\"$ALICE_ADDRESS\"" --burn-cap 0.0001 --dry-run

Waiting for the node to be bootstrapped before injection...
Current head: BLY4388F8VTU (timestamp: 2019-08-30T17:03:46-00:00, validation: 2019-08-30T17:04:08-00:00)
Node is bootstrapped, ready for injecting operations.
Fatal error:
  The operation will burn ꜩ0.32 which is higher than the configured burn cap (ꜩ0.0001).
   Use `--burn-cap 0.32` to emit this operation.
```


Then, using `tezos-client get receipt for [Operation hash]` for each
operation hash, store the contract addresses in variables:

```shell
NAT_STORAGE_ADDRESS="KT1.."
ADDRESS_STORAGE_ADDRESS="KT1.."
METADATA_STORAGE_ADDRESS="KT1.."
```

Next, you may access the stored values with the following two commands
for `nat` and `address`, respectively:

```shell
$ tezos-client get contract storage for $NAT_STORAGE_ADDRESS

0

$ tezos-client get contract storage for $ADDRESS_STORAGE_ADDRESS

"tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm"
```

## Interact using tezos-client

Commands to interact with our ManagedLedger contract instance using
`tezos-client` and `lorentz-contract-param` all follow the same
pattern with only a few parameters changing depending on which
contract entry point we invoke. Using `getTotalSupply` as an example,
invocation looks like this:

```shell
$ tezos-client --wait none transfer 0 from $ALICE_ADDRESS to $FA12_ADDRESS \
  --arg "$(lorentz-contract-metadata \
  Metadata getTotalSupply \
  --callback-contract $NAT_STORAGE_ADDRESS)"
```

Let's capture the pattern in a shell function:

```shell
$ fa12(){tezos-client --wait none transfer 0 from $ALICE_ADDRESS to $FA12_ADDRESS --burn-cap 0.5 --arg "$(lorentz-contract-metadata Metadata $@;)"}
```

Note that we also set `--burn-cap` here. [see `burn-cap`](#higherthantheconfiguredburncap).


### Get Total Supply

With `fa12` function defined we can now invoke contract's
`getTotalSupply` entrypoint like so:

```shell
$ fa12 getTotalSupply --callback-contract $NAT_STORAGE_ADDRESS
```

The output of this command looks like this:

```shell
Waiting for the node to be bootstrapped before injection...
Current head: BLkmHajH44cY (timestamp: 2020-03-31T19:51:39-00:00, validation: 2020-03-31T19:52:00-00:00)
Node is bootstrapped, ready for injecting operations.
Estimated gas: 132442 units (will add 100 for safety)
Estimated storage: no bytes added
Operation successfully injected in the node.
Operation hash is 'oothedERdD6hkD45S9ncrnS3u6ienY3px92iSyfjAd4ijLtUjqs'
NOT waiting for the operation to be included.
Use command
  tezos-client wait for oothedERdD6hkD45S9ncrnS3u6ienY3px92iSyfjAd4ijLtUjqs to be included --confirmations 30 --branch BLkmHajH44cYRFJzTqmdBnh3efUHGQnjZyKbjAmBB6bgeQbuXzV
and/or an external block explorer to make sure that it has been included.
This sequence of operations was run:
  Manager signed operations:
    From: tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm
    Fee to the baker: ꜩ0.013564
    Expected counter: 623915
    Gas limit: 132542
    Storage limit: 0 bytes
    Balance updates:
      tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm ............. -ꜩ0.013564
      fees(tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU,150) ... +ꜩ0.013564
    Transaction:
      Amount: ꜩ0
      From: tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm
      To: KT18apu7iDnqnUeXdMv3ZVjs81DTPWK6f1Me
      Parameter: (Left (Right (Right (Right (Pair Unit "KT1CTP1Bm1DvWCfeDibe8p5EDAAUa4XX4c34")))))
      This transaction was successfully applied
      Updated storage:
        (Pair 735 (Pair 0x0000aad02222472cdf9892a3011c01caf6407f027081 (Pair False 0)))
      Storage size: 4776 bytes
      Consumed gas: 121125
    Internal operations:
      Transaction:
        Amount: ꜩ0
        From: KT18apu7iDnqnUeXdMv3ZVjs81DTPWK6f1Me
        To: KT1CTP1Bm1DvWCfeDibe8p5EDAAUa4XX4c34
        Parameter: 0
        This transaction was successfully applied
        Updated storage: 0
        Storage size: 38 bytes
        Consumed gas: 11317
```

All the commands produce similar output when successfull so we omit
it in the following examples.

The value for total token supply will be recorded in simple storage of
contract at `NAT_STORAGE_ADDRESS` which we can see using the following
command (once tezos network includes our operations):

```shell
$ tezos-client get contract storage for $NAT_STORAGE_ADDRESS

0
```

### Get Administrator

To get the current administrator's address, first put it into
`ADDRESS_STORAGE_ADDRESS` contract:

```shell
$ fa12 getAdministrator --callback-contract $ADDRESS_STORAGE_ADDRESS
```

As with `NAT_STORAGE_ADDRESS`, we may access the result using `get
contract storage for` and ensure that it matches Alice's address using
`echo $ALICE_ADDRESS`:

```shell
$ tezos-client get contract storage for $ADDRESS_STORAGE_ADDRESS

"tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm"

$ echo $ALICE_ADDRESS

tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm
```


### Get Balance

To get the balance of tokens for a particular address (stored in the
`NAT_STORAGE_ADDRESS` contract):

```shell
$ fa12 getBalance --owner $ALICE_ADDRESS --callback-contract $NAT_STORAGE_ADDRESS
```

We can then access the result using:

```shell
$ tezos-client get contract storage for $NAT_STORAGE_ADDRESS

0
```


### Get Metadata

To get the token metadata for a particular FA1.2 + FA2-style metadata contract
(stored in the `METADATA_STORAGE_ADDRESS`):

```shell
$ fa12 getMetadata --callback-contract $METADATA_STORAGE_ADDRESS
```

We can then access the result using:

```
$ tezos-client get contract storage for $METADATA_STORAGE_ADDRESS

{ Pair 0 (Pair "TOK" (Pair "Token" (Pair 0 {}))) }
```




### Get Allowance

To get Bob's allowance to withdraw from Alice's account, where Bob's
address is `BOB_ADDRESS`:

```shell
$ fa12 getAllowance --owner $ALICE_ADDRESS --spender $BOB_ADDRESS --callback-contract $NAT_STORAGE_ADDRESS

```

We can then access the result using:

```
$ tezos-client get contract storage for $NAT_STORAGE_ADDRESS

0
```


### Transfer

From `GetBalance` above, we know that `Alice` doesn't have any tokens.

To transfer tokens from Alice to Bob, we first need to give Alice some
tokens.  We can do that by minting `5` tokens and allocating them to
Alice (See the `Mint` subsection below):

```
$ fa12 mint --value 5 --to $ALICE_ADDRESS
```

To transfer `2` tokens from Alice to Bob:

```
$ fa12 transfer --value 2 --from $ALICE_ADDRESS --to $BOB_ADDRESS
```

Check Bob's balance:

```
$ fa12 getBalance --owner $BOB_ADDRESS --callback-contract $NAT_STORAGE_ADDRESS
$ tezos-client get contract storage for $NAT_STORAGE_ADDRESS
2
```

### Approve

For Alice to approve Bob to withdraw up to `2` tokens from her
address:

```
$ fa12 approve --value 2 --spender $BOB_ADDRESS
```

We can then check the resulting allowance using:

```
$ fa12 getAllowance --owner $ALICE_ADDRESS --spender $BOB_ADDRESS --callback-contract $NAT_STORAGE_ADDRESS
```

```
$ tezos-client get contract storage for $NAT_STORAGE_ADDRESS
2
```


### Mint

To mint `5` tokens and allocate them to Alice:

```
$ fa12 mint --value 5 --to $ALICE_ADDRESS
$ fa12 getBalance --owner $ALICE_ADDRESS --callback-contract $NAT_STORAGE_ADDRESS
$ tezos-client get contract storage for $NAT_STORAGE_ADDRESS
5
```

### Burn

If you've been following this guide step-by-step, Bob's account should
have `3` tokens at this point. If it doesn't, add at least `1` using
`Transfer` or `Mint`.

Before burning, we first add `2` tokens to Bob's address:

```
$ fa12 mint --value 2 --to $BOB_ADDRESS
```

We can ensure Bob has at least `3` tokens using:

```
$ fa12 getBalance --owner $BOB_ADDRESS --callback-contract $NAT_STORAGE_ADDRESS
$ tezos-client get contract storage for $NAT_STORAGE_ADDRESS
5
```

Finally, we can burn `2` of Bob's tokens using:

```
$ fa12 burn --value 2 --from $BOB_ADDRESS
```

And then we may confirm that two tokens have been subtracted from
Bob's account:

```
$ fa12 getBalance --owner $BOB_ADDRESS --callback-contract $NAT_STORAGE_ADDRESS
$ tezos-client get contract storage for $NAT_STORAGE_ADDRESS
3
```

### Pause Contract

To pause the contract:

```
$ fa12 setPause --paused True
```

We can check whether the contract is paused using:

```
$ tezos-client get contract storage for $FA12_ADDRESS
Pair 0 (Pair "tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm" (Pair True 7))
```

`True` value indicates that it's paused, a `False` value
indicicates that it's _not_ paused.

Transfers and approvals are are disabled while contract is paused. Try:

```
$ fa12 transfer --value 1 --from $ALICE_ADDRESS --to $BOB_ADDRESS
```

The command produces output like this (omitting included contract's
Michelson code for brevity):

```
Node is bootstrapped, ready for injecting operations.
This simulation failed:
  Manager signed operations:
    From: tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm
    Fee to the baker: ꜩ0
    Expected counter: 32
    Gas limit: 800000
    Storage limit: 60000 bytes
    Transaction:
      Amount: ꜩ0
      From: tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm
      To: KT1P33YQj5LQGBAYxvpXCsa6v2BXJ8N4i6PF
      Parameter: (Left (Left (Left (Pair "tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm"
                                         (Pair "tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6" 1)))))
      This operation FAILED.

Runtime error in contract KT1P33YQj5LQGBAYxvpXCsa6v2BXJ8N4i6PF:
  001: { parameter
...
  585:                          NIL operation ;
  586:                          PAIR } } } } } }
At line 23 characters 87 to 95,
script reached FAILWITH instruction
with (Pair "TokenOperationsArePaused" Unit)
Fatal error:
  transfer simulation failed
```


To unpause the contract:

```
$ fa12 setPause --paused False
```

```
$ tezos-client get contract storage for $FA12_ADDRESS

Pair 0 (Pair "tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm" (Pair False 7))

```

### Set New Administrator

To make Bob the new administrator:

```
$ fa12 setAdministrator --new-administrator-address $BOB_ADDRESS
```

We can ensure that the administrator has been updated using:

```
$ fa12 getAdministrator --callback-contract $ADDRESS_STORAGE_ADDRESS
$ tezos-client get contract storage for $ADDRESS_STORAGE_ADDRESS
"tz1RwoEdg4efDQHarsw6aKtMUYvg278Gv1ir"
```

```
$ echo $BOB_ADDRESS

tz1RwoEdg4efDQHarsw6aKtMUYvg278Gv1ir
```

Our `fa12` shell function is set up to invoke operations using
`$ALICE_ADDRESS`, so now that `$ALICE_ADDRESS` is no longer the administrator
attempts to invoke admin entrypoints from that address will fail:

```
$ fa12 mint --value 5 --to $ALICE_ADDRESS
...
  586:                          PAIR } } } } } }
At line 447 characters 86 to 94,
script reached FAILWITH instruction
with (Pair "SenderIsNotAdmin" Unit)
```

## Interact using PyTezos

### Install PyTezos

If on Debian or Ubuntu Linux, install dependencies with `apt`:

```shell
sudo apt install libsodium-dev libsecp256k1-dev libgmp-dev
```

On Arch Linux, install these packages with `pacman`:

```shell
sudo pacman libsodium libsec256k1 gmp
```
You may also need to install python-wheel    

Otherwise, if on Mac OS, install them with `brew`:

```shell
brew tap cuber/homebrew-libsecp256k1
brew install libsodium libsecp256k1 gmp
```

Next, install PyTezos with `pip3`:

```
pip3 install pytezos
```

### Originate the contract

Assuming that `$ALICE_ADDRESS` is defined, we can originate a copy of
`FA1.2` in much the same way as with `lorentz-contracts`.

Note: See the [Client Setup Guide](/docs/setup/1-tezos-client) to make a
wallet and define `$ALICE_ADDRESS`.

We begin by opening `python3`, setting the `key` and `shell`, and
specifying `fa12` as a contract:

Note: replace `~/Downloads/tz1R3vJ5TV8Y5pVj8dicBR23Zv8JArusDkYr.json`
with the path to your wallet `.json` file.

```py
$ python3
Python 3.7.4 (default, Sep  7 2019, 18:27:02)
[Clang 10.0.1 (clang-1001.0.46.4)] on darwin
Type "help", "copyright", "credits" or "license" for more information.
>>> from pytezos import pytezos
>>> pytezos = pytezos.using(key='~/Downloads/tz1R3vJ5TV8Y5pVj8dicBR23Zv8JArusDkYr.json', shell='babylonnet')

>>> alice_address = 'tz1R3vJ5TV8Y5pVj8dicBR23Zv8JArusDkYr'
>>> bob_address = 'tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm'
>>> nat_storage_address = 'KT1J4mhVAaMYAPC4aPEkhC9i48PHBHxavkJ2'
```

Next, we define a `Contract` from [a copy of
`ManagedLedger.tz`](https://gitlab.com/tzip/tzip/blob/16ca4fbb60f2ab52958136b76a1d12b342beba58/Proposals/TZIP-0007/ManagedLedger.tz)
with annotations:

```py
>>> from pytezos import Contract
>>> import requests

>>> contract_url = 'https://gitlab.com/tzip/tzip/raw/16ca4fbb60f2ab52958136b76a1d12b342beba58/Proposals/TZIP-0007/ManagedLedger.tz'
>>> fa12src = Contract.from_michelson(requests.get(contract_url).text)
```

We need to create the initial storage to originate the contract.

To help with this, we can view the contract's storage schema:

```py
>>> fa12src.storage
<pytezos.michelson.contract.ContractStorage object at 0x10d984590>

$storage:
    {
      "ledger": { $address : $ledger_item , ... }  /* big_map */,
      "admin": $address,
      "paused": bool,
      "totalSupply": $nat
    }

$ledger_item:
    {
      "balance": $nat,
      "approvals": { $address : $nat , ... }
    }

$nat:
    int  /* Natural number */

$address:
    string  /* Base58 encoded `tz` or `KT` address */


Helpers
.big_map_decode()
.big_map_diff_decode()
.big_map_diff_encode()
.big_map_id()
.big_map_init()
.big_map_query()
.decode()
.default()
.encode()
```

Next, we choose initial storage values and encode it to prepare for
contract origination:

```py
>>> init_storage = fa12src.storage.encode({
    ...:  "ledger": {},
    ...:  "admin": pytezos.key.public_key_hash(),
    ...:  "paused": False,
    ...:  "totalSupply": 0
    ...: } )
```

Next, we originate the contract:

```py
>>> origination_op = pytezos.origination(script=dict(code=fa12src.code, storage=init_storage)).autofill().sign().inject()
>>> origination_hash = origination_op['hash']
>>> origination_hash
'opXxLwE3j9ZY9Rv99Pomh6u7SonKAoywzpU6KkdWtFryUhBbXdP'
```


However, the origination does not return the resulting contract's
address, so we need to find the _completed_ operation in the network
and derive the contract's address from it:

```py
>>> opg = pytezos.shell.blocks[-5:].find_operation(origination_hash)
>>> contract_id = opg['contents'][0]['metadata']['operation_result']['originated_contracts'][0]
>>> contract_id
'KT1GV7wkUgZpEznQ48VR1UUSgXAU5Lk1SfpH'

>>> fa12 = pytezos.contract(contract_id)
```

Note: the `find_operation` command can fail if the operation has not
yet been processed:

```py
>>> opg = pytezos.shell.blocks[-5:].find_operation(origination_op)
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
  File "/usr/local/lib/python3.7/site-packages/pytezos/tools/docstring.py", line 67, in __call__
    return method(self.class_instance, *args, **kwargs)
  File "/usr/local/lib/python3.7/site-packages/pytezos/rpc/search.py", line 207, in find_operation
    raise StopIteration(operation_group_hash)
StopIteration: oonhxpbH9Jc7fpbjfzvfbetppEBnjUTFmkbziVFV3B5KhjVdzpd
```

### Inspect the Schema

We can view the parameter schema to find out which entry points the
contract supports and what their arguments are:

```py
>>> fa12.contract.parameter
<pytezos.michelson.contract.ContractParameter object at 0x10ce5d910>

$parameter:
    { "transfer": $transfer } ||
    { "approve": $approve } ||
    { "getAllowance": [ $address , $address , $contract (nat) ] } ||
    { "getBalance": [ $address , $contract (nat) ] } ||
    { "getTotalSupply": [ $unit , $contract (nat) ] } ||
    { "setPause": bool  /* setPause */ } ||
    { "setAdministrator": $address  /* setAdministrator */ } ||
    { "getAdministrator": [ $unit , $contract (address) ] } ||
    { "mint": $mint } ||
    { "burn": $burn }

$burn:
    {
      "from": $address,
      "value": $nat
    }

$mint:
    {
      "to": $address,
      "value": $nat
    }

$approve:
    {
      "spender": $address,
      "value": $nat
    }

$transfer:
    {
      "from": $address,
      "to": $address,
      "value": $nat
    }

$contract:
    string  /* Base58 encoded `KT` address */

$nat:
    int  /* Natural number */

$address:
    string  /* Base58 encoded `tz` or `KT` address */

$unit:
    None /* Void */


Helpers
.decode()
.encode()
.entries()
```

### Interacting with FA1.2

Finally, using the parameter schema, we can perform a transfer using
the following steps:

- Mint `5` tokens to `alice_address`
- Transfer `3` tokens from `alice_address` to `bob_address`
- Store `bob_address`'s balance in `nat_storage_address`
- Get the storage value of `nat_storage_address`

```py
>>> op = fa12.mint(to=alice_address, value=5).inject()
>>> op['hash']
'opDS6FUYmzXBRpX1DxpnucWBrcyEvCmAsSdjmHJMNpf7xQhGsRW'

>>> op = fa12.transfer(**{'from': alice_address, 'to': bob_address, 'value': 3}).inject()
>>> op['hash']
'ooQRsxqkV3vEtaDdarMzvzFuZLeKe6qfJkZEx9PntzqHGxVo8FU'

>>> op = fa12.getBalance(bob_address, nat_storage_address).inject()
>>> op['hash']
'opUVaphfSFgeUTACVmspr6bXrY82RLJ4mSf4DgT2kNZ6SiEcuh6'

>>> pytezos.contract(nat_storage_address).storage()
3
```

Note: Why `.transfer(**{'from': ..})` instead of `.transfer(from=..)`?
In Python, `from` is a keyword and may not be used to specify an
argument so we use `**{..}` to convert a dictionary into keyword
arguments.

## Troubleshooting

### Counter _ already used

This error occurs when a dependent operation has not yet been included
and can take one of the following forms:

```
$ tezos-client --wait none transfer 0 from $ALICE_ADDRESS to $FA12_ADDRESS --arg ..

Waiting for the node to be bootstrapped before injection...
Current head: BMe8VmYBa1Ye (timestamp: 2019-08-12T15:34:56-00:00, validation: 2019-08-12T15:35:00-00:00)
Node is bootstrapped, ready for injecting operations.
Counter 565668 already used for contract tz1QLne6uZFxPRdRfJG8msx5RouENpJoRsfP (expected 565669)
Fatal error:
  transfer simulation failed
```

```
$ tezos-client --wait none transfer 0 from $ALICE_ADDRESS to $FA12_ADDRESS --arg ..

Waiting for the node to be bootstrapped before injection...
Current head: BL7QrQjGhkut (timestamp: 2019-08-12T15:39:26-00:00, validation: 2019-08-12T15:39:45-00:00)
Node is bootstrapped, ready for injecting operations.
Estimated gas: 212314 units (will add 100 for safety)
Estimated storage: no bytes added
Unregistred error:
  { "kind": "generic",
    "error":
      "Error while applying operation op1imCEMKFm7bTN9cwX4uoKPb6FjHJDv6NCkWKGVE7srh4XN6UP:\nbranch refused (Error:\n
      Counter 565670 already used for contract tz1QLne6uZFxPRdRfJG8msx5RouENpJoRsfP (expected 565671)\n)" }
Fatal error:
  transfer simulation failed
```

To fix, either:
- Wait for the operation to be included
- Run `tezos-client wait for [Operation Hash] to be included` with the
  dependent operation's `Operation Hash` before continuing
  * Alternatively, you may run: `tz get receipt for
    [Operation Hash]`


### Higher than the configured burn cap

This error may occur when `--burn-cap` is not specified or it's set
too low for the current operation:

```
$ tezos-client --wait none transfer 0 from $ALICE_ADDRESS to $FA12_ADDRESS --arg ..

Waiting for the node to be bootstrapped before injection...
Current head: BLBsvLowXAPf (timestamp: 2019-08-12T15:41:56-00:00, validation: 2019-08-12T15:42:45-00:00)
Node is bootstrapped, ready for injecting operations.
Fatal error:
  The operation will burn ꜩ0.021 which is higher than the configured burn cap (ꜩ0).
   Use `--burn-cap 0.021` to emit this operation.
```

To fix, replace or add `--burn-cap` with the given recommendation (in
this case, `--burn-cap 0.021`)
