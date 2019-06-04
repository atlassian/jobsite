#! /usr/bin/env node

const chalk = require("chalk");
const cli = require("commander");
const concurrently = require("concurrently");
const { findWorkspaces } = require(".");

const colors = [
  "black",
  "red",
  "green",
  "yellow",
  "blue",
  "magenta",
  "cyan",
  "white",
  "gray",
  "redBright",
  "greenBright",
  "yellowBright",
  "blueBright",
  "magentaBright",
  "cyanBright",
  "whiteBright"
];

function randomColor() {
  return colors[Math.floor(Math.random() * colors.length - 1) + 1];
}

cli.option(
  "-w, --workspaces <glob>",
  "Filters or finds workspaces that match the specified pattern."
);
cli
  .command("get")
  .description("Returns the available workspaces.")
  .action(async () => {
    for (const ws of await findWorkspaces(cli.workspaces)) {
      console.log(ws);
    }
  });
cli
  .command("run <cmd> [args...]")
  .description("Runs <cmd> in each workspace and passes in <options>.")
  .action(async (cmd, args) => {
    const cmds = [];
    for (const ws of await findWorkspaces(cli.workspaces)) {
      cmds.push({
        command: `cd ${ws} && ${cmd} ${args.join(" ")}`,
        name: ws,
        prefixColor: `${randomColor()}.inverse.bold`
      });
    }
    if (cmds.length) {
      concurrently(cmds);
    }
  });

cli.parse(process.argv);
