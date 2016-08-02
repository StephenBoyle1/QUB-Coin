# Setting-up a geth node for ethereum using docker

**Geth** is the Ethereum node client written in the [GO language](https://golang.org/).

More details on geth available [here](https://github.com/ethereum/go-ethereum/wiki/geth)


## Pre-requesites
**Install docker on your own development machine/laptop.**
Docker is now recently available "natively" on both Mac OSX and Windows as beta, so please follow the instructions for the install from [here](https://www.docker.com/products/overview)

## Run the GETH node
From the root folder of your QUB-Coin repo, you can start the node that way:
```
docker-compose up -d geth
```

You can then tail the logs that way:
```
docker-compose logs -f
```

### IMPORTANT NOTES Regarding DOCKER
A docker container can be stopped that way from the folder where the docker-compose.yml file resides that way (which will maintain the actual data already generated so far: PRESERVE your history):
```
docker-compose stop
```

You can also completely destroy the containers, which will remove all data associated with it, and effectively start from a clean slate (which may be useful, but be aware of the implications):
```
docker-compose down
```

### Implications for GETH

GETH requires to generate **"the DAG"**, which is a set of fixed resources required for the mining/Proof of work cryptographic verifications, and which takes a few minutes to generate INITIALLY.
Since the GETH node only mines when there is a transaction detected (**"MINE_WHEN_NEEDED"** flag set to true), the first transaction will take a few minutes to return. 
**It also means that you should use `docker-compose stop` rather than `docker-compose down` if you want to avoid re-generating the DAG and waste time.**


## Compiling and deploying the solidity contract(s) to your geth node

### Building the docker image used to deploy solidity contract(s) - ONE TIME ONLY

This `contracts/` directory contains a Dockerfile and set of scripts to make deploying the contract to a Geth node easy.

The docker image that needs to be built prior to actually running the deployment can be done locally by running the following from the `contracts` folder (so don't forget to run `cd contracts` from the root folder:
```bash
docker build -t qubcoin/deploy-contract .
```


### Deploying the contract to a GETH node - After Each contract edit
**From the root folder of your QUB-Coin repo** and assuming that you already started your GETH container as explained above, you can deploy the solidity contract that way:
```
docker-compose up contract
```
