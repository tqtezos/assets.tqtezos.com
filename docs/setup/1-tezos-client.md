---
id: 1-tezos-client
title: Tezos Client Installation and Setup
sidebar_label: Tezos Client
---

To start with we'll download and install tezos-client and create a couple of
test wallets. We'll use
[tezos-client](https://tezos.gitlab.io/api/cli-commands.html) - a command line
interface to Tezos.

## Install

### Mac OS

With [Homebrew](https://brew.sh):

```shell
$ brew tap serokell/tezos-packaging https://github.com/serokell/tezos-packaging.git
$ brew install tezos-client
```

`tezos-packaging` also provides prebuilt brew bottles for some macOS versions.

### Linux (64-bit)

A quick and easy way to get tezos-client running on Linux is to download the
latest `tezos-client` binary, make it executable, and put it somewhere in your
path. Alternatively you can add a package repository for your distribution, and
install it from there. Using a package is a good idea for production systems as
it automates the installation and allow easy updates.


#### Option 1:  Install the binary

```shell
$ wget https://github.com/serokell/tezos-packaging/releases/latest/download/tezos-client
$ chmod +x tezos-client
$ mkdir -p $HOME/.local/bin
$ mv tezos-client $HOME/.local/bin
$ echo 'export PATH="$HOME/.local/bin:$PATH"' >> $HOME/.bashrc
$ source $HOME/.bashrc
```

#### Option 2:  Using packages on Ubuntu or Fedora
For more ways to install on Linux see [tezos-packaging
project](https://github.com/serokell/tezos-packaging)

### Windows

Install one of Linux distributions using  [Windows Subsystem for Linux
(WSL)](https://docs.microsoft.com/en-us/windows/wsl/about) (e.g. Ubuntu 18.04
LTS) and follow instructions for Linux.

## Configure

We'll configure `tezos-client` to use a public test network Tezos node:


```shell
$ tezos-client --endpoint https://rpcalpha.tzbeta.net config update
```

`--endpoint` parameter specifies the address of the server,
`config update` writes it to `tezos-client`'s configuration filed at
`$HOME/.tezos-client/config`.

[//]: # ( TODO: In the interests of keeping things simple, I'd suggest leaving
the following option out at this early stage. - IAN )

Alternatively, one can use an isolated sandboxed network instead of using a
public test-network, which we'll do in the [“Sandbox”](/docs/setup/2-sandbox)
section.

### Try it out
Verify that you can run tezos-client and that it points to test
network:

```
$ tezos-client
Warning:

                 This is NOT the Tezos Mainnet.

           Do NOT use your fundraiser keys on this network.

Usage:
  tezos-client [global options] command [command options]
  tezos-client --help (for global options)
  tezos-client [global options] command --help (for command options)

To browse the documentation:
  tezos-client [global options] man (for a list of commands)
  tezos-client [global options] man -v 3 (for the full manual)

Global options (must come before the command):
  -d --base-dir <path>: client data directory
  -c --config-file <path>: configuration file
  -t --timings: show RPC request times
  --chain <hash|tag>: chain on which to apply contextual commands (possible tags are 'main' and 'test')
  -b --block <hash|tag>: block on which to apply contextual commands (possible tags are 'head' and 'genesis')
  -w --wait <none|<int>>: how many confirmation blocks before to consider an operation as included
  -p --protocol <hash>: use commands of a specific protocol
  -l --log-requests: log all requests to the node
  -A --addr <IP addr|host>: [DEPRECATED: use --endpoint instead] IP address of the node
  -P --port <number>: [DEPRECATED: use --endpoint instead] RPC port of the node
  -S --tls: [DEPRECATED: use --endpoint instead] use TLS to connect to node.
  -E --endpoint <uri>: HTTP(S) endpoint of the node RPC interface; e.g. 'http://localhost:8732'
  -R --remote-signer <uri>: URI of the remote signer
  -f --password-filename <filename>: path to the password filename
  -M --mode <client|mockup>: how to interact with the node
  ```

Now that we know we are on a test network we can temporarily disable this
warning so that we don't see it with each command.

```shell
$ export TEZOS_CLIENT_UNSAFE_DISABLE_DISCLAIMER=yes
```

## Create Test Wallets

> With tezos-client installed we can now make a couple of test wallets.

- Go to the [faucet](https://faucet.tzalpha.net/).
- Complete the captcha and download the wallet in the form of a .json file.
- The file name is the wallet address (also known as the public key hash, or
  PKH) with a .json extension.
- If you look inside the file you will see a property called pkh which contains the address.
- The public key hash is used to identify the account on the Tezos block chain
  and can be thought of as an address or account number.
- Next we'll activate the account, passing it the path to the `.json` wallet we
  just downloaded
- We'll first create an account for Alice, then Bob, so we can perform some test
  transactions.
- Don't be alarmed by the blank `Error:` we'll explain why shortly.

```shell
$ tezos-client activate account alice with ~/Downloads/tz1QLne6uZFxPRdRfJG8msx5RouENpJoRsfP.json
Node is bootstrapped, ready for injecting operations.
Operation successfully injected in the node.
Operation hash is 'oog2gMSBNWWTgHujoKViJaCed4wq27gPnLpHKQ27C5savX9ewAq'
Waiting for the operation to be included...
Error:

```

> Note empty `Error:` message at the end of the output. `tezos-client` attempts
> to wait for operation inclusion but the public Tezos node we are using
> disallows access (as a security measure) to the part of node api that is
> necessary for this functionality. We use `--wait none` throughout these
> tutorials to avoid this error. If you use your own local Tezos node you can
> omit `--wait none`, the error won't happen.

Make a variable for Alice's account address  (PKH) (notice that the address
is the same as the name of your faucet `.json` file):

```shell
$ ALICE_ADDRESS="tz1QLne6uZFxPRdRfJG8msx5RouENpJoRsfP"
```

Ensure that the activation was successful:

```shell
$ tezos-client get balance for $ALICE_ADDRESS
56828.546322 ꜩ
```

Now, we'll create a new wallet for Bob so we can do some test transactions in
the next section.

- Go back to the [faucet](https://faucet.tzalpha.net/) and download a second wallet
```shell
$ tezos-client activate account bob with tz1ZQYMDETodNBAc2XVbhZFGme8KniuPqrSw.json
$ BOB_ADDRESS="tz1ZQYMDETodNBAc2XVbhZFGme8KniuPqrSw"
$ tezos-client get balance for $BOB_ADDRESS
```
