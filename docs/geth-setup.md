# Setting-up a geth node for ethereum using docker

**Geth** is the Ethereum node client written in the [GO language](https://golang.org/).

More details on geth available [here](https://github.com/ethereum/go-ethereum/wiki/geth)

## Setup explained

### Pre-requesites
**Install docker on your own development machine/laptop.**
Docker is now recently available "natively" on both Mac OSX and Windows as beta, so please follow the instructions for the install from [here](https://www.docker.com/products/overview)

### Clone docker-geth-dev github repo
This repo has been created by Adrian who works with us here at PwC and provides a docker image that runs GETH in a private development network, which will make our life easier.

Make sure to run the following from a different folder from your QUB-coin folder...so I would suggest something like that for instance (replace dev with what you want..."projects" or "stuff"), but for now, I am assuming this folder structure:
```
$HOME/dev/QUB-Coin
```

Navigate to the parent folder of QUB-Coin, which should bring you to:
```
$HOME/dev
```
Then, clone the repo from that "dev" folder:
```
git clone https://github.com/ahannigan/docker-geth-dev.git
```

Which should then mean that you have the following folders:
```
$HOME/dev/QUB-Coin
$HOME/dev/docker-geth-dev
```

From that folder (cd docker-geth-dev), you can read the doc but in a nutshell you can start the node that way:
```
docker-compose up -d
```

You can then tail the logs that way:
```
docker-compose logs -f
```
