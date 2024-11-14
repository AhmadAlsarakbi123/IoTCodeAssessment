## Run
```docker compose up```

## Test auth_service
A request to ```localhost:3000/auth``` to test auth_service

### response 401 Authentication failed
If the user data is not correct

### response 200 Authenticated
If the user data is correct with a token

### response 500
service failure (Authentication service did not respond in time)

## Test save_service
A request to ```localhost:3000/save``` to test auth_service

### response 200 data saved
if all required data is there {"name"="test", "email":"example@example.com"}

### response 500 required data missing
{"email":"example@example.com"}
Data saving failed One of the required fields is missing (name, email)!

### response 500 required data empty
{"name"="", "email":"example@example.com"}
Data saving failed One of the required fields is empty (name, email)!
service failure (Data save service did not respond in time)


## Issues encounterd
### node.js hangs at npm install
By some of the builds of the containers the container became stuck at the ```npm install``` command,to fix this i added dns property to the docker-compose file and also let the image clear the cache to hopefully avoid this issue.
I also added the registry https://registry.npmjs.org to hopefully avoid any dns resolve issues that can be caused by using node inside docket.

### redis client in subscribe mode:
There was an error if one redis client is used to do both subscribe to a channel and also publish.
To fix this i added another client and made one responsible for the subscribe operation and the other responsible for other operations outside sub/pub mode