# INTRODUCTION 

There's a lot of opportunity to use blockchain technologies in Real Life. This project aims to provide a blockchain-based provenance record of transparency within supply chains.

___
# OVERVIEW 

Here We create a Supply Chain Managment System for FOOTWEAR. Already know that Blockchain is a digital ledger that records transactions or other data over time. In a much simpler way, It offers a way for people who do not know or trust each other to create a record of who owns what, that will compel the assent of everyone concerned. It is a way of making and preserving truths.
so using HYPERLEDGER FABRIC we build a system that can store each and every product details. Along with BRAND NAME , PRICE and so on. so users can easily identified product details along with Distributor Name and Seller Details. So users can easily identified that product is original/NOT or what is the Wright price and so on. 
___
# WORK FLOW :
* OK !! now We assumed that there is a BRAND for footwear that is NIKE;
* NIKE has a product and suppose this product has some faulty . So NIKE has wright to REJECT this product or APPROVE. So Product has 3 status APPROVE REJECT PENDING(When the product is Register for APPROVE before it show the status PENDING). 
* OK after PRODUCT APPROVED by NIKE. It can available to distribut among DISTRIBUTOR and then SELLER
* Distributor or Seller can Register themselves freely their is no Approve or Reject. Once feel the details for registration after it shows status as "REGISTERED".
* Once Distributor Registered then they can able to add product from NIKE.

##### ADD PRODUCT TO DISTRIBUTOR:

* During the Add Product to distributor first they Request NIKE to add their product after Approve by NIKE it can available to Distributor.
* So NIKE has full wrights to REJECT ADD PRODUCT TO DISTRIBUTOR.
* after Approve from NIKE after that product will be available for SELLER.

##### ADD PRODUCT TO SELLER:

* OK !! after approve from NIKE product is now available for SELLER.
* Now SELLER  can add this product by sending a request to DISTRIBUTOR. 
* So as NIKE, DISTRIBUTOR has wrights to REJECT TO ADD PRODUCT FOR SELLER. If it is approve then it will available in SELLER product list.
___
# DEVELOPMENT ENVIRONMENT 
##### NOTE:
WE made this Product only for HYPERLEDGER-COMPOSER

### Installation of pre-reqs
```sh
curl -O https://hyperledger.github.io/composer/latest/prereqs-ubuntu.sh
chmod u+x prereqs-ubuntu.sh
./prereqs-ubuntu.sh
```
**It installs:**
Node:           v8.12.0
npm:            6.4.1
Docker:         Docker version 18.06.1-ce, build e68fc7a
Docker Compose: docker-compose version 1.13.0, build 1719ceb
Python:         Python 2.7.12

___
### Installation of Composer CLI Tool
```sh
npm install -g composer-cli
```
___
### Installation of development environment
```sh
mkdir ~/fabric-dev-servers && cd ~/fabric-dev-servers
curl -O https://raw.githubusercontent.com/hyperledger/composer-tools/master/packages/fabric-dev-servers/fabric-dev-servers.tar.gz
tar -xvf fabric-dev-servers.tar.gz
```
___
### Download and start the docker images
```sh
./downloadFabric.sh 
./startFabric.sh 
```

***Note***:
**For error:** Got permission denied while trying to connect to the Docker daemon socket at unix:///var/run/docker.sock: Get http://%2Fvar%2Frun%2Fdocker.sock/v1.38/images/json: dial unix /var/run/docker.sock: connect: permission denied
**Do:** sudo chmod 666 /var/run/docker.sock

#### For non-destructive restarts of dev environment

```sh
curl -O https://github.com/acloudfan/HLF-Windows-Fabric-Tool/blob/master/fabricUtil.sh
chmod 755 fabricUtil.sh
```

