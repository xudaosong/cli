const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const inquirer = require("inquirer");
const validateProjectName = require("validate-npm-package-name");
const download = require("./download");
const { installDeps } = require("./installDeps");
const getOptions = require("./options");
const { ProjectType } = require("./consts");
const { parse } = require("./ejs");
const _ = require("lodash");

async function create(projectName, options) {
  const cwd = options.cwd || process.cwd();
  const inCurrent = projectName === ".";
  const name = inCurrent ? path.relative("../", cwd) : projectName;
  const targetDir = path.resolve(cwd, projectName || ".");
  const result = validateProjectName(name);
  if (!result.validForNewPackages) {
    console.error(chalk.red(`Invalid project name: "${name}"`));
    result.errors &&
      result.errors.forEach(err => {
        console.error(chalk.red.dim("Error: " + err));
      });
    result.warnings &&
      result.warnings.forEach(warn => {
        console.error(chalk.red.dim("Warning: " + warn));
      });
    exit(1);
  }
  if (fs.existsSync(targetDir)) {
    if (options.force) {
      await fs.remove(targetDir);
    } else {
      if (inCurrent) {
        const { ok } = await inquirer.prompt([
          {
            name: "ok",
            type: "confirm",
            message: `Generate project in current directory?`
          }
        ]);
        if (!ok) {
          return;
        }
      } else {
        const { action } = await inquirer.prompt([
          {
            name: "action",
            type: "list",
            message: `Target directory ${chalk.cyan(
              targetDir
            )} already exists. Pick an action:`,
            choices: [
              { name: "Overwrite", value: "overwrite" },
              { name: "Merge", value: "merge" },
              { name: "Cancel", value: false }
            ]
          }
        ]);
        if (!action) {
          return;
        } else if (action === "overwrite") {
          console.log(`\nRemoving ${chalk.cyan(targetDir)}...`);
          await fs.remove(targetDir);
        }
      }
    }
  }
  const cmdParams = await getOptions();
  const projectUrl = _.find(ProjectType, { name: cmdParams["ProjectType"] })
    .url;
  download(projectUrl, true).then(() => {
    parse(targetDir, { app: { name } });
    installDeps(targetDir);
  });
}
module.exports = (...args) => {
  return create(...args).catch(err => {
    // stopSpinner(false); // do not persist
    console.error(err);
    if (!process.env.IOT_CLI_TEST) {
      process.exit(1);
    }
  });
};
