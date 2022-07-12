/* eslint-disable */
const withAntdLess = require("next-plugin-antd-less");
const lessToJS = require("less-vars-to-js");
const fs = require("fs");
const path = require("path");
const { withSentryConfig } = require("@sentry/nextjs");

// Where your antd-custom.less file lives
const themeVariables = lessToJS(
  fs.readFileSync(path.resolve(__dirname, "./assets/antd-custom.less"), "utf8")
);

const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, org, project, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore

  silent: true, // Suppresses all logs
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
};

module.exports = withSentryConfig(
  withAntdLess({
    eslint: { ignoreDuringBuilds: true },
    modifyVars: themeVariables,
    publicRuntimeConfig: { themeVariables },
    webpack: (config) => {
      config.resolve.modules.push(path.resolve("./"));
      config.resolve.alias["mapbox-gl"] = "maplibre-gl";
      return config;
    },
    i18n: {
      locales: ["en", "fr", "es"],
      defaultLocale: "en",
    },
    async redirects() {
      return [
        {
          source: "/co2-forecast",
          destination: "/co2-forecast/-",
          permanent: false,
        },
      ];
    },
    typescript: {
      ignoreBuildErrors: true,
    },
  }),
  sentryWebpackPluginOptions
);
