# QUB-Coin

This is the repository for the Queens University project which aims to create a digital currency that can be issued to Queen’s students based on their lecture attendance. The system will allocate a points based system that can be used to tip their instructors as a means to provide positive real time feedback in an anonymous manner. As university fees are increasing, students are demanding more from their universities to provide a better learning experience. Resultantly, instructors will be able to enact change in their module and better understand students problems. This will create a more engaging learning environment and more effective feedback system than the paper pased feedback system, currently used within the university. To encourage more students to engage with they system, there will be two types of coins; general coins for sending to instructors and proof of concept personal coins that will enable students to send to their peers and buy from a vendor.

## Key objectives of this project include:

- Students will be encouraged to attend more lectures
- Supervisors will better support/understand problems students are having problems with
- More students will be encouraged to submit real time feedback instead of the slow paper based feedback system
- Supervisors will be able to respond to student concerns more quickly and effectively


## Terms
- **Instructor**: either a "lecturer" or a "demonstrator" at the Queens university who is responsible to effectively teach student during *classes*
- **Class**: either a "lecture" or a "practical", with a set of students, 1 or more instructor(s), a location and a timeline (start and end date/time)

## Scope

This project will make use of a private *Ethereum* network blockchain as its Datastore with some smart contract capabilities allowing management of digital assets.
There are a couple of digital assets to be considered as of the initial design:

- A *"general"* coin:  assigned to student when attending classes (lectures/practicals)
- A *"personal"* coin:  temporarily assigned to student that can only be transferred to either an *instructor* or a *peer* (pending approval by instructor), as a way to provide weighted feedback when support or help was provided during a class.  

## Environment/Dev setup

### Setting-up a geth node for ethereum using docker

[This page](docs/geth-setup.md) explains the steps required to get an Ethereum Node running in Docker!
It also explains the steps required to compile and deploy the solidity smart contract to the ethereum chain.


### Compiling and deploying the solidity contract(s) to your GETH node

The solidity contract that effectively plays the role of the QUB Coin application DATA layer is located in **contracts/sources/QUBCoin.sol**
In order to be able to "Use/Invoke" the smart contract from our JavaScript application, it needs to be:

- **COMPILED**: Compiled into byte code using **solc** (solidity language compiler, equivalent to "javac" for java), which is interpretable by the EVM (Ethereum Virtual Machine)
- **DEPLOYED**: That bytecode then need to be deployed to the GETH node (so that it is persisted into the blockchain)
- **LOCATED**: The deployment process should provide a unique destination address which is critical for the Javascript application to locate and invoke/interact with it
  

#### Deploying the contract to a GETH node - After Each contract edit

Assumption is that you are in a terminal **located at the root folder of your QUB-Coin GIT repo**, for any of the steps that require a terminal obviously

1. In your Editor (IntelliJ/Eclipse...): edit the contract source located at **contracts/sources/QUBCoin.sol**
2. (Optional but helpful) In Browser: Validate its syntax through the online compiler: https://chriseth.github.io/browser-solidity/#version=soljson-latest.js
3. Copy the output provided in the **"interface"** textbox and paste it within the **lib/auth.js** file to replace the value of the _**qubCoinAbi**_ variable
4. Start-up your local GETH node (If not already running): `docker-compose up -d geth`
5. Compile and deploy the contract: `docker-compose up contract`, which should provide the following final outputs (with different address) 
    ```
    contract_1  | Contract mined! address: [0xfe0487715880bfa51eb40b9eb714d00556d244ad]
    qubcoin_contract_1 exited with code 0
    ```
6. Capture/Copy the freshly deployed contract address and Paste it into the **docker-compose.yml** file to replace the _**QUB_COIN_ADDRESS**_ environment variable value within the **"app"** service 
7. Adapt the javascript to make use of the new contract functions

### Starting up the application

#### Natively 
If you want to run the app either directly from your terminal or from your editor (IntelliJ for instance), you'll need to run this:
(Obviously we always assume you are in the QUB-Coin root folder, when running from terminal): 

If you have docker natively installed (Mac, Linux, or Windows if you have a supported version):
```
GETH_HOST=localhost:8545 QUB_COIN_ADDRESS=0xfe0487715880bfa51eb40b9eb714d00556d244ad node bin/www
```

If you run docker toolbox (meaning that your docker env is within a VM usually at address 192.168.99.100):
```
GETH_HOST=192.168.99.100:8545 QUB_COIN_ADDRESS=0xfe0487715880bfa51eb40b9eb714d00556d244ad node bin/www
```

#### Using Docker

The easiest is to run the app using docker that way (again from the QUB-Coin root folder):
```
docker-compose up app
```


### Running unit tests for smart-contract validation
There is a way to use Jasmine JS, ethereumjs-testrpc (which is a simulator for Ethereum) and docker to run a set of unit tests to prove out changes of the QUBCoin.sol smart contract.
Please refer to [this file for instruction](contracts/tests/README.md)

These would ideally be run automatically as part of a CI pipeline, but time is against us to get this put in place, 
but they can still be used locally by developers to increase confidence when changing and validating the contract rather than deploy it fully in GETH and use the app to test it.