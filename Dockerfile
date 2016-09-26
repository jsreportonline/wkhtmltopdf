FROM ubuntu:latest
MAINTAINER Jan Blaha
EXPOSE 5000

RUN apt-get update && apt-get install -y sudo
RUN apt-get install -y  curl
RUN curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
RUN apt-get install -y nodejs libxrender1 libfontconfig libxext6

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install --production

COPY . /usr/src/app

EXPOSE 5000

HEALTHCHECK CMD curl --fail http://localhost:5000 || exit 1

CMD [ "node", "index.js" ]