---
id: 1-tezos-client
title: Tezos Client Installation and Setup
sidebar_label: Tezos Client
---

This tutorial uses
[tezos-client](https://tezos.gitlab.io/api/cli-commands.html) - a command line
interface to Tezos.

## Install

### Mac OS

With [Homebrew](https://brew.sh):

```shell
brew tap tqtezos/homebrew-tq https://github.com/tqtezos/homebrew-tq.git
brew install tezos
```

### Linux (64-bit)

Download `tezos-client` binary for 64-bit Linux:

```shell
wget https://github.com/serokell/tezos-packaging/releases/latest/download/tezos-client
```

Make it executable:

```shell
chmod +x tezos-client
```

Add it to `PATH` or create command alias, e.g.

```shell
alias tezos-client=$PWD/tezos-client
```

For more ways to install on Linux see [tezos-packaging
project](https://github.com/serokell/tezos-packaging)

### Windows

Install one of Linux distributions using  [Windows Subsystem for Linux
(WSL)](https://docs.microsoft.com/en-us/windows/wsl/about) (e.g. Ubuntu 18.04
LTS) and follow instructions for Linux.

## Configure

Let's configure `tezos-client` to use one of public
Tezos nodes in the test network (for this tutorial we would like to
skip setting up a local Tezos node which `tezos-client` uses by
default:

```shell
tezos-client -A rpcalpha.tzbeta.net -P 443 -S config update
```

Alternatively, one can use an isolated sandboxed network instead of using a
public test-network, see the [“Sandbox”](/docs/setup/2-sandbox)
section.

Verify that you can run tezos-client and that it points to test
nework:

```
$ tezos-client
Warning:

                 This is NOT the Tezos Mainnet.

     The node you are connecting to claims to be running on the
               Tezos Alphanet DEVELOPMENT NETWORK.
          Do NOT use your fundraiser keys on this network.
          Alphanet is a testing network, with free tokens.

Usage:
  tezos-client [global options] command [command options]
...
```

Now that we know we are on a test network let's disable this warning so
that we don't see it in the output for every command:

```shell
$ export TEZOS_CLIENT_UNSAFE_DISABLE_DISCLAIMER=yes
```

## Create Test Wallets

- Go to the [faucet](https://faucet.tzalpha.net/)
- Click `Get Testnet ꜩ`, which will download a `.json` file with a
  new wallet. The file will be named with the address of the account
  we're going to be creating, starting with `tz1...`
- Activate the account, passing it the path to the `.json` wallet you
  just downloaded (here, we're calling the account `alice`):

```shell
$ tezos-client activate account alice with ~/Downloads/tz1QLne6uZFxPRdRfJG8msx5RouENpJoRsfP.json
Waiting for the node to be bootstrapped before injection...
Current head: BL52YjrSCteP (timestamp: 2019-08-12T15:09:16-00:00, validation: 2019-08-12T15:09:28-00:00)
Node is bootstrapped, ready for injecting operations.
Operation successfully injected in the node.
Operation hash is 'opES9TEa9cazEs1mcc6jcbFAWNFtzLewpCD4evct6oG4T1m2od3'
Waiting for the operation to be included...
Error:

```

> Note empty `Error:` message at the end of the output. `tezos-client` attempts
> to wait for operation inclusion but the public Tezos node we are using
> disallows access (as a security measure) to the part of node api that is
> necessary for this functionality. We use `--wait none` throughout these
> tutorials to avoid this error. If you use your own local Tezos node you can
> omit `--wait none`, the error won't happen.

Make a variable for Alice's account address (notice that the address
is the same as the name of your faucet `.json` file):

```shell
ALICE_ADDRESS="tz1QLne6uZFxPRdRfJG8msx5RouENpJoRsfP"
```

Ensure that the activation was successful:

```shell
$ tezos-client get balance for $ALICE_ADDRESS
5310.946554 ꜩ
```

Now, we'll create a new wallet for Bob, since we'll need a second
account so we can perform transfers, etc. Repeat all steps in this
section starting with getting a new wallet `.json` file from the
faucet, replacing `alice` and `ALICE_ADDRESS` with `bob` and
`BOB_ADDRESS`, respectively.
