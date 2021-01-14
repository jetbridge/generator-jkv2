const Generator = require('yeoman-generator')
const camelCase = require('camelcase')
const kebabCase = require('kebab-case')
const fs = require("fs")
const YAML = require('yaml')


module.exports = class extends Generator {
    /* 
    We wanna be able to scaffold a template of a new TypeORM DB model by just running `yo jkv2:model`.

    This involves creating one in the core package, exporting it from it and registering it with the TypeORM connection.
    */
    async prompting() {
        this.answers = await this.prompt([
            {
                type: 'list',
                name: 'capitalizedModelName',
                message: 'What model is the new endpoint for?',
                choices: this.config.get("models")
            },
            {
                type: 'list',
                name: 'httpMethod',
                message: 'What HTTP method is the endpoint gonna use?',
                choices: ["GET", "POST", "PATCH", "DELETE"]
            },
            {
                type: 'input',
                name: 'endpointName',
                message: 'Enter the name of the new endpoint  # e.g. "listGames"',
            }])

        this.answers.modelName = camelCase(this.answers.capitalizedModelName)
        this.answers.endpointName = camelCase(this.answers.endpointName)

        const answersExtension = await this.prompt([
            {
                type: 'input',
                name: 'endpointPath',
                message: 'What should the path for the new endpoint be?',
                default: kebabCase(`/${camelCase(this.answers.capitalizedModelName)}/${camelCase(this.answers.endpointName)}`)
            },
        ])

        this.answers.endpointPath = kebabCase(answersExtension.endpointPath)

        this.spawnCommandSync('git', ['add', '--all'])
        this.spawnCommandSync('git', ['commit', '-m', `"Before creating ${this.answers.endpointName} endpoint"`])
    }

    writing() {
        this.conflicter.force = true

        const backendPackagePath = `${this.destinationPath()}/packages/backend`
        const apiViewsDestination = `${backendPackagePath}/src/api/${this.answers.modelName}/view.ts`
        const serverlessTemplateDestination = `${backendPackagePath}/cloudformation/serverlessFunctions/api/${this.answers.modelName}.yml`
        const mainServerlessConfigDestination = `${backendPackagePath}/serverless.yml`


        const templateOptions = {
            capitalizedModelName: this.answers.capitalizedModelName,
            modelName: this.answers.modelName,
            projectName: this.config.get('projectName'),
            endpointName: this.answers.endpointName,
            endpointPath: this.answers.endpointPath,
            httpMethod: this.answers.httpMethod
        }

        // Add new API view to the backend package
        if (!this.fs.exists(apiViewsDestination)) {
            this.fs.copyTpl(
                this.templatePath("viewWithImports.ts"),
                apiViewsDestination,
                templateOptions
            )
        }
        else {
            let newApiView = fs.readFileSync(this.templatePath("viewWithoutImports.ts"), 'utf-8').toString('utf-8')
            newApiView = newApiView.replace(new RegExp('<%= capitalizedModelName %>', 'gi'), this.answers.capitalizedModelName)
            newApiView = newApiView.replace(new RegExp('<%= endpointName %>', 'gi'), this.answers.endpointName)

            fs.appendFileSync(apiViewsDestination, newApiView)
        }


        // Add the serverless template
        if (!this.fs.exists(serverlessTemplateDestination)) {
            this.fs.copyTpl(
                this.templatePath("view.yml"),
                serverlessTemplateDestination,
                templateOptions
            )

            // Below is a duplicate code from the model generator. Should be extracted to a reusable function
            // Add reference to the .yml containing lambdas to the "functions" array in main serverless.yml
            const mainServerlessConfig = fs.readFileSync(mainServerlessConfigDestination, 'utf-8').toString('utf-8')
            const parsedYML = YAML.parse(mainServerlessConfig)
            const newPathToFunctions = "${file(cloudformation/serverlessFunctions/api/<%= modelName %>.yml)}".replace("<%= modelName %>", this.answers.modelName)

            if (!parsedYML.functions.includes(newPathToFunctions)) {
                parsedYML.functions.push(newPathToFunctions)
                const newMainServerlessConfig = YAML.stringify(parsedYML)
                this.fs.write(mainServerlessConfigDestination, newMainServerlessConfig)
            }
        }
        else {
            let serverlessFunction = fs.readFileSync(this.templatePath("view.yml"), 'utf8').toString('utf8')
            serverlessFunction = serverlessFunction.replace(new RegExp('<%= modelName %>', 'gi'), this.answers.modelName)
            serverlessFunction = serverlessFunction.replace(new RegExp('<%= capitalizedModelName %>', 'gi'), this.answers.capitalizedModelName)
            serverlessFunction = serverlessFunction.replace(new RegExp('<%= endpointName %>', 'gi'), this.answers.endpointName)
            serverlessFunction = serverlessFunction.replace(new RegExp('<%= endpointPath %>', 'gi'), this.answers.endpointPath)
            serverlessFunction = serverlessFunction.replace(new RegExp('<%= httpMethod %>', 'gi'), this.answers.httpMethod)

            const updatedApiTemplate = fs.readFileSync(serverlessTemplateDestination, 'utf-8').toString('utf-8') + serverlessFunction

            this.fs.write(serverlessTemplateDestination, updatedApiTemplate)
        }
    }
}