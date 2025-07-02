module.exports = function override(config, env) {
  config.ignoreWarnings = [
    ...(config.ignoreWarnings || []),
    {
      module: /shaka-player[\\/]dist[\\/]shaka-player\.compiled\.js/,
      message: /Failed to parse source map/,
    },
  ];
  return config;
};