**First time launch:**
```sh
./startFabric.sh
```
**After that:**
```sh
./fabricUtil.sh stop
./fabricUtil.sh start
```
___
#### To get docker images:
```sh
docker images
```
```
REPOSITORY                   TAG                 IMAGE ID            CREATED             SIZE
hyperledger/fabric-ca        1.2.0               66cc132bd09c        2 months ago        252MB
hyperledger/fabric-ccenv     1.2.0               6acf31e2d9a4        2 months ago        1.43GB
hyperledger/fabric-orderer   1.2.0               4baf7789a8ec        2 months ago        152MB
hyperledger/fabric-peer      1.2.0               82c262e65984        2 months ago        159MB
hyperledger/fabric-couchdb   0.4.10              3092eca241fc        2 months ago        1.61GB
```
#### And, the running containers:
```sh
docker ps
```
```
CONTAINER ID        IMAGE                               COMMAND                  CREATED             STATUS              PORTS                                            NAMES
3010cb6c712b        hyperledger/fabric-peer:1.2.0       "peer node start"        2 minutes ago       Up 2 minutes        0.0.0.0:7051->7051/tcp, 0.0.0.0:7053->7053/tcp   peer0.org1.example.com
72afa9a59096        hyperledger/fabric-couchdb:0.4.10   "tini -- /docker-ent…"   2 minutes ago       Up 2 minutes        4369/tcp, 9100/tcp, 0.0.0.0:5984->5984/tcp       couchdb
a253164631d4        hyperledger/fabric-ca:1.2.0         "sh -c 'fabric-ca-se…"   2 minutes ago       Up 2 minutes        0.0.0.0:7054->7054/tcp                           ca.org1.example.com
9a14513db2a1        hyperledger/fabric-orderer:1.2.0    "orderer"                2 minutes ago       Up 2 minutes        0.0.0.0:7050->7050/tcp                           orderer.example.com
```
___
### Installation of Yeoman
```sh
npm install -g yo
```
___
### Installation of  hyperledger-composer yo generator
```sh
npm install -g generator-hyperledger-composer
```
___
### Check installed generators
```sh
yo --generators
```
___
### Creating a BNA
- Generate BNA scaffolding using the Yo generator. 
```sh
yo hyperledger-composer
```
___
### Deploying a BNA to Playground
- In the BNA directory,
```sh
mkdir dist cd dist
composer archive create -t dir -n ../
```
- Upload the bna archive on playground: https://composer-playground.mybluemix.net/
___
### To change the HLF version
```sh
export FABRIC_VERSION=hlfv1
export FABRIC_VERSION=hlfv11
export FABRIC_VERSION=hlfv12
```
___
### Deploying a BNA to local HLF n/w
- Launch Fabric n/w
	```sh
	./startFabric.sh
	```
- Verify | Create the Peer Admin Card
	```sh
	./createPeerAdminCard.sh
	```
	- You can check the installed cards using
		```sh
		composer card list
		```
- Install the n/w application to fabric
	```sh
	composer network install -a path/to/archive/test-bna@0.0.1.bna -c PeerAdmin@hlfv1
	```
- Start BNA on fabric
	```sh
	composer network start -c PeerAdmin@hlfv1 -n test-bna -V 0.0.1 -A admin -S adminpw
	```
- Import the Network Admin's card
	```sh
	composer card import -f admin@test-bna.card
	```
	- Check if the card was imported
		```sh
		composer card list
		```
___
### Composer cli commands
```sh
composer card list
composer network list -c admin@test-bna
composer network ping -c admin@test-bna
```
___
### Upgrading the BNA
- Change version in package.json file (0.0.2)
- Create archive for the new version of BNA
	```sh
	composer archive create -t dir -n ../
	```
- Install the new version of archive:
	```sh
	composer network install -a ./code/hyperledger/test-model/dist/test-bna@0.0.2.bna -c PeerAdmin@hlfv1
	```
- Upgrade the n/w app to the new version:
	```sh
	composer network upgrade -c PeerAdmin@hlfv1 -n test-bna -V 0.0.2
	```

- Ping the new network card
  ```sh
  composer network ping -c admin@test-bna
  ```
- List the business network
	```sh
	composer network list -c admin@test-bna
	```
___
### To run REST Server
```sh
composer-rest-server
```
___
# EASY TO START BNA
Use magic shell script into my reprositories. 
