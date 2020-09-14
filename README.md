Emulators for [js-dos 7.xx](https://js-dos.com/v7/build/)


## Using Docker

### Build image

```
    docker build -t emulators . 
```

### Test image


```
    docker run -p 8080:8080 -ti emulators
```

Open `http://localhost:8080` in browser, all test should pass


### Development

Run inside the project dir:

```
    docker run -v `pwd`/src:/app/src -v `pwd`/test:/app/test -v `pwd`/dist:/app/dist -ti emulators bash
    source /emsdk/emsdk_env.sh
    gulp OR ./node_modules/.bin/tsc --watch
```

Use your code editor to edit the content of src and test. 
In the docker VM you can run `gulp` to build everything into `dist` OR use
`./node_modules/.bin/tsc --watch` if you need only compile time checks.




