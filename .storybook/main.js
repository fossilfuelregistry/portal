const path = require("path");
const lessToJS = require("less-vars-to-js");
const fs = require("fs");

const file = fs.readFileSync(path.join(__dirname, "..", "assets", "new-antd-custom.less"), {"encoding": "utf8"})
const themeVariables = lessToJS(file, {stripPrefix: true, resolveVariables: true,});

console.log({themeVariables})

module.exports = {
  stories: [
    "../**/stories.@(js|jsx|ts|tsx)",
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
        test: /\.less$/i,
        use: [
          "style-loader",
          "css-loader",
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                javascriptEnabled: true,
                modifyVars: themeVariables
              }
            }
          }
        ],
    })

    config.resolve.modules = [
      ...config.resolve.modules,
      path.resolve(__dirname, "../"),
      "node_modules",
    ];

    return config;
  },
};
