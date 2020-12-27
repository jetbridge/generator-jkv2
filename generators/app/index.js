const Generator = require('yeoman-generator');

module.exports = class extends Generator {
    async prompting() {
        this.answers = await this.prompt([{
            type: 'input',
            name: 'title',
            message: 'Your project title',
        }])
        // TODO: ask user if he wants a full-stack app or only backend to be generated
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

        // For the TypeORM commands to run properly with TS we need to run "install" in the core package
        this.spawnCommandSync("npm", ["install", "--legacy-peer-deps"], { cwd: 'packages/core' })

        // Create a git repo
        this.spawnCommandSync('git', ['init']);
        this.spawnCommandSync('git', ['add', '--all'], { cwd: this.answers.title });
        this.spawnCommandSync('git', ['commit', '-m', '"initial commit from generator"'], { cwd: this.answers.title });
    }

    end() {
        // Initialize DB
        this.spawnCommandSync("npm", ["run", "db:init:local"], { cwd: 'packages/core' })
    }


}