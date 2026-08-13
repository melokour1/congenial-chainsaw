module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Reanimated v4 extracted its worklets machinery into react-native-worklets;
    // the old react-native-reanimated/plugin path silently no-ops now. This must
    // always be listed last.
    plugins: ['react-native-worklets/plugin'],
  };
};
