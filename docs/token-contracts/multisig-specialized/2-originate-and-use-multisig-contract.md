---
id: 2-originate-and-use-multisig-contract
title: Originate and Use
---

## Generating the Specialized Multisig Contract Code

Make sure you have already followed the [setup steps](/docs/token-contracts/multisig-specialized/1-multisig-specialized-intro#setting-up) before continuing.

To see a list of supported contracts and actions, run:
`stack exec -- lorentz-contract-multisig --help`

You can use the `lorentz-contract-multisig` tool to generate valid Michelson for
the multisig contract you'd like to create, specialized to accept only the
parameter you've specified.

Let's say that we want to generate a multisig contract that only accepts a `nat`
as a valid argument. We can accomplish this using the `print-specialized`
command as follows:

```shell
$ stack exec -- lorentz-contract-multisig GenericMultisig print-specialized --parameterType 'nat' --oneline

parameter (pair (pair (nat :counter) (or :action (pair nat (contract nat)) (pair (nat :threshold) (list :keys key)))) (list :sigs (option signature)));storage (pair nat (pair nat (list key)));code { CAST (pair (pair (pair nat (or (pair nat (contract nat)) (pair nat (list key)))) (list (option signature))) (pair nat (pair nat (list key))));DUP;CAR;DIP { CDR };DIP {  };PUSH mutez 0;AMOUNT;COMPARE;EQ;IF {  }   { PUSH string "Some tokens were sent to this contract outside of a unit entry point.";FAILWITH };SWAP;DUP;DIP { SWAP };DIP { DUP;CAR;DIP { CDR };DUP;SELF;ADDRESS;CHAIN_ID;PAIR;PAIR;PACK;DIP { DUP;CAR;DIP { CDR };DIP { SWAP } };SWAP };DUP;CAR;DIP { CDR };DIP { SWAP };COMPARE;EQ;IF {  }   { PUSH string "Counters do not match.";FAILWITH };DIP { SWAP };DUP;CAR;DIP { CDR };DIP { PUSH nat 0;SWAP;ITER { DIP { SWAP };SWAP;IF_CONS { IF_NONE { SWAP;DROP }        { SWAP;DIP { SWAP;DIP { DIP { DIP { DUP };SWAP } };DIP 2 { DUP };DIG 2;DIP { CHECK_SIGNATURE };SWAP;IF { DROP }   { FAILWITH };PUSH nat 1;ADD } } }        { FAILWITH };SWAP } };COMPARE;LE;IF {  }   { PUSH string "Quorum not present";FAILWITH };IF_CONS { FAILWITH }        {  };DROP;DIP { DUP;CAR;DIP { CDR };PUSH nat 1;ADD;PAIR };IF_LEFT { DIP {  };SWAP;DIP { DUP;CAR;DIP { CDR };DIP { DIP { NIL operation };PUSH mutez 0 };TRANSFER_TOKENS;CONS };SWAP }        { DIP { CAR };SWAP;PAIR;NIL operation };PAIR };
```

The `lorentz-contract-multisig` script has generated a valid Michelson contract
for us. We can do the same thing with any of the
[valid Michelson types](https://tezos.gitlab.io/whitedoc/michelson.html#core-data-types-and-notations).

If we generate with a map from string to int, it would look like the following:

```
$ stack exec -- lorentz-contract-multisig GenericMultisig print-specialized \
  --parameterType 'map string int' --oneline

parameter (pair (pair (nat :counter) (or :action (pair (map string int) (contract (map string int))) (pair (nat :threshold) (list :keys key)))) (list :sigs (option signature)));storage (pair nat (pair nat (list key)));code { CAST (pair (pair (pair nat (or (pair (map string int) (contract (map string int))) (pair nat (list key)))) (list (option signature))) (pair nat (pair nat (list key))));DUP;CAR;DIP { CDR };DIP {  };PUSH mutez 0;AMOUNT;COMPARE;EQ;IF {  }   { PUSH string "Some tokens were sent to this contract outside of a unit entry point.";FAILWITH };SWAP;DUP;DIP { SWAP };DIP { DUP;CAR;DIP { CDR };DUP;SELF;ADDRESS;CHAIN_ID;PAIR;PAIR;PACK;DIP { DUP;CAR;DIP { CDR };DIP { SWAP } };SWAP };DUP;CAR;DIP { CDR };DIP { SWAP };COMPARE;EQ;IF {  }   { PUSH string "Counters do not match.";FAILWITH };DIP { SWAP };DUP;CAR;DIP { CDR };DIP { PUSH nat 0;SWAP;ITER { DIP { SWAP };SWAP;IF_CONS { IF_NONE { SWAP;DROP }        { SWAP;DIP { SWAP;DIP { DIP { DIP { DUP };SWAP } };DIP 2 { DUP };DIG 2;DIP { CHECK_SIGNATURE };SWAP;IF { DROP }   { FAILWITH };PUSH nat 1;ADD } } }        { FAILWITH };SWAP } };COMPARE;LE;IF {  }   { PUSH string "Quorum not present";FAILWITH };IF_CONS { FAILWITH }        {  };DROP;DIP { DUP;CAR;DIP { CDR };PUSH nat 1;ADD;PAIR };IF_LEFT { DIP {  };SWAP;DIP { DUP;CAR;DIP { CDR };DIP { DIP { NIL operation };PUSH mutez 0 };TRANSFER_TOKENS;CONS };SWAP }        { DIP { CAR };SWAP;PAIR;NIL operation };PAIR };
```

You can compare the two outputs above and see where the new type has been inserted.

If we were to try to generate a contract using an invalid type, we would get a
parse error. The `lorentz-contract-multisig` tool typechecks for you.

```shell
$ stack exec -- lorentz-contract-multisig GenericMultisig print-specialized \
  --parameterType 'not-a-type' --oneline

ParseErrorBundle {bundleErrors = FancyError 0 (fromList [ErrorCustom UnknownTypeException]) :| [], bundlePosState = PosState {pstateInput = "not-a-type", pstateOffset = 0, pstateSourcePos = SourcePos {sourceName = "parameter", sourceLine = Pos 1, sourceColumn = Pos 1}, pstateTabWidth = Pos 8, pstateLinePrefix = ""}}
CallStack (from HasCallStack):
  error, called at src/Lorentz/Contracts/GenericMultisig/Parsers.hs:246:29 in lorentz-contract-multisig-0.1.0.1-7nDq5hWdrcbHFov64Ydo4r:Lorentz.Contracts.GenericMultisig.Parsers
```

## Generating the Initial Storage
Note, this section uses the
[bash functions defined here](/docs/token-contracts/multisig-specialized/1-multisig-specialized-intro#getting-your-public-key).

The Generic Multisig allows us to set administrators of the contract
(`signerKeys`) and the number of those administrators required to sign
(`threshold`). As of writing, the command line tool only allows `tz1` implicit
accounts to be administrators, though the contract allows `KT1` originated
accounts as well.

To generate the Michelson for the initial storage, e.g. for two admins:

```shell
$ stack exec -- lorentz-contract-multisig GenericMultisig init-specialized \
  --threshold 1 --signerKeys "[\"$(get_public_key bob)\",\"$(get_public_key alice)\"]"

Pair 0 (Pair 1 { "edpkuPTVBFtbYd6gZWryXypSYYq6g7FvyucwphoU78T1vmGkbhj6qb"; "edpkvCHgVArnZo9RTP4P6euLTyhE89u73CYjBgsP4wEJbj4quao9oR" })
```

Note that in order to parse the list of `signerKeys` correctly, you must escape
the quotes, and separate them with a comma and no whitespace.

In the above command, we added two possible signers, and set a threshold of 1,
so if we initialize a multisig contract with this storage, all transactions on
it will need to be signed by at least one of the two in the list for the
transactions to be valid.

If the `threshold` is set higher than the number of admins that can sign, an
error is thrown, since it is impossible to ever have more admins sign than are
in the list of `signerKeys`:

```shell
$ stack exec -- lorentz-contract-multisig GenericMultisig init-specialized \
  --threshold 2 --signerKeys "[\"$(get_public_key bob)\"]"

threshold is greater than the number of signer keys
CallStack (from HasCallStack):
  error, called at src/Lorentz/Contracts/GenericMultisig/CmdLnArgs.hs:302:13 in lorentz-contract-multisig-0.1.0.1-7nDq5hWdrcbHFov64Ydo4r:Lorentz.Contracts.GenericMultisig.CmdLnArgs
```

## Originating the Multisig Contract with the Generated Michelson

Using the commands we saw above, we can now originate our contract using the
`tezos-client` and the contract and initial storage we generated. We will create
a contract `MultisigNat` that has two admins, Bob and Alice, and only allows a
`nat` param type.

```shell
$ tezos-client --wait none originate contract MultisigNat transferring 0 from \
  $BOB_ADDRESS running "$(stack exec -- lorentz-contract-multisig GenericMultisig \
  print-specialized --parameterType 'nat' --oneline)" \
  --init "$(stack exec -- lorentz-contract-multisig GenericMultisig \
  init-specialized --threshold 1 \
  --signerKeys "[\"$(get_public_key bob)\",\"$(get_public_key alice)\"]")" \
  --burn-cap 1.14

Waiting for the node to be bootstrapped before injection...
Current head: BLzWwsRQcRsp (timestamp: 2020-07-09T16:31:42-00:00, validation: 2020-07-09T16:32:10-00:00)
Node is bootstrapped, ready for injecting operations.
Estimated gas: 31880 units (will add 100 for safety)
Estimated storage: 1140 bytes added (will add 20 for safety)
Operation successfully injected in the node.
Operation hash is 'oo9o8JHvRceyiUZ8DA1U3fTi8C6Nvc5mUBHxYGKTAXQa6BAddwT'
NOT waiting for the operation to be included.
Use command
  tezos-client wait for oo9o8JHvRceyiUZ8DA1U3fTi8C6Nvc5mUBHxYGKTAXQa6BAddwT to be included --confirmations 30 --branch BLzWwsRQcRspFLWG5cWZF9No5g3VSZ5jgxnuDF3omYWg7ZVbHHR
and/or an external block explorer to make sure that it has been included.
This sequence of operations was run:
  Manager signed operations:
    From: tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm
    Fee to the baker: ꜩ0.004353
    Expected counter: 623986
    Gas limit: 31980
    Storage limit: 1160 bytes
    Balance updates:
      tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm ............. -ꜩ0.004353
      fees(tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU,269) ... +ꜩ0.004353
    Origination:
      From: tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm
      Credit: ꜩ0
      Script:
        { ... }
        Initial storage:
          (Pair 0
                (Pair 1
                      { "edpkuPTVBFtbYd6gZWryXypSYYq6g7FvyucwphoU78T1vmGkbhj6qb" ;
                        "edpkvCHgVArnZo9RTP4P6euLTyhE89u73CYjBgsP4wEJbj4quao9oR" }))
        No delegate for this contract
        This origination was successfully applied
        Originated contracts:
          KT1NUp9a8gC5xQJDi4E9hr2WRZpUxx8BQrT3
        Storage size: 883 bytes
        Paid storage size diff: 883 bytes
        Consumed gas: 31880
        Balance updates:
          tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm ... -ꜩ0.883
          tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm ... -ꜩ0.257

New contract KT1NUp9a8gC5xQJDi4E9hr2WRZpUxx8BQrT3 originated.
Contract memorized as MultisigNat.
```

We can store the contract address in a bash variable:

```shell
$ MULTISIG_NAT_ADDRESS="KT1NUp9a8gC5xQJDi4E9hr2WRZpUxx8BQrT3"
```

## Administer a Second Contract with Specialized Multisig


### Originating the Admin42 Contract

The `MultisigNat` contract can now be used to administer contracts that accept
`nat` as their parameters. For this tutorial, we're going to use an example
contract found in the `lorentz-contract-multisig` repository, called
[Admin42](https://github.com/tqtezos/lorentz-contract-multisig/blob/master/admin_42.tz).
This contract requires an administrator to interact with it, and accepts a `nat`
as a parameter (only the parameter `42` to be precise!), so we can use the
`MultisigNat` contract to administer it.

(You can find more information about the Admin42 contract itself in
[the `lorentz-contract-multisig` repo](https://github.com/tqtezos/lorentz-contract-multisig/blob/master/README_SPECIALIZED.md#admin42-contract))


First we will originate the Admin42 contract, making our `MultisigNat` contract
the administrator.
```shell
$ tezos-client --wait none originate contract MultisigAdmin42 transferring 0 \
  from $BOB_ADDRESS running "$(cat admin_42.tz | tr '\n' ' ')" \
  --init "\"$MULTISIG_NAT_ADDRESS\"" --burn-cap 0.406

Waiting for the node to be bootstrapped before injection...
Current head: BLGqGwqVRJEd (timestamp: 2020-07-09T16:35:12-00:00, validation: 2020-07-09T16:35:38-00:00)
Node is bootstrapped, ready for injecting operations.
Estimated gas: 13516 units (will add 100 for safety)
Estimated storage: 406 bytes added (will add 20 for safety)
Operation successfully injected in the node.
Operation hash is 'op8Swwt9bYvQ58gbGPoZijJfx94tB2pbByVSco44PXuWme8oMwT'
NOT waiting for the operation to be included.
Use command
  tezos-client wait for op8Swwt9bYvQ58gbGPoZijJfx94tB2pbByVSco44PXuWme8oMwT to be included --confirmations 30 --branch BLGqGwqVRJEdkEF9oborwD3BQkLKVuuWRxni6FwP155s5aqxKqQ
and/or an external block explorer to make sure that it has been included.
This sequence of operations was run:
  Manager signed operations:
    From: tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm
    Fee to the baker: ꜩ0.001754
    Expected counter: 623987
    Gas limit: 13616
    Storage limit: 426 bytes
    Balance updates:
      tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm ............. -ꜩ0.001754
      fees(tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU,269) ... +ꜩ0.001754
    Origination:
      From: tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm
      Credit: ꜩ0
      Script:
        { parameter nat ;
          storage address ;
          code { DUP ;
                 CDR ;
                 SENDER ;
                 ASSERT_CMPEQ ;
                 DUP ;
                 CAR ;
                 PUSH nat 42 ;
                 ASSERT_CMPEQ ;
                 CDR ;
                 NIL operation ;
                 PAIR } }
        Initial storage: "KT1NUp9a8gC5xQJDi4E9hr2WRZpUxx8BQrT3"
        No delegate for this contract
        This origination was successfully applied
        Originated contracts:
          KT1U2qHuZrKm7EwwRZ9j6XpZyd9y6VDhpQVo
        Storage size: 149 bytes
        Paid storage size diff: 149 bytes
        Consumed gas: 13516
        Balance updates:
          tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm ... -ꜩ0.149
          tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm ... -ꜩ0.257

New contract KT1U2qHuZrKm7EwwRZ9j6XpZyd9y6VDhpQVo originated.
Contract memorized as MultisigAdmin42.
```

And save the contract address in a variable:
```shell
$ MULTISIG_ADMIN42_ADDRESS="KT1U2qHuZrKm7EwwRZ9j6XpZyd9y6VDhpQVo"
```

### Signing A Transaction with One Signer

When we interact with our `MultisigNat` contract, we must include enough admin
signer keys to meet our threshold. In this case, we have two admins, and a
threshold of 1, so either Bob or Alice must sign any transaction that calls this
contract, otherwise it will be rejected.

The steps to sign are:

1. Generate bytes
2. Sign the bytes
3. Save the signature
4. Run the transaction using the signature

Let's sign an operation as Alice to begin with.

We'll need the chain ID, which we can get from the RPC:

```shell
$ tezos-client rpc get /chains/main/chain_id

"NetXjD3HPJJjmcd"
```

Set a bash variable for the chain ID:
```shell
$ CHAIN_ID="NetXjD3HPJJjmcd"  
```

First, we'll generate the bytes
to sign using the `lorentz-contract-multisig` tool.

```shell
$ stack exec -- lorentz-contract-multisig GenericMultisig run-multisig \
  --target-parameterType 'nat' --target-parameter '42' \
  --target-contract "\"$MULTISIG_ADMIN42_ADDRESS\"" \
  --multisig-contract "$MULTISIG_NAT_ADDRESS" --counter 0 --signatures "Nothing" \
  --signerKeys "[\"$(get_public_key bob)\",\"$(get_public_key alice)\"]" --chainId $CHAIN_ID

"0x05070707070a000000049caecab90a000000160198716bd8c37c014c606841e5f7398ed70d99a6a9000707000005050707002a0a0000001601d55850d12efa417a6d53f8290f027c2650390aef00"
```

Let's break that down.

- `target-parameterType`: We already know that our `MultisigNat` and
  `MultisigAdmin42` contracts take a `nat` type parameter.
- `target-parameter`: MultisigAdmin42 only allows you to send the parameter value
  `42`, so we'll pass that as our target param.
- `target-contract`: Our ultimate goal is to send the param to
  `$MULTISIG_ADMIN42_ADDRESS`, so that is our target.
- `multisig-contract`: The multisig contract managing our target contract is
  `$MULTISIG_NAT_ADDRESS`.
- `counter`: Since this is the first transaction we're sending through our
  `MultisigNat` contract, our `counter` is 0. If you don't know the correct
  counter value, you can use the following command to get the value.
```shell
stack exec -- lorentz-contract-multisig GenericMultisig get-counter-specialized --storageText "$(tezos-client get contract storage for $MULTISIG_NAT_ADDRESS)" --signerKeys "[\"$(get_public_key bob)\",\"$(get_public_key alice)\"]"
```
- `signatures`: Right now, we are not signing anything, so the argument is
  `"Nothing"`. In a couple more steps, we'll be passing a list of signatures
  here.
- `signerKeys`: This is the exact same list of keys you originated the contract
  with (in the same order!) As a bonus, the `get-counter-specialized` function
  described in the `counter` bullet will confirm that the list of public keys
  you have correctly matches the storage.
- `chainId`: This is the chain ID of the chain we're submitting to. Including
  it in the signature prevents replay attacks across different chains.

Now we'll take the bytes we generated with the last command, and sign them as Alice.

```shell
$ tezos-client sign bytes \
  "0x05070707070a000000049caecab90a000000160198716bd8c37c014c606841e5f7398ed70d99a6a9000707000005050707002a0a0000001601d55850d12efa417a6d53f8290f027c2650390aef00" \
  for alice

Signature: edsigtczKcLhrkFsRKhp9cUPdbv19z9g9ZUmKkHXLA42UJMJDJ2nQypNK2iwzbrGM2HHDQR5cGYSpyVPctSkM8jAC1zHGEKyVGc
```

And save the signature
```shell
$ OPERATION_SIGNATURE="edsigtczKcLhrkFsRKhp9cUPdbv19z9g9ZUmKkHXLA42UJMJDJ2nQypNK2iwzbrGM2HHDQR5cGYSpyVPctSkM8jAC1zHGEKyVGc"
```

Now we're going to use the `lorentz-contract-multisig` tool again, but we're
going to include our signature now. There are a few things to notice here:
- Even though I am sending the `$OPERATION_SIGNATURE` from Alice, I can still
  create the transaction as a transfer from `$BOB_ADDRESS` to the
  `$MULTISIG_NAT_ADDRESS`. In fact, we could have sent this transaction from
  `$FRED_ADDRESS`, and as long as we have the correct signatures, it would work.
- The syntax for the argument to `signatures` should be noted. The structure
  must be a list that matches the `signerKeys`, that is, for every `signerKey`,
  there must be a corresponding entry in the signature list. In this case, we
  have only Alice signing. Alice is the second public key in the `signerKeys`
  list, so when we structure our `signatures` list, we will put the
  `$OPERATION_SIGNATURE` she signed in the second entry in the list. Since Bob
  is not signing, we put `Nothing` in his index in the list. So we'll have
  `"Just[Nothing,Just\"$OPERATION_SIGNATURE\"]"`. If Bob were signing, and Alice
  were not, we'd have `"Just[Just\"$OPERATION_SIGNATURE\",Nothing]"` and if both
  were signing, we'd have
  `"Just[Just\"$BOB_SIGNATURE\",Just\"$ALICE_SIGNATURE\"]"`
  We'll show a full example of multiple signers next.
- We have to specify our entrypoint as `'mainParameter'`

```shell
$ tezos-client --wait none transfer 0 from $BOB_ADDRESS to $MULTISIG_NAT_ADDRESS \
  --arg "$(stack exec -- lorentz-contract-multisig \
  GenericMultisig run-multisig --target-parameterType 'nat' \
  --target-parameter '42' --target-contract "\"$MULTISIG_ADMIN42_ADDRESS\"" \
  --multisig-contract "$MULTISIG_NAT_ADDRESS" --counter 0 \
  --signatures "Just[Nothing,Just\"$OPERATION_SIGNATURE\"]" \
  --signerKeys "[\"$(get_public_key bob)\",\"$(get_public_key alice)\"]" \
  --chainId $CHAIN_ID)" --burn-cap 0.000001

Waiting for the node to be bootstrapped before injection...
Current head: BMUPZBFduaBY (timestamp: 2020-07-09T16:37:12-00:00, validation: 2020-07-09T16:37:28-00:00)
Node is bootstrapped, ready for injecting operations.
Estimated gas: 46362 units (will add 100 for safety)
Estimated storage: no bytes added
Operation successfully injected in the node.
Operation hash is 'ooqtqmu4MyKzS5Hw7TzBjvcS9B7KMVwQ8x846tPrLsqoXwq3BJM'
NOT waiting for the operation to be included.
Use command
  tezos-client wait for ooqtqmu4MyKzS5Hw7TzBjvcS9B7KMVwQ8x846tPrLsqoXwq3BJM to be included --confirmations 30 --branch BMUPZBFduaBYE2SfjHkUK8NqfX3UVrKwCR3Q6ffMMmC3puVM5Fy
and/or an external block explorer to make sure that it has been included.
This sequence of operations was run:
  Manager signed operations:
    From: tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm
    Fee to the baker: ꜩ0.005069
    Expected counter: 623988
    Gas limit: 46462
    Storage limit: 0 bytes
    Balance updates:
      tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm ............. -ꜩ0.005069
      fees(tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU,269) ... +ꜩ0.005069
    Transaction:
      Amount: ꜩ0
      From: tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm
      To: KT1NUp9a8gC5xQJDi4E9hr2WRZpUxx8BQrT3
      Parameter: (Pair (Pair 0 (Left (Pair 42 "KT1U2qHuZrKm7EwwRZ9j6XpZyd9y6VDhpQVo")))
                       { None ;
                         Some "edsigtczKcLhrkFsRKhp9cUPdbv19z9g9ZUmKkHXLA42UJMJDJ2nQypNK2iwzbrGM2HHDQR5cGYSpyVPctSkM8jAC1zHGEKyVGc" })
      This transaction was successfully applied
      Updated storage:
        (Pair 1
              (Pair 1
                    { 0x00622ace8f1d06165b951d0362624033e6f6eb5650c45290ff0ddbff6055d2caa1 ;
                      0x00cc80ab168b04973d9e1f9d4d2248b077a9250d3bce750b2735b4818a7b9bb7d3 }))
      Storage size: 883 bytes
      Consumed gas: 32580
    Internal operations:
      Transaction:
        Amount: ꜩ0
        From: KT1NUp9a8gC5xQJDi4E9hr2WRZpUxx8BQrT3
        To: KT1U2qHuZrKm7EwwRZ9j6XpZyd9y6VDhpQVo
        Parameter: 42
        This transaction was successfully applied
        Updated storage: 0x0198716bd8c37c014c606841e5f7398ed70d99a6a900
        Storage size: 149 bytes
        Consumed gas: 13782
```

### Signing a Transaction with Two Signers

Now that we've seen what it looks like to sign a transaction as Alice, let's see
what it looks like when we have both signers.

The steps are very similar to signing with one signer, but repeated for every
signer.

First, we generate new bytes. We can't use the bytes generated in the last step,
because the counter has now increased, since we've already sent a transaction to
the `MultisigNat` contract.

```shell
$ stack exec -- lorentz-contract-multisig GenericMultisig run-multisig \
  --target-parameterType 'nat' --target-parameter '42' \
  --target-contract "\"$MULTISIG_ADMIN42_ADDRESS\"" \
  --multisig-contract "$MULTISIG_NAT_ADDRESS" --counter 1 --signatures "Nothing" \
  --signerKeys "[\"$(get_public_key bob)\",\"$(get_public_key alice)\"]" --chainId $CHAIN_ID

"0x05070707070a000000049caecab90a000000160198716bd8c37c014c606841e5f7398ed70d99a6a9000707000105050707002a0a0000001601d55850d12efa417a6d53f8290f027c2650390aef00"
```

Now Alice will sign these new bytes, and we'll save the signature as `ALICE_SIGNATURE`

```shell
$ tezos-client sign bytes \
  "0x05070707070a000000049caecab90a000000160198716bd8c37c014c606841e5f7398ed70d99a6a9000707000105050707002a0a0000001601d55850d12efa417a6d53f8290f027c2650390aef00" \
  for alice

Signature: edsigu2ay8M6gXj2LqBmc3fJ7tMDuNP8ExiCBMFjBsi3sPSFWR8SWERNaymMqAivm9aWVAWLwiqu4qYMtBKp7B7oujM8DLxC5BM

$ ALICE_SIGNATURE="edsigu2ay8M6gXj2LqBmc3fJ7tMDuNP8ExiCBMFjBsi3sPSFWR8SWERNaymMqAivm9aWVAWLwiqu4qYMtBKp7B7oujM8DLxC5BM"
```

And Bob will do the same. We'll save his signature as `BOB_SIGNATURE`

```shell
$ tezos-client sign bytes \
  "0x05070707070a000000049caecab90a000000160198716bd8c37c014c606841e5f7398ed70d99a6a9000707000105050707002a0a0000001601d55850d12efa417a6d53f8290f027c2650390aef00" \
  for bob

Signature: edsigtvraShNmfMppX65BDsJuaWjasWPie9qfNyTBHwGD2kyZMe7atTvm5CULseNSD4uKY2bzzGvQDq7Jks8yFp4DRdb9t5FKX4

$ BOB_SIGNATURE="edsigtvraShNmfMppX65BDsJuaWjasWPie9qfNyTBHwGD2kyZMe7atTvm5CULseNSD4uKY2bzzGvQDq7Jks8yFp4DRdb9t5FKX4"
```

```shell
$ tezos-client --wait none transfer 0 from $BOB_ADDRESS to $MULTISIG_NAT_ADDRESS \
  --arg "$(stack exec -- lorentz-contract-multisig \
  GenericMultisig run-multisig --target-parameterType 'nat' \
  --target-parameter '42' --target-contract "\"$MULTISIG_ADMIN42_ADDRESS\"" \
  --multisig-contract "$MULTISIG_NAT_ADDRESS" --counter 1 \
  --signatures "Just[Just\"$BOB_SIGNATURE\",Just\"$ALICE_SIGNATURE\"]" \
  --signerKeys "[\"$(get_public_key bob)\",\"$(get_public_key alice)\"]" --chainId $CHAIN_ID)" \
  --burn-cap 0.000001

Waiting for the node to be bootstrapped before injection...
Current head: BLkZFogRt69q (timestamp: 2020-07-09T16:39:12-00:00, validation: 2020-07-09T16:39:32-00:00)
Node is bootstrapped, ready for injecting operations.
Estimated gas: 47004 units (will add 100 for safety)
Estimated storage: no bytes added
Operation successfully injected in the node.
Operation hash is 'op3zyuj5wFPxyyrLAicv99DBWxHdAWU9obAwmGPEULj5gy3bEUq'
NOT waiting for the operation to be included.
Use command
  tezos-client wait for op3zyuj5wFPxyyrLAicv99DBWxHdAWU9obAwmGPEULj5gy3bEUq to be included --confirmations 30 --branch BLkZFogRt69qpkNRupifySnJfiPZTpoPTRn2SfgEDwsaK4xQCoX
and/or an external block explorer to make sure that it has been included.
This sequence of operations was run:
  Manager signed operations:
    From: tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm
    Fee to the baker: ꜩ0.005237
    Expected counter: 623989
    Gas limit: 47104
    Storage limit: 0 bytes
    Balance updates:
      tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm ............. -ꜩ0.005237
      fees(tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU,269) ... +ꜩ0.005237
    Transaction:
      Amount: ꜩ0
      From: tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm
      To: KT1NUp9a8gC5xQJDi4E9hr2WRZpUxx8BQrT3
      Parameter: (Pair (Pair 1 (Left (Pair 42 "KT1U2qHuZrKm7EwwRZ9j6XpZyd9y6VDhpQVo")))
                       { Some "edsigtvraShNmfMppX65BDsJuaWjasWPie9qfNyTBHwGD2kyZMe7atTvm5CULseNSD4uKY2bzzGvQDq7Jks8yFp4DRdb9t5FKX4" ;
                         Some "edsigu2ay8M6gXj2LqBmc3fJ7tMDuNP8ExiCBMFjBsi3sPSFWR8SWERNaymMqAivm9aWVAWLwiqu4qYMtBKp7B7oujM8DLxC5BM" })
      This transaction was successfully applied
      Updated storage:
        (Pair 2
              (Pair 1
                    { 0x00622ace8f1d06165b951d0362624033e6f6eb5650c45290ff0ddbff6055d2caa1 ;
                      0x00cc80ab168b04973d9e1f9d4d2248b077a9250d3bce750b2735b4818a7b9bb7d3 }))
      Storage size: 883 bytes
      Consumed gas: 33222
    Internal operations:
      Transaction:
        Amount: ꜩ0
        From: KT1NUp9a8gC5xQJDi4E9hr2WRZpUxx8BQrT3
        To: KT1U2qHuZrKm7EwwRZ9j6XpZyd9y6VDhpQVo
        Parameter: 42
        This transaction was successfully applied
        Updated storage: 0x0198716bd8c37c014c606841e5f7398ed70d99a6a900
        Storage size: 149 bytes
        Consumed gas: 13782
```

We have successfully signed with multiple administrators!

### Signing a Transaction with an Unauthorized Signer

If someone who is not an administrator were to try to sign, we would get a
transfer simulation error. Let's try to use this multisig contract to sign as
Fred.

```
$ stack exec -- lorentz-contract-multisig GenericMultisig run-multisig \
  --target-parameterType 'nat' --target-parameter '42' \
  --target-contract "\"$MULTISIG_ADMIN42_ADDRESS\"" \
  --multisig-contract "$MULTISIG_NAT_ADDRESS" --counter 4 --signatures "Nothing" \
  --signerKeys "[\"$(get_public_key bob)\",\"$(get_public_key fred)\"]" --chainId $CHAIN_ID

"0x05070707070a000000049caecab90a0000001601e434087b4651ce2e3132592129765f42427bde9d000707000405050707002a0a000000160122d24b94f44833a82467937ddf66a5a8960a28b200"

$ tezos-client sign bytes \
  "0x05070707070a000000049caecab90a0000001601e434087b4651ce2e3132592129765f42427bde9d000707000405050707002a0a000000160122d24b94f44833a82467937ddf66a5a8960a28b200" \
  for fred

Signature: edsigu3vWQjfgAH63MbXDx2Tv6j1DQ4x73Zebhvfcqg3Vw9rzaG1j6LUFPPVr9dFVySS9BPwYf5323ECRETLBcgFWyqazDcJN6z

$ FRED_SIGNATURE="edsigu3vWQjfgAH63MbXDx2Tv6j1DQ4x73Zebhvfcqg3Vw9rzaG1j6LUFPPVr9dFVySS9BPwYf5323ECRETLBcgFWyqazDcJN6z"

$ tezos-client --wait none transfer 0 from $BOB_ADDRESS to $MULTISIG_NAT_ADDRESS \
  --arg "$(stack exec -- lorentz-contract-multisig \
  GenericMultisig run-multisig --target-parameterType 'nat' \
  --target-parameter '42' --target-contract "\"$MULTISIG_ADMIN42_ADDRESS\"" \
  --multisig-contract "$MULTISIG_NAT_ADDRESS" --counter 4 \
  --signatures "Just[Just\"$BOB_SIGNATURE\",Just\"$FRED_SIGNATURE\"]" \
  --signerKeys "[\"$(get_public_key bob)\",\"$(get_public_key fred)\"]" --chainId $CHAIN_ID)" \
  --burn-cap 0.000001

CallStack (from HasCallStack):
  error, called at src/Lorentz/Contracts/GenericMultisig/CmdLnArgs.hs:397:25 in lorentz-contract-multisig-0.1.0.1-7nDq5hWdrcbHFov64Ydo4r:Lorentz.Contracts.GenericMultisig.CmdLnArgs

empty expression
Fatal error:
  transfer simulation failed
```

Note that the transfer failed with "invalid signature(s) provided." The contract
expects Alice's public key to be in `signerKeys` at index 1, and her signature
(or `Nothing`) to be provided in the `signatures` list at index 1. However, in
our attempt to take control of the contract as Fred, we've replaced her public
key and signature with his. However the contract sees this and fails the call.

