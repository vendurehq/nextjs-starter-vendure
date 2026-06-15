import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextTypescript,
  {
    files: [
      "src/components/**/*.{ts,tsx}",
      "src/storefront/**/*.{ts,tsx}",
      "src/lib/commerce/**/*.{ts,tsx}",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/app/**"],
              message:
                "Shared commerce and storefront code must not import from route folders. Move reusable code into src/components, src/lib, or src/storefront.",
            },
          ],
        },
      ],
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
