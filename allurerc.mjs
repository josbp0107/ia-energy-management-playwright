import { defineConfig } from 'allure';

export default defineConfig({
  name: 'IA Energy Management - E2E',
  output: './allure-report',
  plugins: {
    awesome: {
      options: {
        singleFile: true,
        groupBy: ['parentSuite', 'suite', 'subSuite'],
      },
    },
  },
});
