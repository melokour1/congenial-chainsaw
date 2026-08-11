// Expo + npm-workspaces monorepo Metro config.
// Ref: https://docs.expo.dev/guides/monorepos/
//
// apps/mobile depends on the workspace-hoisted packages @laxvaletcare/shared
// and @laxvaletcare/config (packages/shared, packages/config — plain TS, no
// build step). For Metro to resolve + transpile them it needs to:
//   1. watch the monorepo root (so file changes in packages/* trigger reloads
//      and so Metro's resolver can even see files outside apps/mobile), and
//   2. look up node_modules in both this app's own node_modules AND the
//      workspace root's node_modules (npm workspaces hoists shared deps like
//      react to the root, and symlinks @laxvaletcare/* into the root too).
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..', '..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files in the monorepo (not just apps/mobile), on top of
//    whatever getDefaultConfig() already watches.
config.watchFolders = [...(config.watchFolders ?? []), workspaceRoot];

// 2. Resolve node_modules from both this project and the workspace root.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Keep Metro's normal node_modules-nearest-wins resolution behavior in
// addition to the extra search paths above (needed so nested/duplicate
// deps inside apps/mobile/node_modules still take precedence there).
config.resolver.disableHierarchicalLookup = false;

module.exports = config;
