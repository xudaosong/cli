#!/usr/bin/env node

const program = require("commander");
const chalk = require("chalk");
const minimist = require("minimist");
const { parse } = require("../lib/ejs");
program
  .version(require("../package.json").version)
  .usage("<command> [options]");

program
  .command("create <app-name>")
  .description("create a new project powered by iot-cli-service")
  .action((name, cmd) => {
    const options = cleanArgs(cmd);

    if (minimist(process.argv.slice(3))._.length > 1) {
      console.log(
        chalk.yellow(
          "\n Info: You provided more than one argument. The first one will be used as the app's name, the rest are ignored."
        )
      );
    }
    // parse("C:\\iot-cli", {name});
    require("../lib/create")(name, options);
  });

program.parse(process.argv);

function camelize(str) {
  return str.replace(/-(\w)/g, (_, c) => (c ? c.toUpperCase() : ""));
}

function cleanArgs(cmd) {
  const args = {};
  cmd.options.forEach(o => {
    const key = camelize(o.long.replace(/^--/, ""));
    if (typeof cmd[key] !== "function" && typeof cmd[key] !== "undefined") {
      args[key] = cmd[key];
    }
  });
  return args;
}
