#! /usr/bin/env node

const chalk = require("chalk");
const cli = require("commander");
const concurrently = require("concurrently");
const path = require("path");
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

async function run(cmd, workspaces) {
  const cmds = [];
  for (const ws of workspaces) {
    cmds.push({
      // The "echo" is so that the command we run doesn't hang if listening
      // for stdin.
      command: `cd ${ws} && echo "" | ${cmd}`,
      name: ws,
      prefixColor: `${randomColor()}.inverse.bold`
    });
  }
  if (cmds.length) {
    try {
      await concurrently(cmds);
    } catch (e) {
      console.error(e);
    }
  }
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
    await run(`${cmd} ${args.join(" ")}`, await findWorkspaces(cli.workspaces));
  });
cli
  .command("npm <cmd> [args...]")
  .description("Runs the specified npm commands, if they exist.")
  .action(async (cmd, args) => {
    const filteredWorkspaces = [];

    for (const ws of await findWorkspaces(cli.workspaces)) {
      let pkg;
      try {
        pkg = require(path.resolve(ws, "package.json"));
      } catch (e) {
        continue;
      }

      if (!pkg.scripts || !pkg.scripts[cmd]) {
        continue;
      }

      filteredWorkspaces.push(ws);
    }

    await run(`npm run ${cmd} ${args.join(" ")}`, filteredWorkspaces);
  });

cli.parse(process.argv);
