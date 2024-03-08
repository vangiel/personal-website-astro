const postcssGlobalData = require("@csstools/postcss-global-data");
const autoprefixer = require("autoprefixer");
const postcssPresetEnv = require("postcss-preset-env");
const csso = require("postcss-csso");

module.exports = {
	plugins: [
		postcssGlobalData({
			files: ["./src/styles/global-variables.css"],
		}),
		postcssPresetEnv({
			stage: 3,
			features: {
				"nesting-rules": true,
				"custom-media-queries": true,
				"media-query-ranges": true,
			},
		}),
		autoprefixer(),
		csso(),
	],
};
