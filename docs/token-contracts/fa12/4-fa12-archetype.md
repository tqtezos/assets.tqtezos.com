---
id: 4-fa12-archetype
title: Deploy a Verified Implementation of FA1.2 Contract
sidebar_label: FA1.2 Archetype
---

## Introduction
This article presents the procedure to deploy a verified implementation of the FA1.2 contract.

[Program verification](https://en.wikipedia.org/wiki/Formal_verification) is a technique to mathematically prove that a program has the required properties. It provides a high level of confidence that the contract executes correctly according to its specification.

The formal properties of the FA1.2 contract are presented [below](#formal-properties).

The contract and its formal specification are written in the [Archetype language](https://archetype-lang.org/), a high-level domain-specific language dedicated to the development of verified smart contracts for the Tezos blockchain.

For verification purposes, Archetype translates the contract to the Why3 language; [Why3](http://why3.lri.fr/) is a generic program verification platform; it generates proof obligations and calls [SMT](https://en.wikipedia.org/wiki/Satisfiability_modulo_theories) solvers to solve them.

## Generate Michelson
The Archetype source code is available [here](https://github.com/edukera/archetype-lang/blob/0a5ad0832709ac102a14534f22d4f94cb185866d/contracts/fa12.arl).

This implementation of FA1.2 does not allow minting, that is that the `totalsupply` is the intial and final number of tokens.

> SHA256 (fa12.arl) = d38260e5f55e630880ecd5d5ed32eb91988d2f34b43a7c031275d8f8a8715184

The following command generates the Michelson version of the contract in the `fa12.tz` file:
```
$ archetype fa12.arl > fa12.tz
```

> Install [Archetype](https://docs.archetype-lang.org/getting-started-1#installation) (minimum required version: 1.2.0).

## Originate contract

This section presents how to originate (deploy) the contract on the Tezos testnet with the Tezos client. It assumes you already have an activated account (if not follow this procedure).

The following command generates the Micheline syntax for the initial storage:

```
$ archetype --set-caller-init tz1dEezCSqMVsmfnaAZS2rBJZfdFCZEyA7DP -t michelson-storage fa12.arl
(Pair {  } { Elt "tz1dEezCSqMVsmfnaAZS2rBJZfdFCZEyA7DP" 10000000 })
```

The address passed as the initial caller (here `tz1dEezCSqMVsmfnaAZS2rBJZfdFCZEyA7DP`) is the address that possesses the total number of tokens (here 100000000). The generated initial storage is used to generate the origination command.

The following command originates the contract:
```
$ tezos-client originate contract fa12 transferring 0 from alice running fa12.tz --init '(Pair {  } { Elt "tz1dEezCSqMVsmfnaAZS2rBJZfdFCZEyA7DP" 10000000 })' --burn-cap 0 --force
```

We assume here that a *tezos sandbox* is used for faster testing purpose.

> Install [Tezos client](../../../docs/setup/1-tezos-client) and [Tezos sandbox](../../../docs/setup/2-sandbox).


## Formal properties
This section presents:
* the contract invariant property
* the properties verified by the `transfer` entry point and the contract invariant

The whole formal specification may be found [here](./4-fa12-archetype-properties).

The contract declares two [assets](https://docs.archetype-lang.org/archetype-language/data-model):

```archetype
asset ledger identified by holder to big_map {
  holder     : address;
  tokens     : nat = 0;
} initialized by {
  { holder = caller; tokens = totalsupply }
}
```
The `ledger` asset is the cap table: it holds the number of tokens for each token holder.
`totalsupply` is the initial number of tokens held by the originator of the contract.

```archetype
asset allowance identified by addr_owner addr_spender to big_map {
  addr_owner       : address;
  addr_spender     : address;
  amount           : nat;
}
```
The `allowance` asset stores the amount of tokens that can be spent by `addr_spender` on the behalf of `addr_owner`.

### Contract invariant

A contract invariant is a property that is verified regardless of the state of the storage.

```archetype
ledger.sum(tokens) = totalsupply
```
> No token is minted: the total number of tokens is equal to the initial `totalsupply` number of tokens.

### transfer

This section presents the properties of the `transfer` entry point.

First let's have a look at the Archetype implementation:

```archetype
entry %transfer (%from : address, %to : address, value : nat) {
  require {
    r1 otherwise "NotEnoughBalance" : ledger[%from].tokens >= value;
  }
  effect {
    if caller <> %from then (
      var current = allowance[(%from, caller)].amount;
      dofailif(current < value, ("NotEnoughAllowance", ((value, current))));
      allowance.update((%from, caller), { amount -=  value });
    );
    ledger.update(%from, { tokens -= value });
    ledger.addupdate(%to, { tokens += value });
  }
}
```
#### 1/ Effect on `ledger`

##### 1.1/ Effect on `%from` token holder
```archetype
%from <> %to ->
let some before_ledger_from = before.ledger[%from] in
let some after_ledger_from  = ledger[%from] in
  after_ledger_from = { before_ledger_from with
    tokens = (before_ledger_from.tokens - value)
  }
otherwise false
otherwise false
```
> When the `%to` address is different from the `%from` address, the number of tokens `%to` possesses is decread by `value`.

Elements of formal property language:
* `... -> ...` is the logical implication; it reads 'if ... then ...' (or '... implies ...')
* `let some ... in ... otherwise ...` is necessary because the `[  ]` operator on asset collection returns an option of asset; the `otherwise` branch is used to state property when the asset does not exist
* `before` refers to the state of the asset collection *before* execution of the entry point; without modifier, the default asset collection identifier refers to the state of the collection *after* execution

Please refer to the [documentation](https://docs.archetype-lang.org/archetype-language/contract-specification) for further explanation.

Thus the property reads: if `%from` is different from `%to` then the `%from` token holder *after* execution is equal to the `%from` token holder *before* execution except for the `tokens` field which is decreased by `value`.

Postconditions apply *when the entry point does not fail*.

The `transfer` entry fails when the `%from` token holder is not found in `ledger`. Therefore the contradiction property `false` is stated when the `%from` token holder is not found, whether *before* or *after* execution.

##### 1.2/ Effect on `%to` token holder
```archetype
%from <> %to ->
let some after_ledger_to = ledger[%to] in
let some before_ledger_to = before.ledger[%to] in
  after_ledger_to = { before_ledger_to with
    tokens = (before_ledger_to.tokens + value)
  }
otherwise
  after_ledger_to = { holder = %to; tokens = value }
otherwise false
```
> When the `%to` address is different from the `%from` address,
> the number of tokens `%to` possesses is increased by `value` when `%to` is already registered in the ledger, and set to `value` otherwise.
> Anyway, `%to` is registered in ledger.

##### 1.3/ No effect on `ledger`
```archetype
%from = %to -> ledger = before.ledger
```
> No effect on ledger when `%from` is equal to `%to`.

##### 1.4/ Unchanged `ledger` records

```archetype
forall tokenholder in ledger,
tokenholder.holder <> %from ->
tokenholder.holder <> %to ->
before.ledger[tokenholder.holder] = some(tokenholder)
```
> Tokenholders other than `%from` and `%to`, are not modified nor added to `ledger`.

Elements of formal property language:
* `forall ... in ... , ...` is used to state property for all assets in a collection

This property reads: for every token holder in the `ledger` collection *after* execution, if its `holder` field is different from `%from`, if its `holder` field is different from `%to`, then it is equal to the token holder *before* execution.

##### 1.5/ Removed `ledger` records

```archetype
removed.ledger.isempty()
```
> No record is removed from `ledger`.

Elements of formal property language:
* `removed` refers to the collection of removed assets due to the effect of entry point execution.

##### 1.6/ Added `ledger` records

```archetype
let some before_to = before.ledger[%to] in
  added.ledger.isempty()
otherwise
  added.ledger = [ { holder = %to; tokens = value } ]
```
> The added record in 'ledger', if any, is the `%to` record.

Elements of formal property language:
* `added` refers to the collection of added assets due to the effect of entry point execution.

#### 2/ Effect on `allowance`

##### 2.1/ Effect on `(%from,caller)` allowance record

```archetype
caller <> %from ->
let some before_from_caller = before.allowance[(%from,caller)] in
let some after_from_caller = allowance[(%from,caller)] in
  before_from_caller.amount > value ->
  after_from_caller = { before_from_caller with
    amount = (before_from_caller.amount - value)
  }
otherwise false
otherwise true
```

> When `caller` is different from `%from`, the amount `caller` is authorised to spend on the behalf of `%from` is decreased by `value` if `value` is striclty greated than the authorized amount.

##### 2.1/ No effect on `allowance`
```archetype
caller = %from -> allowance = before.allowance
```
> No effect on `allowance` when `caller` is equal to `%from`.

##### 2.2/ Unchanged `allowance` records
```archetype
forall a in allowance,
a.addr_owner <> %from and a.addr_spender <> caller ->
before.allowance[(a.addr_owner,a.addr_spender)] = some(a)
```

> Allowed amounts other than those associated to `%from` and `caller` are identical.

##### 2.3/ Added and removed `allowance` records
```archetype
removed.allowance.isempty() and added.allowance.isempty()
```
> No allowance record is added or removed.

#### 3/ Explicit `fail`

When the entry may explicitly fail, that is when it uses the `fail` instruction, it is possible to provide all the conditions of failure.

##### 3.1/ Not Enough Balance

```archetype
fails with (msg : string) :
  let some after_ledger_from = ledger[%from] in
    msg = "NotEnoughBalance" and
    after_ledger_from.tokens < value
  otherwise true
```

> When the entry fails with message "NotEnoughBalance", `value` is stricly greater than the number of tokens of `%to`.
> Cannot spend more than you own.

Element of formal property language:
* `fails with (...) : ...` declares the property when `fail` is invoked; the `with (... : ...)` syntax enables naming the fail argument and provide its type

The conditions of failure are provided as a conjonction of properties connected by the `and` logical connector.

##### 3.2/ Not Enough Allowance
```archetype
fails with (msg : string * (nat * nat)) :
  let some after_allowance_from_caller = allowance[(%from,caller)] in
    msg = ("NotEnoughAllowance", (value, after_allowance_from_caller.amount)) and
    caller <> %from and
    after_allowance_from_caller.amount < value
  otherwise false
```
> When the entry fails with message "NotEnoughAllowance", `caller` is different from `%from` and `value` is stricly greater than the allowed amount for `%from` and `caller`.
> A spender cannot spend more than allowed.

#### 4/ Effect on `operations`
```archetype
length (operations) = 0
```
> No operation generated.

### Other entry points properties

Properties of other entry points (`approve`, `getAllowance`, `getBalance` and `getTotalSupply`) may be found [here](./4-fa12-archetype-properties).

## Verify properties
This section presents how to verify the contract properties with Why3.

The following command generates the WhyML version of the contract:
```
$ archetype -t whyml fa12.arl > fa12.mlw
```

The generated WhyML contract is annotated with the properties. The role of Why3 is to generate proof obligations in [SMT solvers](https://en.wikipedia.org/wiki/Satisfiability_modulo_theories) formats for automatic verification.

The following command launches the why3 IDE on the WhyML version:
```
$ why3 ide -L $OPAM_SWITCH_PREFIX/share/archetype/mlw fa12.mlw
```

It may also be launched from VS Code with the following command:
```
Archetype: Verify with Why3
```
> Install [why3](https://docs.archetype-lang.org/getting-started-1#verification-tools)

108 proof obligations are generated for this contract.

Right-click on the `Fa12` module in the left-hand panel, and select `Auto level 2` as the solving strategy.

![why3 session](/img/why3_session.png)

`Auto level 2` is a strategy that first applies a few provers on the goal with a short time limit, then splits the goal and tries again on the subgoals.

#### Trusted Computing Base

|  Software | Version  |
|---|---|
| Archetype  |  1.2.0 |
| Why3  | 1.3.3  |
| Why3-ide  | 1.3.3  |
| Alt-Ergo | 2.3.1 |
| CVC4 | 4.1.7 |
| Z3 | 4.8.6 |


