import nextTypescript from "eslint-config-next/typescript";

const featureNames = [
  "account",
  "authentication",
  "cart",
  "checkout",
  "collections",
  "currency",
  "orders",
  "pricing",
  "products",
  "search",
];

function privateFeatureImportPattern(owner) {
  const ownerExclusion = owner ? `(?!${owner}/)` : "";
  return {
    regex: `^@/features/${ownerExclusion}[^/]+/(?:components|routes)/`,
    message: "Import another feature through a top-level public module instead of its internal components or routes.",
  };
}

const eslintConfig = [
  ...nextTypescript,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  ...featureNames.map((feature) => ({
    files: [`src/features/${feature}/**/*.{ts,tsx}`],
    rules: {
      "no-restricted-imports": ["error", {patterns: [
        privateFeatureImportPattern(feature),
        {
          regex: "^@/site(?:/|$)",
          message: "Features must not import from the site composition layer. Move shared configuration or behavior to a lower-level module.",
        },
      ]}],
    },
  })),
  {
    files: ["src/site/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", {patterns: [privateFeatureImportPattern()]}],
    },
  },
  {
    files: ["src/platform/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", {patterns: [{
        regex: "^@/(?:features|site)(?:/|$)",
        message: "Platform modules must not depend on feature or site composition modules.",
      }]}],
    },
  },
];

export default eslintConfig;
