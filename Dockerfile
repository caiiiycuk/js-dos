FROM ubuntu:focal

ENV TZ=Europe/Moscow
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

SHELL ["/bin/bash", "-c"]
RUN apt-get -yqq update && \
    apt-get install -yq --no-install-recommends ca-certificates apt-utils build-essential git python3 cmake && \
    apt-get autoremove -y && \
    apt-get clean -y

RUN git clone https://github.com/emscripten-core/emsdk.git
RUN cd emsdk && ./emsdk install 2.0.2 && ./emsdk activate 2.0.2
RUN source /emsdk/emsdk_env.sh && npm install -g gulp

WORKDIR /app

COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
RUN source /emsdk/emsdk_env.sh && npm install && npm install http-server

COPY tsconfig.json /app/tsconfig.json
COPY tslint.json /app/tslint.json
COPY CMakeLists.txt /app/CMakeLists.txt
COPY gulpfile.ts /app/gulpfile.ts
COPY native /app/native
COPY src /app/src
COPY test /app/test

RUN source /emsdk/emsdk_env.sh && gulp wasm
RUN source /emsdk/emsdk_env.sh && gulp

EXPOSE 8080

CMD source /emsdk/emsdk_env.sh && ./node_modules/.bin/hs dist

