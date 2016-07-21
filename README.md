# QUB-Coin

This is the repository for the Queens University project which aims to create a digital currency that can be issued to Queen’s students based on their lecture attendance. The system will allocate a points based system that can be used to tip their instructors as a means to provide positive real time feedback in an anonymous manner. As university fees are increasing, students are demanding more from their universities to provide a better learning experience. Resultantly, instructors will be able to enact change in their module and better understand students problems. This will create a more engaging learning environment and more effective feedback system than the paper pased feedback system, currently used within the university. To encourage more students to engage with they system, there will be two types of coins; general coins for sending to instructors and proof of concept personal coins that will enable students to send to their peers and buy from a vendor.

## key objectives of this project include:

•	Students will be encouraged to attend more lectures
•	Supervisors will better support/understand problems students are having problems with
•	More students will be encouraged to submit real time feedback instead of the slow paper based feedback system
•	Supervisors will be able to respond to student concerns more quickly and effectively 


## Terms
* **Instructor**: either a "lecturer" or a "demonstrator" at the Queens university who is responsible to effectively teach student during *classes*
* **Class**: either a "lecture" or a "practical", with a set of students, 1 or more instructor(s), a location and a timeline (start and end date/time)

## Scope
This project will make use of a private *Ethereum* network blockchain as its Datastore with some smart contract capabilities allowing management of digital assets.
There are a couple of digital assets to be considered as of the initial design:
* A *"general"* coin:  assigned to student when attending classes (lectures/practicals)
* A *"personal"* coin:  temporarily assigned to student that can only be transferred to either an *instructor* or a *peer* (pending approval by instructor), as a way to provide weighted feedback when support or help was provided during a class.  

## Setting-up a geth node for ethereum using docker

[This page](docs/geth-setup.md) explains the steps required to get an Ethereum Node running in Docker!
