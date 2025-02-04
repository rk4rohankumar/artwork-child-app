const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.output.publicPath = 'http://localhost:3002/';

      webpackConfig.plugins.push(
        new ModuleFederationPlugin({
          name: 'ArtworkApp',
          filename: 'remoteEntry.js',
          exposes: {
            './ArtworkApp': './src/App',
          },
          shared: {
            react: { eager: true },
            'react-dom': { eager: true },
            'tailwindcss': { eager: true }
          },
        })
      );
      return webpackConfig;
    },
  },
};
