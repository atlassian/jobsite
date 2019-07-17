const cosmiconfig = require("cosmiconfig");
const fs = require("fs-extra");
const globby = require("globby");
const path = require("path");
const minimatch = require("minimatch");

async function read(...paths) {
  const file = path.join(...paths);
  return (await fs.exists(file)) ? await fs.readJson(file) : null;
}

async function getWorkspaces(px) {
  px = px || (await getWorkspacesPatterns());

  if (!px) {
    return [];
  }

  const wx = await globby(px, {
    expandDirectories: false,
    onlyDirectories: true
  });

  return Promise.all(
    wx.map(async ws => {
      return {
        path: ws,
        package: await read(ws, "package.json")
      };
    })
  );
}

function filterByPackageName(glob) {
  return ws => {
    if (!glob || glob === true) {
      return true;
    }
    if (!ws.package || !ws.package.name) {
      return false;
    }
    return minimatch(ws.package.name, glob);
  };
}

function filterByPackageScript(script) {
  return ws => {
    return ws.package && ws.package.scripts && ws.package.scripts[script];
  };
}

function filterByPath(glob) {
  return ws => {
    if (!glob || glob === true) {
      return true;
    }
    return minimatch(ws.path, glob);
  };
}

async function getWorkspacesPatterns() {
  let search;
  if ((search = await cosmiconfig("workspaces").search())) {
    return Array.isArray(search.config)
      ? search.config
      : search.config.packages;
  }
  if ((search = await read("lerna.json"))) {
    return search.packages;
  }
  if ((search = await cosmiconfig("bolt").search())) {
    return search.config.workspaces;
  }
  return null;
}

module.exports = {
  filterByPackageName,
  filterByPackageScript,
  filterByPath,
  getWorkspaces,
  getWorkspacesPatterns
};
