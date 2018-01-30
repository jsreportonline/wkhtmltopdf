FROM ubuntu:xenial
MAINTAINER Jan Blaha
EXPOSE 5000

RUN apt-get update && apt-get install -y curl sudo && \
    curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash - && \
    apt-get install -y nodejs libxrender1 libfontconfig libxext6 && \
    apt-get install -y fonts-dejavu-core fonts-dejavu-extra fonts-droid-fallback fonts-guru fonts-guru-extra fonts-horai-umefont fonts-kacst fonts-kacst-one fonts-khmeros-core  fonts-lao fonts-liberation fonts-lklug-sinhala fonts-lohit-guru fonts-nanum fonts-noto-cjk fonts-opensymbol fonts-roboto fonts-roboto-hinted fonts-sil-abyssinica fonts-sil-padauk fonts-stix fonts-symbola fonts-takao-pgothic fonts-thai-tlwg fonts-tibetan-machine fonts-tlwg-garuda fonts-tlwg-kinnari fonts-tlwg-laksaman fonts-tlwg-loma fonts-tlwg-mono fonts-tlwg-norasi fonts-tlwg-purisa fonts-tlwg-sawasdee fonts-tlwg-typewriter fonts-tlwg-typist fonts-tlwg-typo fonts-tlwg-umpush fonts-tlwg-waree fonts-unfonts-core 

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install --production

COPY . /usr/src/app

EXPOSE 5000

HEALTHCHECK CMD curl --fail http://localhost:5000 || exit 1

CMD [ "node", "index.js" ]