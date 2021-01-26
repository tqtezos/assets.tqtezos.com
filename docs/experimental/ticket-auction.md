---
id: ticket-auction
title: Building a Dutch Auction with Ticket based NFTs in Ligo
sidebar_label: Ticket NFT Auction in Ligo
---

## Introduction
Tickets are a feature added to Tezos in the Edo protocol upgrade that allow a smart contract to authenticate data with respect to a Tezos address. They provide a convenient mechanism  to grant portable permissions or issue tokens without requiring the token holder or permission grantee to interact with a centralized contract.

Tickets' decentralized nature make them perfectly suited for representing assets for which users are in full control of their tokens. In this tutorial, we will create a Dutch/descending-price auction of ticket-based NFTs implemented in Ligo, along with ticket wallets for auction participants.
## Set-up
- Follow instructions in [Client Setup](/docs/setup/1-tezos-client) to set up
  `tezos-client.` Also, make sure to point to a public Edo test network node such as `https://edonet-tezos.giganode.io` or to an Edo [sandbox](/docs/setup/2-sandbox#try-the-edo-protocol) and make sure to have at least 2 test accounts for Alice and Bob with funds.
- Follow instructions on [Ligo](https://ligolang.org/docs/intro/installation) to install the most recent Ligo version.
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
The first contract used in this demo is an NFT wallet that will create, destroy, send, and receive NFTs. For this demo, it will also be used to configure NFT Auctions that will be performed in our NFT Auction contract.

Every NFT created with the wallet also includes some token metadata, following the standard specified for FA2 in [TZIP-12](https://gitlab.com/tzip/tzip/-/blob/master/proposals/tzip-12/tzip-12.md#token-metadata-values) in which token metadata is stored as a Michelson value of type `(map string bytes)`.

### Originations

#### Alice

Alice originates her `nft-wallet` contract and initializes several storage parameters.

```sh
Pair
  $ALICE_ADDRESS      -- Alice sets herself as the `admin`
  (Pair
    {}                -- Empty `tickets` big_map as the wallet has no NFTs yet
    (Pair
      0               -- Current token id `current_id` set to 0 as no NFTs have been minted yet
      {}              -- Empty `token_metadata` big_map as no NFTs have been minted yet
    )
  )
```

To originate the contract, run:

```sh
$ tezos-client originate contract nft-wallet transferring 0 from alice \
       running "$(pwd)/michelson/nft_wallet.tz" \
        --init "Pair $ALICE_ADDRESS (Pair {} (Pair 0 {}))" \
        --burn-cap 0.305

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

Bob originates his nft wallet and sets himself as the admin

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

## NFT Auction Contract

A separate NFT auction contract can be used to auction off ones NFTs to prospective buyers. We use a [Dutch](https://en.wikipedia.org/wiki/Dutch_auction), descending price auction in which the asking price of the NFT is decreased until a buyer is found. The NFT auction contract has an entrypoint to `configure` the auction, `start` the auction, `drop_price` of the NFT after a round has passed, `buy` the NFT by sending the asking price, and an entrypoint for the admin to `cancel` the auction and send the NFT back to their wallet.  


### Auction

Alice originates nft-auction contract and initializes several storage parameters.

```sh
"Pair
  (Pair
    $ALICE_ADDRESS      -- Alice set as `admin`
    (Pair
      0                 -- `current_price` set to 0 as there is no NFT to be auctioned yet
      (Pair
        0               -- `reserve_price` set to 0
        (Pair
          False         -- `in_progress` set to False as there is no auction in progress
          (Pair
            0           -- `start_time` set to 0 as default
            0           -- `round_time` set to 0 as default
          )
        )
      )
    )
  )
  {}"                   -- `tickets` set to empty big_map as there are no ticket NFTs to be auctioned
```

```sh
$ tezos-client originate contract nft-auction transferring 0 from alice \
        running "$(pwd)/michelson/nft_auction.tz" \
         --init "Pair (Pair $ALICE_ADDRESS (Pair 0 (Pair 0 (Pair False ( Pair 0 0))))) {}" \
         --burn-cap 1

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

## Demo
Now that the wallet and auction contracts are originated Alice can create an NFT and auction it off. In the auction, no one will purchase the item at Alice's `opening_price` of 100tz so she drops the price to 90tz and Bob purchases the item.

### Mint NFT

Alice mints herself a ticket based nft with metadata

Following [TZIP-12 Token Metadata](https://gitlab.com/tzip/tzip/-/blob/master/proposals/tzip-12/tzip-12.md#token-metadata) we initialize the map of type `(map string bytes)`. The empty string `\"\"` key has a value of a TZIP-16 URI which points to a JSON representation of the token metadata.

First, we will save the URI as a variable, and byte encode it. **Note, the URI I use just points to [this](https://github.com/tqtezos/ticket-tutorials/tree/main/tutorials/auction/ligo) repo. To actually follow TZIP-12 standard, a production level implementation should point to an actual [TZIP-16 Metadata JSON](https://gitlab.com/tzip/tzip/-/blob/master/proposals/tzip-16/tzip-16.md#metadata-json-format).  

```sh
$ URI=https://github.com/tqtezos/ticket-tutorials/tree/main/tutorials/auction/ligo
# Encode the URI and format it
$ URI=$(echo -n $URI | od -A n -t x1 | sed 's/ *//g'| tr -d '\n')
```

```sh
$ tezos-client transfer 0 from alice to nft-wallet
          --entrypoint "mint" \
          --arg "{Elt \"\" 0x"$URI"}" \
          --burn-cap 1

   Transaction:
     Updated storage:
       { 0x00000d4f0cf2fae2437f924120ef030f53abd4d4e520 ; 140 ; 1 ; 141 }
     Updated big_maps:
       Set map(141)[0] to (Pair 0
             { Elt ""
                   0x68747470733a2f2f6769746875622e636f6d2f747174657a6f732f7469636b65742d7475746f7269616c732f747265652f6d61696e2f7475746f7269616c732f61756374696f6e2f6c69676f })
       Set map(140)[0] to (Pair 0x013d32a903fa4cf753f0d7075a7ab8395c501a2caf00 (Pair 0 1))
```

### Configure auction

Alice auctions off her ticket based nft through her wallet, which sends her nft to her auction contract and configures various auction settings. The starting price of the auction is 100 mutez.

```sh
Pair
  $AUCTION_ADDRESS%configure
  (Pair
    100             -- `operning_price` set to 100
    (Pair  
      10            -- `reserve_price` set to 10
      (Pair
        0           -- `start_time` set to 0 Unix time
        (Pair
          600       -- `round_time` set to 600 seconds (10 minutes)
          0         -- `ticket` is chosen to be the ticket we just minted with `ticket_id` 0
        )
      )
    )
  )
```
Configure the auction by running:

```sh
$ tezos-client transfer 0 from alice to nft-wallet \
        --entrypoint "auction" \
        --arg "Pair \"$AUCTION_ADDRESS%configure\" (Pair 100 (Pair 10 (Pair 0 (Pair 600 0))))" \
        --burn-cap 1

   Transaction:
     Updated storage:
       { 0x00000d4f0cf2fae2437f924120ef030f53abd4d4e520 ; 140 ; 1 ; 141 }
     Updated big_maps:
       Unset map(140)[0]
   Internal operations:
       Entrypoint: configure
       Parameter: { 100 ;
                    10 ;
                    0 ;
                    600 ;
                    Pair 0x013d32a903fa4cf753f0d7075a7ab8395c501a2caf00 (Pair 0 1) }
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
         Set map(139)[0] to (Pair 0x013d32a903fa4cf753f0d7075a7ab8395c501a2caf00 (Pair 0 1))
```

### Start auction

Alice starts her nft-auction by calling the nft-auction contract directly

```sh
$ tezos-client transfer 0 from alice to nft-auction \
        --entrypoint "start" \
        --burn-cap 1

   Transaction:
     Updated storage:
       (Pair { 0x00000d4f0cf2fae2437f924120ef030f53abd4d4e520 ;
               100 ;
               10 ;
               True ;
               1609897118 ;
               600 }
             139)
     Updated big_maps:
       Set map(139)[0] to (Pair 0x013d32a903fa4cf753f0d7075a7ab8395c501a2caf00 (Pair 0 1))

```

### Drop ask price

After the time of one round has passed without anyone buying the nft, Alice drops the price of her nft to 90 mutez.

```sh
$ tezos-client transfer 0 from alice to nft-auction \
        --entrypoint "drop_price" \
        --arg 90 --burn-cap 1

   Transaction:
     Updated storage:
       (Pair { 0x00000d4f0cf2fae2437f924120ef030f53abd4d4e520 ;
               90 ;
               10 ;
               True ;
               1609898008 ;
               600 }
             139)
```

### Purchase NFT

Bob buys the nft by sending 90 mutez to the auction contract, calling the buy entrypoint, and sending the address of his wallet contract. The nft is sent to Bob’s wallet and Alice is sent the 90 mutez.

```sh
$ tezos-client transfer 0.00009 from bob to nft-auction \
        --entrypoint "buy" \
        --arg "\"$BOB_WALLET_ADDRESS%receive\"" \
        --burn-cap 1

   Transaction:
     Updated storage:
       (Pair { 0x00000d4f0cf2fae2437f924120ef030f53abd4d4e520 ;
               90 ;
               10 ;
               False ;
               1609898008 ;
               600 }
             139)
     Updated big_maps:
       Unset map(139)[0]
   Internal operations:
     Transaction:
       Amount: ꜩ0.00009
       From: KT1HWaMyNmjVGMBPUSm3QxJnFRLi4LQJi1tG
       To: tz1LrQB9HrJcUaD9NKEvV65tnaiU8trPXwmt
       Balance updates:
         KT1HWaMyNmjVGMBPUSm3QxJnFRLi4LQJi1tG ... -ꜩ0.00009
         tz1LrQB9HrJcUaD9NKEvV65tnaiU8trPXwmt ... +ꜩ0.00009
     Transaction:
       Amount: ꜩ0
       From: KT1HWaMyNmjVGMBPUSm3QxJnFRLi4LQJi1tG
       To: KT1QQukCBULzFu6samB5FpbLNBXmNzArSpTs
       Entrypoint: receive
       Parameter: (Pair 0x013d32a903fa4cf753f0d7075a7ab8395c501a2caf00 (Pair 0 1))

       Updated storage:
         { 0x0000b2d8083a660b2a77efe28a71bf09a933cd85613b ; 142 ; 1 ; 143 }
       Updated big_maps:
         Set map(142)[0] to (Pair 0x013d32a903fa4cf753f0d7075a7ab8395c501a2caf00 (Pair 0 1))
```
