FROM node:12.18.1
ENV NODE_ENV=production
WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y python-pip python-dev

COPY package*.json /usr/src/app
COPY generateRoomCode.js /usr/src/app
COPY parser.py /usr/src/app
COPY parserInterface.js /usr/src/app
COPY server.js /usr/src/app
COPY requirements.txt /usr/src/app

RUN npm i
RUN pip install -r requirements.txt
RUN npm install pm2 -g 

CMD ["pm2-runtime", "server.js"]