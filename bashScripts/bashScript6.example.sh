
#BEFORE YOU RUN THE IMAGE YOU PULLED IN bashScript5.sh: you have to "">docker images" and grab the id of the image you just pulled
imageID=[[[Replace with image ID. See above commentfor more info]]]
portMapping=3000:3000

docker run -dp $portMapping --network="host" $imageID

