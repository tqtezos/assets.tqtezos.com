---
id: 1-multisig-specialized-intro
title: Specialized Multisig Introduction
sidebar_label: Introduction
---

## What is a Specialized Multisig?
While there is a [Generic Multisig
Contract](https://github.com/murbard/smart-contracts/blob/master/multisig/michelson/generic.tz)
that allows a quorum of signers to approve arbitrary Michelson
commands on the blockchain, it behaves more like a user whose
arbitrary action is voted upon than a gatekeeper.

What is meant by _"arbitrary action"_?  That generic multisig contract
accepts arbitrary Michelson code as its main input: signers need to
know what this code is doing to know what they're voting on.

We use another approach: the multisig contract is specialized to the particular contract type you'd like to use with it. That is, the multisig contract's parameters must match those of the contract it is administering. 

It will only perform the exact actions your contract expects. This prevents any action that the base contract does not support from
being executed.

To set up and interact with a specialized multisig contract:

- Use `lorentz-contract-mulitsig` command line tool to originate your contract with multisig functionality with a specialized target parameter type
- Submit the signed transaction bytes using the `tezos-client` for all participating admins

## Setting up

Follow instructions in [Client Setup](/docs/setup/1-tezos-client) to set up
  `tezos-client` and create a test network wallet

Clone the [`lorentz-contract-multisig` repository](https://github.com/tqtezos/lorentz-contract-multisig), and follow the [instructions in the README](
  https://github.com/tqtezos/lorentz-contract-multisig/blob/master/README.md) to
  install the dependencies required to use the `lorentz-contract-multisig`

Don't forget to set up an `ALICE_ADDRESS` and `BOB_ADDRESS` on the test network [as described here](/docs/setup/1-tezos-client#createtestwallets:); we will be using these variables throughout this tutorial.

## Getting your public key

We'll want our public/private keys to work with the client:

Here's a convenient way to get them, assuming `tezos-client` has
registered/activated your account:

```shell
get_public_key(){ tezos-client show address $1 2>/dev/null | tail -n 1 | cut -d " " -f 3;}
get_secret_key(){ tezos-client show address $1 -S 2>/dev/null | tail -n 1 | cut -d ":" -f 3;}
```

```shell
$ get_public_key alice

edpkvCHgVArnZo9RTP4P6euLTyhE89u73CYjBgsP4wEJbj4quao9oR
```
