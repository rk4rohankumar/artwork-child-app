const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const { dependencies } = require('./package.json');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // 'auto' lets remoteEntry.js resolve its own chunks from wherever it is
      // served; dev keeps CRA's '/' so `craco start` works locally.
      if (process.env.NODE_ENV === 'production') {
        webpackConfig.output.publicPath = 'auto';
      }

      webpackConfig.plugins.push(
        new ModuleFederationPlugin({
          name: 'ArtworkApp',
          filename: 'remoteEntry.js',
          exposes: {
            './ArtworkApp': './src/App',
          },
          shared: {
            react: { singleton: true, requiredVersion: dependencies.react },
            'react-dom': { singleton: true, requiredVersion: dependencies['react-dom'] },
            'framer-motion': { singleton: true, requiredVersion: dependencies['framer-motion'] },
            axios: { singleton: true, requiredVersion: dependencies.axios },
          },
        })
      );
      return webpackConfig;
    },
  },
};
