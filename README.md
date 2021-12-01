# Origin_Platform
GraphQL api based on GRANDStack

## Quick Start

Cloning the project for the first time:

```shell
git clone --recursive https://github.com/HoareLea/Origin_Schema.git
```

Install dependencies:

```shell
cd api
```

```shell
npm install
```

Start the GraphQL service:

```shell
npm start
```

This will start the GraphQL service (by default on localhost:4000) where you can issue GraphQL requests or access GraphQL Playground in the browser.


### Handling Git Submodules

Add Origin_Schema as submodule:

```shell
cd schema
git submodule add -b dev https://github.com/HoareLea/Origin_Schema.git
```

Update Origin_Schema submodule:

```shell
cd schema
git submodule update --remote
```

## Suggested Plugins

https://github.com/neo4j-contrib/neo4j-apoc-procedures
https://github.com/h-omer/neo4j-versioner-core
https://github.com/neo4j/graph-data-science