---
id: 1-fa12-intro
title: Getting started with FA1.2
sidebar_label: Introduction
---

## What is FA1.2?

FA1.2 refers to an [ERC20](https://eips.ethereum.org/EIPS/eip-20)-like fungible token standard (TZIP-7) for Tezos. At its core, FA1.2 contains a ledger which maps identities to token balances, providing a standard API for token transfer operations, as well as providing approval to external contracts (e.g. an auction) or accounts to transfer a user's tokens.

The FA1.2 specification is described in details in
[TZIP-7](https://gitlab.com/tzip/tzip/blob/master/proposals/tzip-7/tzip-7.md).

## How does FA1.2 differ from ERC20?

For those coming from [ERC20](https://eips.ethereum.org/EIPS/eip-20), FA1.2 interface differs from ERC-20 in that it does not contain `transferfrom`, which has instead been merged into a single `transfer` entrypoint. The implementations provided in these docs also contain different metadata specifications based on an emerging token standard proposal called [FA2](https://gitlab.com/tzip/tzip/-/blob/master/proposals/tzip-12/tzip-12.md).

## Get started with FA1.2 tokens

These docs contain two implementations (Lorentz and LIGO) of FA1.2 as well as a guide to interact and manage FA1.2 tokens with a specialized multisig contract.




