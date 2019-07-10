#! /usr/bin/env node

const cli = require("commander");
const execa = require("execa");
const listr = require("listr");
const path = require("path");
const { findWorkspaces } = require(".");

async function run(cmd, workspaces) {
  const concurrency = parseFloat(cli.concurrency);
  const list = new listr(
    workspaces.map(ws => ({
      title: ws,
      task: async () => {
        const exec = execa.command(cmd, { cwd: ws });
        return exec.stdout;
      }
    })),
    {
      concurrent: concurrency || true,
      exitOnError: false
    }
  );
  list.run().catch(console.error);
}

cli.option(
  "-c, --concurrency <number>",
  "The number of tasks to run at any given time."
);
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
