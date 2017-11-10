# bert

[![Build Status](https://travis-ci.org/oliveroneill/bert.svg?branch=master)](https://travis-ci.org/oliveroneill/bert)

Bert (Better Error Resolution in Terminals) is a program that will monitor your terminal output and send you
helpful tips on how to solve errors.

This is still a work in progress. Currently Bert can identify basic
errors and will send you a notification with a link to the StackOverflow
search results. We have plans to extend this functionality to deliver
helpful answers and identify a large range of tests.

## OS Support
Currently only tested on MacOS. It should run fine on Linux. Unfortunately we
are using `script` to watch terminal output and I don't believe this is
included in Windows, we plan to add support in the future.

## Development
Install:
```bash
npm i
```
Build the package (currently used for [Flow](https://flow.org/)):
```bash
npm run build
```
Link the package so that you don't have to re-install each time:
```bash
npm link
```
Test:
```bash
npm test
```
Run:
```bash
bert
```

## TODO
- Add better search functionality so that Bert can give real recommendations
- Windows compatibility
- More error identifiers
