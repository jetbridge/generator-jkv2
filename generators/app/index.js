const Generator = require('yeoman-generator');

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
        this.spawnCommandSync('git', ['add', '--all'], { cwd: this.answers.title })
        this.spawnCommandSync('git', ['commit', '-m', '"initial commit from generator"'], { cwd: this.answers.title })
    }

    end() {
        // Initialize DB
        this.spawnCommandSync("npm", ["run", "db:init:local"], { cwd: 'packages/backend' })
    }


}