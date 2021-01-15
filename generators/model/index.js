const Generator = require('yeoman-generator')
const ts = require('typescript')
const fs = require("fs")
const tsMorph = require('ts-morph')
const prependFile = require('prepend-file')
const camelCase = require('camelcase')
const pluralize = require('pluralize')
const YAML = require('yaml')


module.exports = class extends Generator {
    /* 
    We wanna be able to scaffold a template of a new TypeORM DB model by just running `yo jkv2:model`.

    This involves creating one in the core package, exporting it from it and registering it with the TypeORM connection.
    */
    async prompting() {
        this.answers = await this.prompt([{
            type: 'input',
            name: 'modelName', // TODO properly handle casing of this var when naming folders, classes, etc.
            message: 'Enter the name of the new model',
        },
        {
            type: 'confirm',
            name: 'generateCRUD',
            message: 'Generate CRUD API and tests for the model?',
            default: true
        },
        ])

        this.answers.modelName = camelCase(this.answers.modelName)

        this.spawnCommandSync('git', ['add', '--all'])
        this.spawnCommandSync('git', ['commit', '-m', `"Before creating new model"`])
    }

    async writing() {
        /*
        Create a TypeORM model file in the core package

        Add the new model to exports from core and to the array of recognized models in Connection.ts 
        */
        this.conflicter.force = true  // Don't prompt for user confirmation when editting to existing files

        const corePackagePath = `${this.destinationPath()}/packages/core`
        const backendPackagePath = `${this.destinationPath()}/packages/backend`


        const modelCopyDestination = `${corePackagePath}/src/model/${this.answers.modelName}.ts`
        const factoryCopyDestination = `${corePackagePath}/src/factory/${this.answers.modelName}.factory.ts`
        const pathToExportsFromCore = `${corePackagePath}/src/index.ts`
        const pathToConnectionConfig = `${backendPackagePath}/src/db/Connection.ts`

        const capitalizedModelName = camelCase(this.answers.modelName, { pascalCase: true, preserveConsecutiveUppercase: true })
        const modelApiSchemaName = camelCase(`${capitalizedModelName}SchemaLite`, { pascalCase: true })
        const modelFactoryName = camelCase(`${this.answers.modelName}Factory`)
        const modelIdName = camelCase(`${this.answers.modelName}Id`)
        const pluralizedModelName = pluralize(capitalizedModelName)

        const templateOptions = {
            capitalizedModelName: capitalizedModelName,
            modelName: this.answers.modelName,
            projectName: this.config.get('projectName'),
            modelFactoryName: modelFactoryName,
            modelSchemaName: modelApiSchemaName,
            modelIdName: modelIdName,
            pluralizedModelName: pluralizedModelName
        }

        this.fs.copyTpl(
            this.templatePath("model.ts"),
            modelCopyDestination,
            templateOptions
        )
        this.fs.copyTpl(
            this.templatePath("model.factory.ts"),
            factoryCopyDestination,
            templateOptions
        )

        // export the model and its factory from core to make it useable in backend and frontend packages
        this.fs.append(pathToExportsFromCore, `\nexport { ${capitalizedModelName} } from "./model/${this.answers.modelName}"\n`)
        this.fs.append(pathToExportsFromCore, `\nexport { ${this.answers.modelName}Factory } from "./factory/${this.answers.modelName}.factory"\n`)

        // import the new model at the top of "Connection.ts" file to then register it with TypeORM
        await prependFile(pathToConnectionConfig, `import { ${capitalizedModelName} } from "${this.config.get('projectName')}-core"\n`)

        // The update of the ALL_ENTITIES variable is done via parsing the TS code into an AST with the help of the "ts-morph" package
        // More reading on it here:
        // https://www.jameslmilner.com/post/ts-ast-and-ts-morph-intro/
        // https://ts-ast-viewer.com/#
        // https://github.com/dsherret/ts-morph/issues/446
        const project = new tsMorph.Project();
        const sourceFile = project.createSourceFile(pathToConnectionConfig, fs.readFileSync(pathToConnectionConfig).toString(), { overwrite: true })

        const entitiesDeclaration = sourceFile.getVariableDeclarationOrThrow("ALL_ENTITIES")
        const arrayLiteralExpression = entitiesDeclaration.getInitializerIfKindOrThrow(ts.SyntaxKind.ArrayLiteralExpression)

        arrayLiteralExpression.addElement(capitalizedModelName)
        sourceFile.saveSync()

        if (!this.answers.generateCRUD) return

        // If users wishes, generate CRUD endpoints for the model and tests for them
        const apiCopyDestination = `${backendPackagePath}/src/api/${this.answers.modelName}/crud.ts`
        const testsCopyDestination = `${backendPackagePath}/src/api/${this.answers.modelName}/crud.test.ts`
        const serverlessCopyDestination = `${backendPackagePath}/cloudformation/serverlessFunctions/api/${this.answers.modelName}.yml`
        const domainFuntionsCopyDestination = `${backendPackagePath}/src/domain/${this.answers.modelName}.ts`
        const apiSchemaCopyDestination = `${corePackagePath}/src/apiSchema/${this.answers.modelName}.ts`
        const mainServerlessConfigDestination = `${backendPackagePath}/serverless.yml`

        // Generate domain functions
        this.fs.copyTpl(
            this.templatePath("domain.ts"),
            domainFuntionsCopyDestination,
            templateOptions
        )

        // Generate validation schema
        this.fs.copyTpl(
            this.templatePath("apiSchema.ts"),
            apiSchemaCopyDestination,
            templateOptions
        )
        this.fs.append(pathToExportsFromCore, `\nexport { ${modelApiSchemaName} } from "./apiSchema/${this.answers.modelName}"\n`)

        // Generate CRUD views
        this.fs.copyTpl(
            this.templatePath("crud.ts"),
            apiCopyDestination,
            templateOptions
        )

        // Generate Jest tests
        this.fs.copyTpl(
            this.templatePath("crud.test.ts"),
            testsCopyDestination,
            templateOptions
        )

        // CFN templates for lambdas in .yml

        // Add reference to the .yml containing lambdas to the "functions" array in main serverless.yml
        const mainServerlessConfig = fs.readFileSync(mainServerlessConfigDestination, 'utf-8').toString('utf-8')
        const parsedYML = YAML.parse(mainServerlessConfig)
        const newPathToFunctions = "${file(cloudformation/serverlessFunctions/api/<%= modelName %>.yml)}".replace("<%= modelName %>", this.answers.modelName)

        if (!parsedYML.functions.includes(newPathToFunctions)) {
            parsedYML.functions.push(newPathToFunctions)
            const newMainServerlessConfig = YAML.stringify(parsedYML)
            this.fs.write(mainServerlessConfigDestination, newMainServerlessConfig)
        }

        // Create the functions in cloudformation/slsFunctions/api/modelName.yml
        let serverlessFunctions = fs.readFileSync(this.templatePath("crud.yml"), 'utf8').toString('utf8')
        serverlessFunctions = serverlessFunctions.replace(new RegExp('<%= modelName %>', 'gi'), this.answers.modelName)
        serverlessFunctions = serverlessFunctions.replace(new RegExp('<%= capitalizedModelName %>', 'gi'), capitalizedModelName)
        serverlessFunctions = serverlessFunctions.replace(new RegExp('<%= pluralizedModelName %>', 'gi'), pluralizedModelName)

        this.fs.write(serverlessCopyDestination, serverlessFunctions)
    }

    async end() {
        this.spawnCommandSync("npm", ["run", "build:all"], { cwd: 'packages/backend' })

        const models = this.config.get("models")
        const newModelName = camelCase(this.answers.modelName, { pascalCase: true, preserveConsecutiveUppercase: true })
        if (!models.includes(newModelName))
            models.push(newModelName)

        this.config.set("models", models)
    }
}