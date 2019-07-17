const {
  filterByPackageName,
  filterByPackageScript,
  filterByPath,
  getWorkspaces,
  getWorkspacesPatterns
} = require(".");
const fs = require("fs-extra");

afterEach(async () => {
  await fs.remove(".boltrc");
  await fs.remove(".workspacesrc");
  await fs.remove("lerna.json");
});

test("filterByPackageName()", () => {
  const wx = [{ package: { name: "name1" } }, { package: { name: "name2" } }];
  expect(wx.filter(filterByPackageName("name"))).toMatchObject([]);
  expect(wx.filter(filterByPackageName("name*"))).toMatchObject(wx);
  expect(wx.filter(filterByPackageName("name2"))).toMatchObject([wx[1]]);
});

test("filterByPath", () => {
  const wx = [{ path: "name1" }, { path: "name2" }];
  expect(wx.filter(filterByPath("name"))).toMatchObject([]);
  expect(wx.filter(filterByPath("name*"))).toMatchObject(wx);
  expect(wx.filter(filterByPath("name2"))).toMatchObject([wx[1]]);
});

test("filterByPackageScript", () => {
  const wx = [
    { package: { scripts: { name1: "ls" } } },
    { package: { scripts: { name2: "ls" } } }
  ];
  expect(wx.filter(filterByPackageScript("name"))).toMatchObject([]);
  expect(wx.filter(filterByPackageScript("name1"))).toMatchObject([wx[0]]);
  expect(wx.filter(filterByPackageScript("name2"))).toMatchObject([wx[1]]);
});

test("getWorkspacesPatterns() returns workspaces", async () => {
  await fs.outputFile(".workspacesrc", '["workspaces"]');
  expect(await getWorkspacesPatterns()).toEqual(["workspaces"]);
});

test("getWorkspacesPatterns() returns workspaces.packages", async () => {
  await fs.outputFile(".workspacesrc", '{ "packages": ["workspaces"] }');
  expect(await getWorkspacesPatterns()).toEqual(["workspaces"]);
});

test("getWorkspacesPatterns() returns bolt.workspaces", async () => {
  await fs.outputFile(".boltrc", '{ "workspaces": ["bolt"] }');
  expect(await getWorkspacesPatterns()).toEqual(["bolt"]);
});

test("getWorkspacesPatterns() returns lerna.packages", async () => {
  await fs.outputFile("lerna.json", '{ "packages": ["lerna"] }');
  expect(await getWorkspacesPatterns()).toEqual(["lerna"]);
});

test("getWorkspacesPatterns() prefers workspaces -> lerna -> bolt", async () => {
  await fs.outputFile(".workspacesrc", '["workspaces"]');
  await fs.outputFile(".boltrc", '{ "workspaces": ["bolt"] }');
  await fs.outputFile("lerna.json", '{ "packages": ["lerna"] }');
  expect(await getWorkspacesPatterns()).toEqual(["workspaces"]);

  await fs.remove(".workspacesrc");
  expect(await getWorkspacesPatterns()).toEqual(["lerna"]);

  await fs.remove("lerna.json");
  expect(await getWorkspacesPatterns()).toEqual(["bolt"]);

  await fs.remove(".boltrc");
  expect(await getWorkspacesPatterns()).toEqual(null);
});

test("getWorkspaces()", async () => {
  expect(await getWorkspaces([".git", "node_modules/fs-extra"])).toMatchObject([
    { path: ".git", package: null },
    { path: "node_modules/fs-extra", package: { name: "fs-extra" } }
  ]);
});
