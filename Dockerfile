FROM node:5.1.0

MAINTAINER Zalando SE

RUN npm install newrelic@1.24.0
RUN npm install winston@2.1.1
RUN npm install superagent@1.4.0
RUN npm install express@4.13.3
RUN npm install compression@1.6.0
RUN npm install js-yaml@3.4.6
RUN npm install node-tokens@0.0.2
RUN npm install bluebird@2.10.2
RUN npm install redis@2.4.2
RUN npm install superagent-bluebird-promise@2.1.1

# add scm-source
ADD /scm-source.json /scm-source.json

# appdynamics directory
RUN mkdir /tmp/appd && chmod -R 0777 /tmp/appd

# copy resources
COPY ./client/dist/ /www/dist/
COPY ./server/monitoring/newrelic-browser.js /www/dist/
COPY ./client/dist/index.html /www/
COPY ./server/yourturn.js /www/

# create env.js as user
RUN touch /www/dist/env.js && chmod 0666 /www/dist/env.js

# create new relic log directory
RUN touch /www/newrelic_agent.log && chmod 0666 /www/newrelic_agent.log
# new relic npm config
RUN touch /www/newrelic.js && chmod 0666 /www/newrelic.js

# expose and start
WORKDIR /www/
CMD node yourturn.js
EXPOSE 8080
