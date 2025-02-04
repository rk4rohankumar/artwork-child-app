const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.output.publicPath = 'https://artwork-child-app.vercel.app/';

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
