Emulators for [js-dos 7.xx](https://js-dos.com/v7/build/)


### Docker

    docker build -t emulators . 

    docker run -v `pwd`/src:/app/src -v `pwd`/test:/app/test -v `pwd`/dist:/app/dist --name emulators -ti emulators bash
