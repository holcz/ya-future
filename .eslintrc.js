module.exports = {
	"plugins": [
		"@typescript-eslint",
		"unused-imports",
	  ],
	  "extends": [
		"plugin:@typescript-eslint/recommended",
		"prettier"
	  ],
	overrides: [
		{
			files: ['*.ts', '*.tsx'],
			parserOptions: {
				project: ['./tsconfig.json'],
			},
		},
	],
}
