process.env.ESLINT_TSCONFIG = "tsconfig.json"

/**
 * @type {import("eslint").Linter.Config}
 */

module.exports = {
	extends: ["plugin:astro/recommended"],
	parser: "@typescript-eslint/parser",
	parserOptions: {
		tsconfigRootDir: __dirname,
		sourceType: "module",
		ecmaVersion: "latest",
	},
	overrides: [
		{
			files: ["*.astro"],
			parser: "astro-eslint-parser",
			parserOptions: {
				parser: "@typescript-eslint/parser",
				extraFileExtensions: [".astro"],
			},
			rules: {
				"eol-last": "off",
				"jsx-quotes": ["warn", "prefer-double"],
				"quotes": ["warn", "double"],
				"semi": ["warn", "always"],
				"@stylistic/js/no-tabs": "off",
				"@stylistic/ts/indent": "off",
				"no-constant-binary-expression": "warn",
				"no-debugger": "warn",
				"no-extend-native": "off",
				"no-trailing-spaces": "warn",
				"space-before-function-paren": "off",
				"antfu/if-newline": "off",
				"antfu/top-level-function": "off",
				"@stylistic/js/operator-linebreak": "off",
				"@stylistic/ts/brace-style": "off",
				"@stylistic/js/multiline-ternary": "off",
				"n/prefer-global/process": "off",
				"@stylistic/js/no-mixed-spaces-and-tabs": "off",
				"no-unused-vars": "off",
				"@typescript-eslint/no-unused-vars": "off",
				"unused-imports/no-unused-imports": "off",
				"object-curly-newline": [
					"warn",
					{
						consistent: true,
						multiline: true,
					},
				],
				"object-curly-spacing": ["warn", "always"],
				"array-element-newline": ["warn", "consistent"],
				"array-bracket-newline": ["warn", "consistent"],
			},
		},
	],
}
