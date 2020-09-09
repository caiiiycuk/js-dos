#FROM ubuntu:16.04
FROM node:12

SHELL ["/bin/bash", "-c"]
RUN apt-get update
RUN apt-get install -y --no-install-recommends ca-certificates apt-utils build-essential git python cmake
COPY . /app
WORKDIR /app
RUN git clone https://github.com/emscripten-core/emsdk.git
RUN cd emsdk; ./emsdk install latest; ./emsdk activate latest
RUN npm install -g gulp
RUN npm install
RUN source ./emsdk/emsdk_env.sh; gulp

