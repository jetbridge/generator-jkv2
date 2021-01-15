# JKv2 Yeoman generator
Opinionated generator for mono-repo web apps.

Features:
- No framework. Just functions and API Gateway
- Postgres & TypeORM
- Cognito

## Quickstart

### Pre-requisites
* npm 7
* yeoman
* jkv2 generator

```shell
npm i -g npm@7 yo generator-jkv2
yo jkv2
```

### Generate a new TypeORM DB model
`yo jkv2:model`

### Generate a new API endpoint for a model
`yo jkv2:api`
