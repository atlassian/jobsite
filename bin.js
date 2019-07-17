#! /usr/bin/env node

const cli = require("commander");
const execa = require("execa");
const listr = require("listr");
const path = require("path");
const {
  filterByPackageName,
  filterByPackageScript,
  filterByPath,
  getWorkspaces
} = require(".");

function filterByPackageNameOrPath(cli) {
  return cli.packages
    ? filterByPackageName(cli.packages)
    : filterByPath(cli.workspaces);
}

async function getFilteredWorkspaces(cli) {
  return (await getWorkspaces()).filter(filterByPackageNameOrPath(cli));
}

async function run(cmd, wx) {
  const concurrency = parseFloat(cli.concurrency);
  const list = new listr(
    wx.map(ws => ({
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
  "-c, --concurrency [number]",
  "The number of tasks to run at any given time. If true, then as many threads as possible are used."
);
cli.option(
  "-p, --packages [glob]",
  "Filters or finds workspaces that have a package.json and name that match the specified glob. If true, then it operates on all packages that have a name."
);
cli.option(
  "-w, --workspaces <glob>",
  "Filters or finds workspaces that have a path that match the specified glob."
);
cli
  .command("get")
  .description("Returns the available workspaces.")
  .action(async cmd => {
    (await getFilteredWorkspaces(cli)).forEach(ws => {
      console.log(cli.packages ? ws.package.name : ws.path);
    });
  });
cli
  .command("run <cmd> [args...]")
  .description("Runs <cmd> in each workspace and passes in <options>.")
  .action(async (cmd, args) => {
    await run(`${cmd} ${args.join(" ")}`, await getFilteredWorkspaces(cli));
  });
cli
  .command("npm <cmd> [args...]")
  .description("Runs the specified npm commands, if they exist.")
  .action(async (cmd, args) => {
    await run(
      `npm run ${cmd} ${args.join(" ")}`,
      (await getFilteredWorkspaces(cli)).filter(filterByPackageScript(cmd))
    );
  });

cli.parse(process.argv);
