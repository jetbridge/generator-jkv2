const Generator = require('yeoman-generator')
const ts = require('typescript')
const fs = require("fs")
const tsMorph = require('ts-morph')
const prependFile = require('prepend-file');

module.exports = class extends Generator {
    /* 
    We wanna be able to scaffold a template of a new TypeORM DB model by just running `yo jkv2:model`.

    This involves creating one in the core package, exporting it from it and registering it with the TypeORM connection.
    */
    async prompting() {
        this.answers = await this.prompt([{
            type: 'input',
            name: 'modelName',
            message: 'Enter the name of the new model',
        },
        {
            type: 'confirm',
            name: 'generateCRUD',
            message: 'Generate CRUD API for the model?',
            default: true
        }
        ])
    }

    async writing() {
        /*
        Create a TypeORM model file in the core package

        Add the new model to exports from core and to the array of recognized models in Connection.ts 
        */
        this.conflicter.force = true  // Don't prompt for user confirmation when appending to existing files
        const copyDestination = `${this.destinationPath()}/packages/core/src/model/${this.answers.modelName}.ts`
        const capitalizedModelName = this.answers.modelName.charAt(0).toUpperCase() + this.answers.modelName.slice(1)
        const pathToExportsFromCore = `${this.destinationPath()}/packages/core/src/index.ts`
        const pathToConnectionConfig = `${this.destinationPath()}/packages/core/src/db/Connection.ts`

        this.fs.copyTpl(
            this.templatePath("model.ts"),
            copyDestination,
            {
                modelName: capitalizedModelName,
            }
        )

        // export the model from core to make it useable in backend and frontend packages
        this.fs.append(pathToExportsFromCore, `\nexport { ${capitalizedModelName} } from "./model/${this.answers.modelName}"\n`)

        // import the new model inside "Connection.ts" file to then register it with TypeORM
        await prependFile(pathToConnectionConfig, `import { ${capitalizedModelName} } from "../model/${this.answers.modelName}"\n`)

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
    }


}