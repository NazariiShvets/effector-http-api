module.exports = {
  extends: [
    "eslint:recommended",

    "plugin:effector/recommended",
    "plugin:effector/scope",

    "prettier",

    "plugin:json/recommended",
  ],

  ignorePatterns: ["*.js"],

  plugins: [
    "@typescript-eslint",
    "react",
    "prettier",
    "effector",
    "import",
    "unused-imports",
  ],

  parser: "@typescript-eslint/parser",

  parserOptions: {
    ecmaVersion: 2018,

    sourceType: "module",

    project: "./tsconfig.json",

    ecmaFeatures: {
      jsx: true,
    },
  },

  settings: {
    react: {
      version: "detect",
    },
  },

  globals: {
    NodeJS: true,
  },

  env: {
    browser: true,
    node: true,
  },

  overrides: [{ files: ["src/**/*.{ts,tsx}"] }],

  rules: {
    // disable
    "no-useless-escape": "off",
    "no-extra-boolean-cast": "off",
    "react-hooks/exhaustive-deps": "off",
    "no-redeclare": "off",
    "no-undef": "off",

    "dot-notation": "warn",
    "valid-typeof": "warn",
    "no-implicit-globals": "error",
    "no-lonely-if": "error",
    "no-nested-ternary": "error",
    "no-proto": "error",
    "no-return-assign": "error",
    "no-script-url": "error",
    "no-undef-init": "error",
    "no-unneeded-ternary": "error",
    "no-var": "error",
    "no-useless-rename": "error",
    "no-useless-catch": "error",
    "no-useless-computed-key": "error",
    "no-useless-concat": "error",
    "no-useless-constructor": "error",
    "prefer-arrow-callback": "error",
    "prefer-template": "error",
    "eol-last": ["error", "always"],

    "comma-dangle": ["error", "never"],
    "operator-assignment": ["error", "always"],
    "arrow-body-style": ["warn", "as-needed"],
    "jsx-quotes": ["warn", "prefer-single"],

    "use-isnan": ["error", { enforceForSwitchCase: true }],

    "padding-line-between-statements": [
      "error",

      {
        blankLine: "any",
        prev: "import",
        next: "import",
      },

      {
        blankLine: "always",
        prev: "*",
        next: "block",
      },

      {
        blankLine: "always",
        prev: "*",
        next: "block-like",
      },

      {
        blankLine: "never",
        prev: "export",
        next: "export",
      },

      {
        blankLine: "always",
        prev: "*",
        next: "block-like",
      },

      {
        blankLine: "always",
        prev: "*",
        next: "function",
      },

      {
        blankLine: "always",
        prev: "function",
        next: "*",
      },

      {
        blankLine: "always",
        prev: "const",
        next: "let",
      },

      {
        blankLine: "always",
        prev: "let",
        next: "const",
      },

      {
        blankLine: "always",
        prev: "const",
        next: "let",
      },

      {
        blankLine: "always",
        prev: "*",
        next: "return",
      },

      {
        blankLine: "always",
        prev: "*",
        next: "try",
      },

      {
        blankLine: "always",
        prev: "try",
        next: "*",
      },

      {
        blankLine: "always",
        prev: "*",
        next: "switch",
      },

      {
        blankLine: "always",
        prev: "switch",
        next: "*",
      },

      {
        blankLine: "always",
        prev: "*",
        next: "while",
      },

      {
        blankLine: "always",
        prev: "while",
        next: "*",
      },

      {
        blankLine: "always",
        prev: "*",
        next: "for",
      },

      {
        blankLine: "always",
        prev: "for",
        next: "*",
      },
    ],

    "import/no-internal-modules": "off",
    "import/group-exports": "error",
    "import/exports-last": "error",
    "import/export": "error",
    "import/no-deprecated": "error",

    "unused-imports/no-unused-imports": "error",

    "prettier/prettier": ["warn", { usePrettierrc: true }],

    "@typescript-eslint/no-for-in-array": "error",
    "@typescript-eslint/no-inferrable-types": "error",
    "@typescript-eslint/no-meaningless-void-operator": "error",
    "@typescript-eslint/no-misused-new": "error",
    "@typescript-eslint/no-misused-promises": "error",
    "@typescript-eslint/no-non-null-asserted-nullish-coalescing": "error",
    "@typescript-eslint/no-non-null-asserted-optional-chain": "error",
    "@typescript-eslint/no-non-null-assertion": "error",
    "@typescript-eslint/no-redundant-type-constituents": "error",
    "@typescript-eslint/no-require-imports": "error",
    "@typescript-eslint/no-this-alias": "error",
    "@typescript-eslint/no-unnecessary-boolean-literal-compare": "error",
    "@typescript-eslint/no-unnecessary-qualifier": "error",
    "@typescript-eslint/no-unnecessary-type-arguments": "error",
    "@typescript-eslint/no-unnecessary-type-assertion": "error",
    "@typescript-eslint/no-unnecessary-type-constraint": "error",

    "@typescript-eslint/await-thenable": "error",
    "@typescript-eslint/no-useless-empty-export": "error",
    "@typescript-eslint/no-var-requires": "error",
    "@typescript-eslint/prefer-as-const": "error",
    "@typescript-eslint/prefer-enum-initializers": "error",
    "@typescript-eslint/prefer-for-of": "error",
    "@typescript-eslint/prefer-includes": "error",
    "@typescript-eslint/prefer-nullish-coalescing": "error",
    "@typescript-eslint/prefer-optional-chain": "error",
    "@typescript-eslint/prefer-readonly": "error",
    "@typescript-eslint/prefer-reduce-type-parameter": "error",
    "@typescript-eslint/prefer-string-starts-ends-with": "error",
    "@typescript-eslint/prefer-ts-expect-error": "error",
    "@typescript-eslint/promise-function-async": "error",
    "@typescript-eslint/require-array-sort-compare": "error",
    "@typescript-eslint/restrict-plus-operands": "error",
    "@typescript-eslint/switch-exhaustiveness-check": "error",
    "@typescript-eslint/unified-signatures": "error",
    "@typescript-eslint/return-await": "error",
    "@typescript-eslint/consistent-type-exports": "error",
    "@typescript-eslint/no-redeclare": "error",
    "@typescript-eslint/adjacent-overload-signatures": "error",
    "@typescript-eslint/no-base-to-string": "error",
    "@typescript-eslint/no-confusing-non-null-assertion": "error",
    "@typescript-eslint/no-extra-non-null-assertion": "error",
    "@typescript-eslint/brace-style": ["error", "1tbs"],
    "@typescript-eslint/lines-between-class-members": ["error", "always"],
    "@typescript-eslint/method-signature-style": ["error", "property"],
    "@typescript-eslint/class-literal-property-style": ["error", "fields"],
    "@typescript-eslint/consistent-type-definitions": ["error", "type"],

    "@typescript-eslint/unbound-method": ["error", { ignoreStatic: true }],

    "@typescript-eslint/prefer-literal-enum-member": [
      "error",
      { allowBitwiseExpressions: true },
    ],

    "@typescript-eslint/array-type": [
      "error",
      { default: "array", readonly: "array" },
    ],

    "@typescript-eslint/consistent-type-imports": [
      "error",
      {
        prefer: "type-imports",
        disallowTypeAnnotations: true,
      },
    ],

    "@typescript-eslint/explicit-member-accessibility": [
      "error",
      {
        accessibility: "explicit",
      },
    ],

    "@typescript-eslint/no-empty-interface": [
      "error",
      {
        allowSingleExtends: true,
      },
    ],

    "@typescript-eslint/no-extraneous-class": [
      "error",
      {
        allowConstructorOnly: true,
        allowWithDecorator: true,
      },
    ],

    "@typescript-eslint/member-ordering": [
      "error",
      {
        default: [
          "private-static-field",
          "protected-static-field",
          "public-static-field",
          "private-static-method",
          "protected-static-method",
          "public-static-method",
          "private-constructor",
          "protected-constructor",
          "public-constructor",
          "private-instance-field",
          "protected-instance-field",
          "public-instance-field",
          "private-instance-method",
          "protected-instance-method",
          "public-instance-method",
        ],
      },
    ],

    "@typescript-eslint/ban-ts-comment": [
      "error",

      {
        "ts-expect-error": "allow-with-description",
        "ts-ignore": "allow-with-description",
        "ts-nocheck": "allow-with-description",
        "ts-check": "allow-with-description",
        minimumDescriptionLength: 5,
      },
    ],

    "@typescript-eslint/naming-convention": [
      "error",
      {
        selector: "variable",
        format: [
          "camelCase",
          "strictCamelCase",
          "PascalCase",
          "StrictPascalCase",
          "UPPER_CASE",
        ],
        leadingUnderscore: "allow",
        trailingUnderscore: "allow",
      },
    ],

    "react/display-name": "off",
    "react/no-array-index-key": "error",
    "react/no-danger-with-children": "error",
    "react/no-deprecated": "error",
    "react/no-find-dom-node": "error",
    "react/no-invalid-html-attribute": "error",
    "react/forbid-foreign-prop-types": "error",
    "react/no-render-return-value": "error",
    "react/no-string-refs": "error",
    "react/no-this-in-sfc": "error",
    "react/no-unescaped-entities": "error",
    "react/no-unknown-property": "error",
    "react/no-namespace": "error",
    "react/no-unstable-nested-components": "error",
    "react/no-unused-prop-types": "error",
    "react/prefer-stateless-function": "error",
    "react/self-closing-comp": "error",
    "react/style-prop-object": "error",
    "react/void-dom-elements-no-children": "error",
    "react/jsx-closing-tag-location": "error",
    "react/jsx-pascal-case": "error",
    "react/jsx-key": "error",
    "react/jsx-newline": "error",
    "react/jsx-no-constructed-context-values": "error",
    "react/jsx-no-duplicate-props": "error",
    "react/jsx-no-script-url": "error",
    "react/jsx-no-target-blank": "error",
    "react/jsx-fragments": ["error", "syntax"],
    "react/jsx-curly-brace-presence": ["error", "never"],
    "react/jsx-boolean-value": ["error", "never"],
    "react/destructuring-assignment": ["error", "always"],

    "react/jsx-no-useless-fragment": ["error", { allowExpressions: true }],
    "react/jsx-max-depth": ["error", { max: 7 }],
    "react/no-children-prop": ["error", { allowFunctions: true }],

    "react/function-component-definition": [
      "error",
      {
        namedComponents: "arrow-function",
        unnamedComponents: "arrow-function",
      },
    ],

    "react/jsx-handler-names": [
      "error",
      {
        eventHandlerPrefix: "on",
        eventHandlerPropPrefix: "on",
        checkLocalVariables: true,
        checkInlineFunction: true,
      },
    ],
  },
};
