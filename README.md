# Proxy-Server-Nick
 A proxy server for PetToyCo that relies on the services listed in "Related Projects"

## Related Projects

  - https://github.com/Gancedo-Petco/image-service

## Table of Contents

1. Usage
2. Deployment
3. Load Balancer
4. Requirements

## Usage

To use this proxy server:

1. From project's root directory, >npm install
2. Download each of the above repos (in the section "Related Projects". Each repo represents a service to this proxy) into its own unique directory. Then follow the instructions in each ReadMe - for each service - for how to get the service up and running.
3. Then start the proxy's server by running >npm run start
4. Visit any page that follows the form:
http://127.0.0.1:3000/product/### where ### is any number between 100 to 10,000,099  (but without commas)
5. To run Unit tests, >npm run test
6. To run integration tests, visit the following link (after following the special note below):
http://127.0.0.1:3000/SpecRunner.html
NOTE: as the page that loads tells you, you have to wait before the tests will run. This is to give the embedded iframe the chance to load the proxy's html file, followed by that html file sending out get requests for the service components, followed by those components sending out requests for data. Only then do the tests run.

## Deployment
1. If necessary, launch a fresh AWS EC2 instance with Amazon Linux AMI 2018.03.0 (HVM), SSD Volume Type, x64
2. Assign Elastic IP to instance
3. Update bashScript.sh through bashScript6.sh. Examples are fouund in ./bashScripts. Make duplicates and remove the .example portion. Then update with relevant info. Note you need a Docker Hub account and repo to run these scripts. You also need to update bashScript2.sh and bashScript6.sh with the correct imageId after running bashScript.sh
4. SSH into AWS EC2 instance using bashScript3.sh
5. Install Redis on AWS EC2 instance
a.  >sudo yum install git -y
b. >/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"
c. >sudo yum groupinstall 'Development Tools'
d. >echo 'eval $(/home/linuxbrew/.linuxbrew/bin/brew shellenv)' >> /home/ec2-user/.bash_profile
e. >eval $(/home/linuxbrew/.linuxbrew/bin/brew shellenv)
f. >brew install gcc
g. >brew install redis
6. After redis is done installing, it reports what terminal command to run so you can alter redis config file and which command to run to launch redis server using that config file. Mine were:
>sudo nano /home/linuxbrew/.linuxbrew/etc/redis.conf
>redis-server /home/linuxbrew/.linuxbrew/etc/redis.conf
7. Run >sudo nano /home/linuxbrew/.linuxbrew/etc/redis.conf  and then make the following changes:
a. In Snapshotting, comment out any variable that begins with "save"
b. In Memory Management, uncomment maxmemory and change to 400MB
c. In Memory Management, uncomment maxmemory-policy and change to allkeys-lfu
d. In Memory Management, uncomment maxmemory-samples and change to 7
8. Save changes in Linux format and then start server with >redis-server /home/linuxbrew/.linuxbrew/etc/redis.conf
9. Install Docker on AWS EC2 instance
a. >sudo ym update -y
b. >sudo yum install -y docker
c. >sudo service docker start
d. >sudo usermod -a -G docker ec2-user
e. >exit
10. The exit command should kick you out of your SSH session. This is needed so part d can take affect and allow docker commands to run without sudo. If you SSHed with bashScript3.sh, then you can simply hit the up arrow key in the same terminal window and hit enter to reSSH
11. In a new terminal window, cd to project's root folder. Now is the time to update ./config.js with the IP address for the server instances the proxy will connect to. Also any secrets the services expect to receive.
12. Now run bashScript.sh to build image
13. Once script finishes, copy imageId to bashScript2.sh and bashScript6.sh. Save and then run bashScript2.sh
14. Back in the AWS EC2 SSH, log into docker with >docker login --username="your Docker Hub username, without quotes" and enter password when prompted.
15. Once bashScript2.sh finishes running, built image will be on Docker Hub. You can pull it to AWS EC2 instance by copying, pasting, and running code in bashScript5.sh into SSH shell
16. If you have a previous image for this proxy running on the AWS EC2 instance, you can use bashScript4.sh to stop it by first running >docker ps    and then copying/pasting old container/image Ids to appropriate fields in bashScript4.sh. Then copy/paste/execute bashScript4.sh code in SSH shell.
17. Confirm all services the proxy depends on are running and then initiate proxy by copy/paste/execute bashScipt6.sh code into SSH shell
18. Confirm proxy is running by visiting http://"IP address for AWS EC2 instance, without quotes":3000/product/### where ### can be any integer number between 100 to 10,000,099, without quotes

## Load Balancer

The above deployment instructions assume the following:

1. One DB instance per service
2. One service instance per service
3. One proxy instance

However, a load balancer is included in this project that is designed to work under these conditions:

1. One DB instance per service
2. Three service instances per service
3. Six proxy instances. Two proxy instances connected per service instance, per service
4. The load balancer as the public facing server, connected to all the proxies.

To get this system up and running:

1. follow all the instructions in every service ReadMe to get a DB up and seeded and then three services up and running and connected to DB.
2. Follow the above deployment instructions to launch 6 proxy servers. For each proxy, duplicate the bashscripts and save them in a different folder (PI1 through PI6 works well) so you can easily make unique scripts. bashScript3.sh should be unique for each instance while bashScript6.sh will be the same for each pair of instances connected to the same set of service instances.
3. Now it is time to launch the load balancer server. Note that it is intended to be run on a T3A.2xlarge which costs money.
4. Launch the instance with Ubuntu Server 16.04 LTS (HVM), SSD Volume Type 64-bit (x86)
5. Give server an Elastic IP and ssh in. Note that, if you use bashScript3.sh, you will have to change ec2-user to ubuntu.
6. Install nginx
a. >sudo wget http://nginx.org/keys/nginx_signing.key
b. >sudo apt-key add nginx_signing.key
c. >cd /etc/apt
d. >sudo nano sources.list
e. Append  the following two lines to the file, then save and exit.:
deb http://nginx.org/packages/ubuntu xenial nginx
deb-src http://nginx.org/packages/ubuntu xenial nginx
f. >sudo apt-get update
g. >sudo apt-get install nginx
7. Alter config files by:
a. >cd  /etc/nginx/conf.d
b. >sudo nano default.conf
Put a # in front of every line that doesn’t already have a #, then save and exit
c. >sudo nano loadbalancer.conf
In a folder located in this project at ./LoadBalancer/nginxConfiguration is the options you should copy and paste into this file. Also update the server info with the IP:port for each of the proxy instances. Save and exit
d.>sudo nano ../nginx.conf
Change worker_processes to 6 (if and only if you are using a server with 8 cores, like the T3A.2xlarge recommended above. Otherwise, adjust for number of cores you have). There should already be a html block in this config file. Delete it. Then add the following line, at the bottom of the file, save and exit:
include conf.d/loadbalancer;
e. Configuration should now be complete
8. Launch server with >sudo service nginx start
9. Check server by visiting http://”Ip address, without quotes”:3000/product/### where ### is any number 100 to 10,000,099, without commas




## Requirements

- Node 12.16.1
