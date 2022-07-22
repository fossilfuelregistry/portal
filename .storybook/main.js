const path = require("path");

module.exports = {
  stories: [
    "../**/stories.@(js|jsx|ts|tsx)",
    // "../**/stories.@(js|jsx|ts|tsx)",
    //"../**/*.stories.mdx",
    //"../**/*.stories.@(js|jsx|ts|tsx)",
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
  ],
  framework: "@storybook/react",
  core: {
    builder: "@storybook/builder-webpack5",
  },
  webpackFinal: async (config) => {
    config.module.rules.push({
      test: /.*\.(?:le|c)ss$/,
      use: [
        "style-loader",
        {
          loader: "css-loader",
          options: {
            modules: false,
          },
        },
        {
          loader: "less-loader",
          options: {
            lessOptions: {
              javascriptEnabled: true,
            },
          },
        },
      ],
    });

    config.resolve.modules = [path.resolve(__dirname, "../"), "node_modules"];

    return config;
  },
};
