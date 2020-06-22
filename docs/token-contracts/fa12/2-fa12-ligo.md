---
id: 2-fa12-ligo
title: Working with FA1.2 using LIGO and Taquito
sidebar_label: FA1.2 LIGO
---

## Introduction

This chapter aims to show you how to originate (deploy) and initialize a
FA1.2 contract written in [PascaLIGO][] using the [Taquito][0] toolkit.

Taquito is a [TypeScript][] library that makes interacting with the Tezos
blockchain and smart contracts easier. It allows developers to call smart
contracts entry points as if they were simply javascript/typescript objects.

We are going to originate (the blockchain term for "deploy") a FA1.2 smart
contract to a Tezos test network.

When we originate the contract, we need to "initialize" the smart contracts
storage with initial values. The two values we are interested in are the number
of tokens and the address that will own the supply.

Before we originate the contract, we need a Tezos address, along with some Tezos
tokens, to pay for the gas costs associated with calling the Smart Contract. Gas
costs get paid using Tezos tokens, not the tokens represented within our soon to
be created asset contract.

To get a new address on a testnet, visit the Faucet website:
[faucet.tzalpha.net][3] and click the "Get ꜩ" button.

Save the faucet file to your computer and name it `faucet.json`. In the
`faucet.json` file, you can see a property name `pkh` that has a tezos address
starting with `tz1` as its value. Copy this address as you need it in the next
step.

## Originating the FA1.2 contract

You can use Taquito to originate a contract if you wish to do so. To keep this
tutorial short, we shall use the [LIGO web-ide][] to deploy a new contract to a
Tezos testnet.

> * Taquito documentation for originating contracts can be found [here][5]
> * The LIGO web ide uses Taquito under-the-covers, you can check out its source
> code [here][4]
> * An example of originating the FA1.2 contract (and more!) using Taquito
> [here][1]

To deploy your asset contract;

1. Click this [LIGO Share][2] link to open a ready-to-go [PascaLIGO][] reference
   implementation of the FA1.2 specification.
1. Choose the "Deploy" action under the "Configure" pick-list.
1. In the "Storage" field, you shall see the initial data for this Smart
   Contract. You must update two items:
       * Replace `YOUR_TZ_ADDRESS` with the address you copied from your faucet
     file earlier
       * Replace *both* occurrences of `TOKENS` with the total number of tokens
     you wish to issue.
1. With the "Deploy" action selected, Click "Run". The contract deployment
   process shall begin (and may take a couple of minutes).
1. When the deploy is complete, copy the address of the newly originated
   contract (You can optionally look at the contract using a blockchain explorer
   of your choice)

Now a newly deployed contract exists, with tokens allocated to your new Tezos
address from your faucet key.

## Using Taquito to transfer Asset Contract Tokens

Let's use Taquito to transfer some tokens!

> We assume you have a new javascript or typescript project, and you are using
> `npm`.

Install Taquito in your new project

```
npm install @taquito/taquito
```

Create a new file to contain our example, called `fa_taquito.ts`

Import the main taquito package into your project.

```js
const { Tezos } = require('@taquito/taquito')
```

The following code loads and imports the private key from the `faucet.json` file
we created earlier. The code uses Taquito's in-memory-signer, which is
convenient for development and testing, but use in production is
discouraged. Use a real wallet or HSM backed remote signer for production.

```js
const fs = require("fs");
const { email, password, mnemonic, secret } = JSON.parse(fs.readFileSync('./faucet.json').toString())

Tezos.setProvider({ rpc: 'https://api.tez.ie/rpc/carthagenet' })
Tezos.importKey(email, password, mnemonic.join(" "), secret)
```

Next, we shall query the chain for the contract we originated earlier.

```js
await const contract = await Tezos.contract.at('KT1...your_address_from_earlier')
```

When this code executes, Taquito fetches the contract code from the chain, and
dynamically generate methods on your contract object that correspond to the
FA1.2 entry points. These methods are the "abstraction" that Taquito provides to
make working with smart contracts more intuitive from a javascript perspective.

We can now make a transfer of our asset contract tokens between your address and
another arbitrary address.

To transfer `2` tokens is as easy as calling `contract.methods.transfer()`.
Let's set up a `src` and `dst` variable first.

```js
const pkhSrc = await Tezos.signer.publicKeyHash())
const pkhDst =  "tz1eY5Aqa1kXDFoiebL28emyXFoneAoVg1zh"
```

Now we will call the `transfer` method on our contract.

```js
const op = await contract.methods.transfer(pkhSrc, pkhDst, "2").send()
await op.confirmation()
const storage = await contract.storage()
```

We can now query the balance for each address as follows:

```js
console.log((await storage.ledger.get(pkhSrc)).balance)
console.log((await storage.ledger.get(pkhDst)).balance)
```

You should now have the basics of interacting with an FA1.2 Asset Contract on
Tezos using Taquito. We used [LIGO][] in this tutorial, but Taquito works with any
Tezos smart contract.

[0]: https://tezostaquito.io/
[1]: https://github.com/ecadlabs/token-contract-example/blob/master/deploy.js
[2]: https://ide.ligolang.org/p/-hNqhvMFDFdsTULXq4K-KQ
[3]: https://faucet.tzalpha.net/
[4]: https://gitlab.com/ligolang/ligo-web-ide
[5]: https://tezostaquito.io/docs/originate
[PascaLIGO]: https://ligolang.org/
[LIGO]: https://ligolang.org/
[LIGO web-ide]: https://ide.ligolang.org/
[TypeScript]: https://www.typescriptlang.org/
