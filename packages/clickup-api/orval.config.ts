import { defineConfig } from 'orval';

export default defineConfig({
  clickup: {
    input: {
      target: './openapi/clickup-api-v2-reference.json',
    },
    output: {
      mode: 'single',
      target: './src/generated/api.ts',
      client: 'axios-functions',
      clean: true,
      prettier: false,
      baseUrl: 'https://api.clickup.com/api',
      override: {
        mutator: {
          path: './src/client.ts',
          name: 'customAxiosInstance',
        },
      },
    },
  },
});
