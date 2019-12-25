<p align="center">
  <img src="./images/Logo_step_wallet.png" width="1280">
</p>

# STEP WALLET

### ganacheの立ち上げ(~/)
```
npm i -g ganache-cli
ganache-cli -i 5777 -m "test dignity cupboard vault crazy jar sand write trap humor glimpse feel" -h 0.0.0.0 -p 8545 --gasLimit=60000000 --db ./backend/contract/ganache-cli
```

### serverの立ち上げ(~/server)
```
npm i
node index
```

### appの立ち上げ(~/app)
```
npm i
npm start
```