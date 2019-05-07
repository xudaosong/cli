const inquirer = require("inquirer");
const { ProjectType } = require("./consts");

module.exports = async function getOptions() {
  return await inquirer.prompt([
    {
      type: "list",
      name: "ProjectType",
      message: "Please select the type of project to create",
      default: "project",
      choices: ProjectType
    }
  ]);
};
