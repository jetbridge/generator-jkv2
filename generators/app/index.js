const Generator = require('yeoman-generator')
const kebabCase = require('kebab-case')

module.exports = class extends Generator {
    async prompting() {
        this.answers = await this.prompt([{
            type: 'input',
            name: 'title',
            message: 'Your project title',
        },
        {
            type: 'confirm',
            name: 'generateFullStackApp',
            message: 'Generate a full-stack project? If you reply "no", only the backend will be generated.',
            default: true
        },
        {
            type: 'list',
            name: 'dbConnection',
            message: 'Pick how you\'re gonna connect to the database.',
            choices: ['VPC', 'Aurora Data API'],
            default: 'VPC'
        }
        ])

        this.answers.title = kebabCase(this.answers.title)
    }

    writing() {
        this.destinationRoot(`${this.contextRoot}/${this.answers.title}`)
        this.fs.copyTpl(
            this.templatePath(),
            this.destinationPath(),
            {
                title: this.answers.title,  // user's answer `title` used
            },
            null
            ,
            { globOptions: { dot: true } }  // allow files that start with "." to be copied as well e.g. .env 
        )
    }

    install() {
        this.npmInstall([], { 'legacy-peer-deps': true })

        // Create a git repo
        this.spawnCommandSync('git', ['init'])
        this.spawnCommandSync('git', ['add', '--all'])
        this.spawnCommandSync('git', ['commit', '-m', '"initial commit from generator"'])
    }

    end() {
        // Initialize DB
        this.spawnCommandSync("npm", ["run", "db:init:local"], { cwd: 'packages/backend' })

        // Save project title to reuse it in other generators
        this.config.set('projectName', this.answers.title)
        this.config.set('models', ["Game"])

        // Commit again after the installation is finished
        this.spawnCommandSync('git', ['add', '--all'])
        this.spawnCommandSync('git', ['commit', '-m', '"initial commit from generator"'])
    }


}