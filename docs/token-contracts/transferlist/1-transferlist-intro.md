---
id: 1-transferlist-intro
title: Transferlist Introduction
sidebar_label: Introduction
---

## What is a Transferlist?

This is an implementation of [TZIP-15](https://gitlab.com/tzip/tzip/-/blob/master/proposals/tzip-15/tzip-15.md)
for a transferlist interface: a lightweight permission schema suitable for asset allocation and transfer.

This schema is versatile and can either be used as part of a token
contract (i.e. in a monolith configuration) or as a separate contract that's
queried on demand.


## Setting up

Follow instructions in [Client Setup](/docs/setup/1-tezos-client) to set up
  `tezos-client` and create a test network wallet

Clone the [`lorentz-contract-transferlist` repository](https://github.com/tqtezos/lorentz-contract-transferlist),
and follow the [instructions in the README](
  https://github.com/tqtezos/lorentz-contract-transferlist/blob/master/README.md) to
  install the dependencies required to use the `lorentz-contract-transferlist`

Don't forget to set up an `ALICE_ADDRESS` and `BOB_ADDRESS` on the test network
[as described here](/docs/setup/1-tezos-client#createtestwallets);
we will be using these variables throughout this tutorial.

To set up more complex examples, we also use
`CHARLIE_ADDRESS` and `DAN_ADDRESS`.

