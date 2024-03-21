const { join, sep, normalize } = require('path');
const { createHash } = require('crypto');
const { copyFileSync, existsSync, mkdirSync, readFileSync } = require('fs');
const Module = require('module');
const { tmpdir } = require('os');

const nxPackages = [
  '@nx/nx-android-arm64',
  '@nx/nx-android-arm-eabi',
  '@nx/nx-win32-x64-msvc',
  '@nx/nx-win32-ia32-msvc',
  '@nx/nx-win32-arm64-msvc',
  '@nx/nx-darwin-universal',
  '@nx/nx-darwin-x64',
  '@nx/nx-darwin-arm64',
  '@nx/nx-freebsd-x64',
  '@nx/nx-linux-x64-musl',
  '@nx/nx-linux-x64-gnu',
  '@nx/nx-linux-arm64-musl',
  '@nx/nx-linux-arm64-gnu',
  '@nx/nx-linux-arm-gnueabihf',
];

const localNodeFiles = [
  'nx.android-arm64.node',
  'nx.android-arm-eabi.node',
  'nx.win32-x64-msvc.node',
  'nx.win32-ia32-msvc.node',
  'nx.win32-arm64-msvc.node',
  'nx.darwin-universal.node',
  'nx.darwin-x64.node',
  'nx.darwin-arm64.node',
  'nx.freebsd-x64.node',
  'nx.linux-x64-musl.node',
  'nx.linux-x64-gnu.node',
  'nx.linux-arm64-musl.node',
  'nx.linux-arm64-gnu.node',
  'nx.linux-arm-gnueabihf.node',
];

const originalLoad = Module._load;

Module._load = function (request, parent, isMain) {
  const modulePath = request;
  if (
    nxPackages.includes(modulePath) ||
    localNodeFiles.some((f) => modulePath.endsWith(f))
  ) {
    const nativeLocation = require.resolve(modulePath);
    const fileName = normalize(nativeLocation).split(sep).pop();
    const fileContents = readFileSync(nativeLocation, 'utf8');
    const hash = createHash('md5')
      .update(nativeLocation + fileContents)
      .digest('hex');
    const tmpFolder = join(tmpdir(), 'nx-native-cache');
    const tmpFile = join(tmpFolder, hash + '-' + fileName);
    if (existsSync(tmpFile)) {
      console.log('file already exists @', tmpFile);
      return originalLoad.apply(this, [tmpFile, parent, isMain]);
    }
    if (!existsSync(tmpFolder)) {
      mkdirSync(tmpFolder);
    }
    copyFileSync(nativeLocation, tmpFile);
    console.log('copied sucessfully, loading from', tmpFile);
    return originalLoad.apply(this, [tmpFile, parent, isMain]);
  } else {
    return originalLoad.apply(this, arguments);
  }
};

const indexModulePath = require.resolve('./');
delete require.cache[indexModulePath];
const indexModule = require('./');
module.exports = indexModule;
Module._load = originalLoad;
