---
id: 2-sandbox
title: Use Docker and Flextesa to Run an Independent Tezos Sandbox
sidebar_label: Sandbox
---

Running ephemeral and isolated sandboxes can be useful to experiment with faster
networks or to automate reproducible tests.

Here we use [Flextesa](https://gitlab.com/tezos/flextesa) to run one or more
Tezos nodes, bakers, and endorsers contained in a sandbox environment.
The default sandbox is configured to be compatible with the `tezos-client`
installed in the [“Client-setup”](/docs/setup/1-tezos-client) section.


## Dependencies

This example requires Docker, available for Linux, Mac or Windows at
<https://www.docker.com>.

## Starting and Using a Sandbox

Start the sandbox *in the background* (will run with baking enabled):

```shell
docker run --rm --name my-sandbox --detach -p 20000:20000 \
       registry.gitlab.com/tezos/flextesa:image-tutobox-run carthagebox start
```

After a few seconds this should succeed:

```shell
tezos-client config reset        # Cleans-up left-over configuration.
tezos-client -A localhost -P 20000 bootstrapped
```

Configure the client to communicate with the sandbox:

```shell
tezos-client -A localhost -P 20000 config update
```

Then, instead of using a public faucet one can just use ꜩ by importing accounts
already existing in the sandbox. They are visible with:

```
 $ docker run --rm registry.gitlab.com/tezos/flextesa:image-tutobox-run carthagebox info

Usable accounts:

- alice
  * edpkvGfYw3LyB1UcCahKQk4rF2tvbMUk8GFiTuMjL75uGXrpvKXhjn
  * tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb
  * unencrypted:edsk3QoqBuvdamxouPhin7swCvkQNgq4jP5KZPbwWNnwdZpSpJiEbq
- bob
  * edpkurPsQ8eUApnLUJ9ZPDvu98E8VNj4KtJa1aZr16Cr5ow5VHKnz4
  * tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6
  * unencrypted:edsk3RFfvaFaxbHx8BMtEW1rKQcPtDML3LXjNqMNLCzC3wLC1bWbAt

Root path (logs, chain data, etc.): /tmp/mini-box (inside container).
```

You may then just import them:

```shell
tezos-client import secret key alice unencrypted:edsk3QoqBuvdamxouPhin7swCvkQNgq4jP5KZPbwWNnwdZpSpJiEbq --force
tezos-client import secret key bob unencrypted:edsk3RFfvaFaxbHx8BMtEW1rKQcPtDML3LXjNqMNLCzC3wLC1bWbAt --force
```

Check their balances:

```shell
tezos-client get balance for alice
```

## Using The Sandbox

See also the [Tezos Client](1-tezos-client.md) section or the
[Wallet-usage](https://tezos.gitlab.io/introduction/howtouse.html#transfers-and-receipts)
tutorial of the Tezos manual.

For instance, one can originate the most minimalistic
[contract](https://gitlab.com/tezos/tezos/blob/mainnet/src/bin_client/test/contracts/attic/id.tz):

```shell
# Download the contract:
wget https://gitlab.com/tezos/tezos/raw/mainnet/src/bin_client/test/contracts/attic/id.tz
# Run origination:
tezos-client originate contract hello-id transferring 0 from bob running id.tz --init "\"hello world\"" --burn-cap 1 --force
```

## Shutting Down The Sandbox

When you're done playing, just destroy the container:

    docker kill my-sandbox

## Advanced Usage

One can see the configuration of the protocol running in the sandbox with:

```shell
tezos-client rpc get /chains/main/blocks/head/context/constants
```

One important field is `"time_between_blocks": [ "5" ],` which means that blocks
are baked every 5 seconds (as opposed to 60 seconds on Mainnet).

This constant can be configured with the `block_time` environment variable, see
example below:

```shell
docker run --rm --name my-sandbox -e block_time=10 --detach -p 20000:20000 \
       registry.gitlab.com/tezos/flextesa:image-tutobox-run carthagebox start
```

The above command runs a full sandbox with the Carthage protocol and a slower
time-between-blocks of 10 seconds.

Many other parameters are set by the `carthagebox`
[script](https://gitlab.com/tezos/flextesa/-/blob/image-tutobox/src/scripts/tutorial-box.sh).
All the configuration options available can be seen with the command:

```bash
docker run --rm -it registry.gitlab.com/tezos/flextesa:image-tutobox-run flextesarl mini-net --help
```

For more issues or questions, see the
[Flextesa](https://gitlab.com/tezos/flextesa) repository.
