const cosmiconfig = require("cosmiconfig");
const fs = require("fs-extra");
const globby = require("globby");
const minimatch = require("minimatch");

// Returns the file contenst if it exists or null if not.
async function read(file) {
  return (await fs.exists(file)) ? await fs.readJson(file) : null;
}

// Expands the workspace globs into relative directory paths.
async function expandWorkspaces(wsGlobs) {
  return await globby(wsGlobs, {
    expandDirectories: false,
    onlyDirectories: true
  });
}

// Filters workspaces that match the specified pattern.
async function filterWorkspaces(pattern) {
  const wsGlobs = await getWorkspaces();
  const wsPaths = await expandWorkspaces(wsGlobs);
  return pattern ? minimatch.match(wsPaths, pattern) : wsPaths;
}

// Finds workspaces that match the given pattern. If no workspaces are defined, the pattern is used to glob for directories.
async function findWorkspaces(pattern) {
  const wsGlobs = await getWorkspaces();
  return wsGlobs ? filterWorkspaces(pattern) : expandWorkspaces(pattern || ".");
}

// Returns an array of the defined workspaces or null if none are specified.
async function getWorkspaces() {
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
  expandWorkspaces,
  filterWorkspaces,
  findWorkspaces,
  getWorkspaces
};
