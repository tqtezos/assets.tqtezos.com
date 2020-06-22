---
id: 6-confirm-nodes
title: Confirm the Nodes
---

## Making Sure Our Nodes are Working

We want to make sure the nodes are up and syncing correctly. In order to do that, we need to get the address of the NLB (Node Load Balancer) that our EC2 containers are connected through.

In the AWS console, navigate to Services > EC2 > Load Balancers. Click on the node load balancer to bring up details. Find the DNS name and copy it.
<img src="/img/images/confirm.png"/>

In a terminal window, you can `curl http://<nlb-address>:8732/monitor/bootstrapped` to see if your nodes are up and the timestamp on their latest block (i.e. whether they are in sync).

```shell
$ curl http://testnet-nodes-NLB-876d45cbc59efb92.elb.us-west-2.amazonaws.com:8732/monitor/bootstrapped

{"block":"BL3ZwKGAp8o986wQ5LkvThTcEtEyj84LeVfoNGGVqJnteyMjoyH","timestamp":"2020-01-24T21:55:50Z"}
```

Our node is responding and up to date!

Now let’s query the data. We can use the [RPCs](https://tezos.gitlab.io/developer/rpc.html) to get the latest block with `curl -s http://<nlb-address>:8732/chains/main/blocks/head`

```shell
$ curl -s http://testnet-nodes-NLB-876d45cbc59efb92.elb.us-west-2.amazonaws.com:8732/chains/main/blocks/head

{"protocol":"PsBabyM1eUXZseaJdmXFApDSBqj8YBfwELoxZHHW77EMcAbbwAS","chain_id":"NetXUdfLh6Gm88t","hash":"BLedAPryPxDcCSYAuYm8PS9ohFVhujBT1fAGpARdwmUXH5UKUwQ","header":{"level":237137,"proto":1,"predecessor":"BMf1MaBXLqzfyLrF2uwBMnRDqtq4HeYs5MpcaG2DRyPu297BkPB","timestamp":"2020-01-24T22:00:32Z","validation_pass":4,"operations_hash":"LLoa8wtVnRa8npi4ejFUMDfmnBy6uwas9S9KHKcgvZar25JzLRoh2","fitness":["01","0000000000039e50"],"context":

….

```

We can also interact with our node through the [tezos-client](https://tezos.gitlab.io/api/cli-commands.html). We just need to provide the NLB address and port. `tezos-client -A <nlb-address> -P 8732 `

```shell
$ tezos-client -A testnet-nodes-NLB-876d45cbc59efb92.elb.us-west-2.amazonaws.com -P 8732 bootstrapped

Warning:

 

                 This is NOT the Tezos Mainnet.

 

     The node you are connecting to claims to be running on the

               Tezos Alphanet DEVELOPMENT NETWORK.

          Do NOT use your fundraiser keys on this network.

          Alphanet is a testing network, with free tokens.

Current head: BL4fD1vf8TNk (timestamp: 2020-01-24T22:12:24-00:00, validation: 2020-01-24T22:12:55-00:00)

Bootstrapped.

```

Yay! Our node is working!