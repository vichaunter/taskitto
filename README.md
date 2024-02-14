# Scrapito



### Motivation

As i need data, Scrapito is intended for when you need to extract data from specific urls in a concurrent way with multiple clients working at the same time from different places.

This service allows you to configure a endpoint to get the task, and an endpoint to send the data scraped from the given url.

### What is not

Scrapito is not a queue or task manager service, it just does one thing, receive the task from your system (with the required json format), extract the data, and send you back in the specific format. So is in your hands to provide that endpoints with that functionality, and handle when to give or not the task.

You can run as many as you need, in the same system, or in other systems (will be provided as docker also).

It will just start a service with an interval, and will ask for tasks meanwhile is not working in a current task.

(wip websockets)

### And if i need also the api?

There is another project between my repositories, with an api for specific pruposes, with it's queue manager and everything needed if you don't want to think too much, you can replace my api logic with your one.

## Where to start

Easy peasy, just clone the repo and run the commands for install and start it:

´´´
pnpm install
pnpm start

yarn install
yarn start
´´´

WIP: build/compilation
WIP: dockerized version

## Contributions?

If you don't want to wait until I will implement the rest of the things (I'm working in several projects and my time is limited), feel free to make a pull request with any of the missing things:
- Sockets mode (to allow connect to the endpoints via websockets and listen for tasks)
- Dockerized version to run in any place
- Any improvement you want to suggest

