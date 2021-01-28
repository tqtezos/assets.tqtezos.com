---
id: ticket-auction
title: Building a Dutch Auction with Ticket based NFTs in Ligo
sidebar_label: Ticket NFT Auction in Ligo
---

## Introduction
Tickets are a feature added to Tezos in the Edo protocol proposal that allow
a smart contract to authenticate data with respect to a Tezos address.
They provide a convenient mechanism  to grant portable permissions or issue
tokens without requiring the token holder or permission grantee to interact
with a centralized contract.

Tickets' decentralized nature make them perfectly suited for representing
assets for which users are in full control of their tokens. In this tutorial,
we will create a Dutch/descending-price auction of ticket-based NFTs
implemented in Ligo, along with ticket wallets for auction participants.
## Set-up
- Follow instructions in [Client Setup](/docs/setup/1-tezos-client) to set up
  `tezos-client.` Also, make sure to point to a public Edo test network node
  such as `https://edonet-tezos.giganode.io` or to an Edo [sandbox](/docs/setup/2-sandbox#try-the-edo-protocol)
  and make sure to have at least 2 test accounts for Alice and Bob with funds.
- Follow instructions on [Ligo](https://ligolang.org/docs/intro/installation) to install
  the most recent Ligo version.
- Clone tutorial repo
```shell
$ git clone https://github.com/tqtezos/ticket-tutorials.git
$ cd ./ticket-tutorials/tutorials/auction/ligo
```
- Compile Ligo code
```shell
$ ligo compile-contract --protocol edo --disable-michelson-typechecking nft_wallet.mligo main > ./michelson/nft_wallet.tz
$ ligo compile-contract --protocol edo --disable-michelson-typechecking nft_auction.mligo main > ./michelson/nft_auction.tz
```
## NFT Wallet Contract
The first contract used in this demo is an NFT wallet that will create,
destroy, send, and receive NFTs. For this demo, it will also be used
to configure NFT Auctions that will be performed in our NFT Auction contract.

Every NFT created with the wallet also includes some token metadata,
following the standard specified for FA2 in [TZIP-12](https://gitlab.com/tzip/tzip/-/blob/master/proposals/tzip-12/tzip-12.md#token-metadata-values)
in which token metadata is stored as a Michelson value
of type `(map string bytes)`.

### Originations

#### Alice

Alice originates her `nft-wallet` contract and initializes several storage parameters.

```sh
Pair
  $ALICE_ADDRESS      -- Alice sets herself as the admin
  (Pair
    {}                -- Empty tickets big_map as the wallet has no NFTs yet
    (Pair
      0               -- Current token id current_id set to 0 as no NFTs have been minted yet
      {}              -- Empty token_metadata big_map as no NFTs have been minted yet
    )
  )
```

To originate the contract, run:

```sh
$ tezos-client originate contract nft-wallet transferring 0 from alice \
       running "$(pwd)/michelson/nft_wallet.tz" \
        --init "Pair $ALICE_ADDRESS (Pair {} (Pair 0 {}))" \
        --burn-cap 0.305

        Script:
                { parameter
                    (or (or (or (pair %auction
                                   (contract %destination
                                      (pair (nat %opening_price)
                                            (pair (nat %set_reserve_price)
                                                  (pair (timestamp %set_start_time) (pair (int %set_round_time) (ticket %ticket nat))))))
                                   (pair (nat %opening_price)
                                         (pair (nat %reserve_price)
                                               (pair (timestamp %start_time) (pair (int %round_time) (nat %ticket_id))))))
                                (nat %burn))
                            (or (map %mint string bytes) (ticket %receive nat)))
                        (pair %send (contract %destination (ticket nat)) (nat %ticket_id))) ;
                  storage
                    (pair (address %admin)
                          (pair (big_map %tickets nat (ticket nat))
                                (pair (nat %current_id) (big_map %token_metadata nat (pair nat (map string bytes)))))) ;
                  code {...}

New contract KT1EAMUQC1yJ2sRPNPpLHVMGCzroYGe1C1ea originated.

```

Note we only include relevant terminal output.


#### Bob

Bob originates his NFT wallet and sets himself as the admin

```sh
$ tezos-client originate contract nft-wallet-bob transferring 0 from bob \
        running "$(pwd)/michelson/nft_wallet.tz" \
         --init "Pair $BOB_ADDRESS (Pair {} (Pair 0 {}))" \
         --burn-cap 1

New contract KT1QQukCBULzFu6samB5FpbLNBXmNzArSpTs originated.

```
Make a variable for the new contract address:

```shell
$ ALICE_WALLET_ADDRESS=KT1EAMUQC1yJ2sRPNPpLHVMGCzroYGe1C1ea
$ BOB_WALLET_ADDRESS=KT1QQukCBULzFu6samB5FpbLNBXmNzArSpTs
```

Alice and Bob's wallet contracts can be viewed on TzStat's edonet explorer
at https://edo.tzstats.com/KT1EAMUQC1yJ2sRPNPpLHVMGCzroYGe1C1ea and
https://edo.tzstats.com/KT1QQukCBULzFu6samB5FpbLNBXmNzArSpTs respectively.

## NFT Auction Contract

A separate NFT auction contract can be used to auction off ones NFTs
to prospective buyers. We use a [Dutch](https://en.wikipedia.org/wiki/Dutch_auction),
descending price auction in which the asking price of the NFT is decreased
until a buyer is found. The NFT auction contract has an entrypoint to
`configure` the auction, `start` the auction, `drop_price` of the NFT
after a round has passed, `buy` the NFT by sending the asking price,
and an entrypoint for the admin to `cancel` the auction
and send the NFT back to their wallet.  


### Auction

Alice originates nft-auction contract and initializes several storage parameters.

```sh
"Pair
  (Pair
    $ALICE_ADDRESS      -- Alice set as admin
    (Pair
      0                 -- current_price set to 0 mutez as default
      (Pair
        0               -- reserve_price set to 0 mutez
        (Pair
          False         -- in_progress set to False as no auction in progress
          (Pair
            0           -- start_time set to 0 Unix time as default
            0           -- round_time set to 0 seconds as default
          )
        )
      )
    )
  )
  {}                   -- tickets set to empty big_map"
```

Originate the auction contract by running:

```sh
$ tezos-client originate contract nft-auction transferring 0 from alice \
    running "$(pwd)/michelson/nft_auction.tz" \
    --init "Pair (Pair $ALICE_ADDRESS (Pair 0 (Pair 0 (Pair False ( Pair 0 0))))) {}"\
    --burn-cap 1

    Script:
            { parameter
                (or (or (or (contract %buy (ticket nat)) (contract %cancel (ticket nat)))
                        (or (pair %configure
                               (nat %opening_price)
                               (pair (nat %set_reserve_price)
                                     (pair (timestamp %set_start_time) (pair (int %set_round_time) (ticket %ticket nat)))))
                            (nat %drop_price)))
                    (unit %start)) ;
              storage
                (pair (pair %data
                         (address %admin)
                         (pair (nat %current_price)
                               (pair (nat %reserve_price)
                                     (pair (bool %in_progress) (pair (timestamp %start_time) (int %round_time))))))
                      (big_map %tickets nat (ticket nat))) ;
              code {...}

New contract KT1HWaMyNmjVGMBPUSm3QxJnFRLi4LQJi1tG originated.
```

Save auction contract address in an environment variable.

```sh
AUCTION_ADDRESS=KT1HWaMyNmjVGMBPUSm3QxJnFRLi4LQJi1tG
```
The auction contract can be viewed on [TzStats](https://edo.tzstats.com/KT1HWaMyNmjVGMBPUSm3QxJnFRLi4LQJi1tG).  

## Demo
Now that the wallet and auction contracts are originated Alice can create
an NFT and auction it off. In the auction, no one will purchase the item
at Alice's `opening_price` of 100tz so she drops the price to 90tz
and Bob purchases the item.

### Mint NFT

First, Alice mints herself a ticket based NFT with metadata

Following [TZIP-12 Token Metadata](https://gitlab.com/tzip/tzip/-/blob/master/proposals/tzip-12/tzip-12.md#token-metadata)
we initialize the map of type `(map string bytes)` that contains the NFT `name`,
and a value called `decimals` which defines the position of the decimal point
in token balances. Setting `decimals` to 0 [denotes](https://gitlab.com/tzip/tzip/-/blob/master/proposals/tzip-12/Legacy-FA2.md#token-metadata)
that the token is an NFT. We also store in the token metadata
an IPFS hash (CID) which points to a picture of a dutch auction on [IPFS](https://ipfs.io/).
Note, we could have also pointed to external data using
http/https, data in other tezos contracts, etc.
You can see more details about how to store the picture with IPFS on the
[NFT FA2 tutorial](https://assets.tqtezos.com/docs/token-contracts/fa2/2-fa2-nft-tutorial/#tokens-with-external-metadata).
The picture that the NFT's metadata points to is visible at https://ipfs.io/ipfs/Qmb1s5K234gpBcmFFDnZBcufJpAWb8AtAhjf1fUH4z5f72.

Define the TOKEN_METADATA we will use to mint the NFT as follows:
```sh
# Define a function to encode the metadata values and format them
$ tobytes() { echo "0x$(echo -n $1 | od -A n -t x1 | tr -d ' \n')";}
$ TOKEN_METADATA="{\
Elt \"decimals\" $(tobytes 0); \
Elt \"ipfs_cid\" $(tobytes Qmb1s5K234gpBcmFFDnZBcufJpAWb8AtAhjf1fUH4z5f72); \
Elt \"name\" $(tobytes 'Demo') \
}"

```
Mint the NFT by running:

```sh
$ tezos-client transfer 0 from alice to nft-wallet \
          --entrypoint "mint" \
          --arg "$TOKEN_METADATA" \
          --burn-cap 1

   Updated storage:
           { 0x00000d4f0cf2fae2437f924120ef030f53abd4d4e520 ; 140 ; 2 ; 141 }
         Updated big_maps:
           Set map(141)[1] to (Pair 1
                 { Elt "decimals" 0x30 ;
                   Elt "ipfs_cid"
                       0x516d623173354b323334677042636d4646446e5a426375664a7041576238417441686a6631665548347a35663732;
                   Elt "name" 0x44656d6f })
           Set map(140)[1] to (Pair 0x013d32a903fa4cf753f0d7075a7ab8395c501a2caf00 (Pair 1 1))
```

### Configure auction

Alice auctions off her ticket based NFT through her wallet,
which sends her NFT to her auction contract and configures various auction
settings. The starting price of the auction is 100 mutez.

```sh
Pair
  $AUCTION_ADDRESS%configure
  (Pair
    100             -- operning_price set to 100 mutez
    (Pair  
      10            -- reserve_price set to 10 mutez
      (Pair
        0           -- start_time set to 0 Unix time
        (Pair
          600       -- round_time set to 600 seconds (10 minutes)
          1         -- ticket is chosen to be the ticket we just minted with ticket_id 1
        )
      )
    )
  )
```
Configure the auction by running:

```sh
$ tezos-client transfer 0 from alice to nft-wallet \
        --entrypoint "auction" \
        --arg "Pair \"$AUCTION_ADDRESS%configure\" (Pair 100 (Pair 10 (Pair 0 (Pair 600 1))))" \
        --burn-cap 1

   Transaction:
   Updated storage:
      { 0x00000d4f0cf2fae2437f924120ef030f53abd4d4e520 ; 140 ; 2 ; 141 }
    Updated big_maps:
      Unset map(140)[1]
      Internal operations:
         Transaction:
           Amount: ꜩ0
           From: KT1EAMUQC1yJ2sRPNPpLHVMGCzroYGe1C1ea
           To: KT1HWaMyNmjVGMBPUSm3QxJnFRLi4LQJi1tG
           Entrypoint: configure
           Parameter: { 100 ;
                        10 ;
                        0 ;
                        600 ;
                        Pair 0x013d32a903fa4cf753f0d7075a7ab8395c501a2caf00 (Pair 1 1) }
           This transaction was successfully applied
           Updated storage:
             (Pair { 0x00000d4f0cf2fae2437f924120ef030f53abd4d4e520 ;
                     100 ;
                     10 ;
                     False ;
                     0 ;
                     600 }
                   139)
           Updated big_maps:
             Set map(139)[0] to (Pair 0x013d32a903fa4cf753f0d7075a7ab8395c501a2caf00 (Pair 1 1))
```

### Start auction

Alice starts her nft-auction by calling the nft-auction contract directly

```sh
$ tezos-client transfer 0 from alice to nft-auction \
        --entrypoint "start" \
        --burn-cap 1

        Transaction:
              Amount: ꜩ0
              From: tz1LrQB9HrJcUaD9NKEvV65tnaiU8trPXwmt
              To: KT1HWaMyNmjVGMBPUSm3QxJnFRLi4LQJi1tG
              Entrypoint: start
              This transaction was successfully applied
              Updated storage:
                (Pair { 0x00000d4f0cf2fae2437f924120ef030f53abd4d4e520 ;
                        100 ;
                        10 ;
                        True ;
                        1611780640 ;
                        600 }
                      139)
              Updated big_maps:
                Set map(139)[0] to (Pair 0x013d32a903fa4cf753f0d7075a7ab8395c501a2caf00 (Pair 1 1))
```

### Drop ask price

After the time of one round has passed without anyone buying the nft,
Alice drops the price of her NFT to 90 mutez.

```sh
$ tezos-client transfer 0 from alice to nft-auction \
        --entrypoint "drop_price" \
        --arg 90 --burn-cap 1

        Transaction:
              Amount: ꜩ0
              From: tz1LrQB9HrJcUaD9NKEvV65tnaiU8trPXwmt
              To: KT1HWaMyNmjVGMBPUSm3QxJnFRLi4LQJi1tG
              Entrypoint: drop_price
              Parameter: 90
              This transaction was successfully applied
              Updated storage:
                (Pair { 0x00000d4f0cf2fae2437f924120ef030f53abd4d4e520 ;
                        90 ;
                        10 ;
                        True ;
                        1611781430 ;
                        600 }
                      139)
```

### Purchase NFT

Bob buys the NFT by sending 90 mutez to the auction contract,
calling the buy entrypoint, and sending the address of his wallet contract.
The NFT is sent to Bob’s wallet and Alice is sent the 90 mutez.

```sh
$ tezos-client transfer 0.00009 from bob to nft-auction \
        --entrypoint "buy" \
        --arg "\"$BOB_WALLET_ADDRESS%receive\"" \
        --burn-cap 1

        Transaction:
          Amount: ꜩ0.00009
          From: tz1bwfmSYqrhUTAoybGdhWBBefsbuhNdcC2Y
          To: KT1HWaMyNmjVGMBPUSm3QxJnFRLi4LQJi1tG
          Entrypoint: buy
          Parameter: "KT1QQukCBULzFu6samB5FpbLNBXmNzArSpTs%receive"
          This transaction was successfully applied
          Updated storage:
            (Pair { 0x00000d4f0cf2fae2437f924120ef030f53abd4d4e520 ;
                    90 ;
                    10 ;
                    False ;
                    1611781430 ;
                    600 }
                  139)
          Updated big_maps:
            Unset map(139)[0]

          Balance updates:
            tz1bwfmSYqrhUTAoybGdhWBBefsbuhNdcC2Y ... -ꜩ0.00009
            KT1HWaMyNmjVGMBPUSm3QxJnFRLi4LQJi1tG ... +ꜩ0.00009
            Internal operations:
          Transaction:
            Amount: ꜩ0.00009
            From: KT1HWaMyNmjVGMBPUSm3QxJnFRLi4LQJi1tG
            To: tz1LrQB9HrJcUaD9NKEvV65tnaiU8trPXwmt
            Balance updates:
              KT1HWaMyNmjVGMBPUSm3QxJnFRLi4LQJi1tG ... -ꜩ0.00009
              tz1LrQB9HrJcUaD9NKEvV65tnaiU8trPXwmt ... +ꜩ0.00009

        Internal operations:
          Transaction:
            Amount: ꜩ0
            From: KT1HWaMyNmjVGMBPUSm3QxJnFRLi4LQJi1tG
            To: KT1QQukCBULzFu6samB5FpbLNBXmNzArSpTs
            Entrypoint: receive
            Parameter: (Pair 0x013d32a903fa4cf753f0d7075a7ab8395c501a2caf00 (Pair 1 1))

            Updated storage:
              { 0x0000b2d8083a660b2a77efe28a71bf09a933cd85613b ; 142 ; 2 ; 143 }
            Updated big_maps:
              Set map(142)[1] to (Pair 0x013d32a903fa4cf753f0d7075a7ab8395c501a2caf00 (Pair 1 1))

```

Now, it will be possible to see the purchased NFT at key 1
in Bob's `tickets` big_map, which can be viewed at Bigmap 142 in
[Bob's wallet](https://edo.tzstats.com/KT1QQukCBULzFu6samB5FpbLNBXmNzArSpTs)
on edonet. The metadata for the NFT is visible in key 1 in
[Alice's wallet](https://edo.tzstats.com/KT1EAMUQC1yJ2sRPNPpLHVMGCzroYGe1C1ea)
in the `token_metadata` big_map (Bigmap 141).

We can also use the CLI to inspect the big maps.
Since both values will be found at key 1 in their respective big maps
we can run the following command to get the hashed common key
that we use to inspect the two big maps.  

```sh
$ tezos-client hash data 1 of type nat

Raw packed data: 0x050001
Script-expression-ID-Hash: expru2dKqDfZG8hu4wNGkiyunvq2hdSKuVYtcKta7BWP6Q18oNxKjS
Raw Script-expression-ID-Hash: 0x438c52065d4605460b12d1b9446876a1c922b416103a20d44e994a9fd2b8ed07
Ledger Blake2b hash: 5YgR7rjfSbSbzGEYhhBG9ENRHhdVSUu2TJ6RyNLawjiv
Raw Sha256 hash: 0x57072915640d052f4e2843e1498b10c4f71b62df565525d33c4a66a724e3e20a
Raw Sha512 hash: 0x112e6b61a60ecf001d501f39284ff8a575d818f2f79295b90b24f045d165a490c19cac2add9149dbdd23a8f2cf956dbee0efe17449111e6326e97ab21532f445
Gas remaining: 1039991.350 units remaining
```

We copy the value given at `Script-expression-ID-Hash` and can use it as follows.

First we look at the ticket-NFT in Bob's wallet:
```sh
$ tezos-client get element expru2dKqDfZG8hu4wNGkiyunvq2hdSKuVYtcKta7BWP6Q18oNxKjS of big map 142

Pair "KT1EAMUQC1yJ2sRPNPpLHVMGCzroYGe1C1ea" 1 1
```

Next, we look at the NFT metadata in Alice's wallet:  
```sh
$ tezos-client get element expru2dKqDfZG8hu4wNGkiyunvq2hdSKuVYtcKta7BWP6Q18oNxKjS of big map 141
Warning:

Pair 1
     { Elt "decimals" 0x30 ;
       Elt "ipfs_cid"
           0x516d623173354b323334677042636d4646446e5a426375664a7041576238417441686a6631665548347a35663732 ;
       Elt "name" 0x44656d6f }
```

Finally, we can inspect the encoded values in the metadata as follows:

```sh
# Define a function to convert the bytes back to
$ ofbytes () { echo -n $1 | while read -n2 byte; do case "$byte" in 0x ) ;; * )  printf "\x$byte" ;; esac ; done ; echo ; }
# Get the "decimals" value
$ ofbytes 0x30
  0
# Get the "ipfs_cid" value
$ ofbytes 0x516d623173354b323334677042636d4646446e5a426375664a7041576238417441686a6631665548347a35663732
  Qmb1s5K234gpBcmFFDnZBcufJpAWb8AtAhjf1fUH4z5f72
# Get the "name" value
$ ofbytes 0x44656d6f
  Demo
```
