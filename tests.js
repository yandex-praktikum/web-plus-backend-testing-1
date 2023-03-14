const {readFileSync} = require('fs');
const {join} = require('path');
const {promisify} = require('util');
const exec = promisify(require('child_process').exec);

async function test() {
  const errors = [];

  const originalConfig = `{"$schema":"./node_modules/@stryker-mutator/core/schema/stryker-schema.json","_comment":"Thisconfigwasgeneratedusing'strykerinit'.Pleasetakealookat:https://stryker-mutator.io/docs/stryker-js/configuration/formoreinformation","packageManager":"npm","plugins":["@stryker-mutator/jest-runner"],"reporters":["html","clear-text","json"],"testRunner":"jest","jest":{"projectType":"custom","configFile":"./jest.config.json"},"coverageAnalysis":"perTest","mutate":["./src/posts.service.ts"],"thresholds":{"break":100},"concurrency":2,"mutator":{"excludedMutations":["UpdateOperator","ArrayDeclaration"]}}`;
  const config = readFileSync(join(__dirname, 'stryker.conf.json'), 'utf-8').replace(/[\n\r]/g, '').replace(/\s/g, '');

  if(config !== originalConfig) {
    throw new Error(`Не исправляйте и не удаляйте файл stryker.conf.json`)
  }

  try {
    await exec('stryker run');
  } catch(error) {
    let message = `Тесты завершились с ошибкой: ${error.message}`;
    message += error.stdout ? `\nЛоги тестов: ${error.stdout}` : '';
    message += error.stderr ? `\nКритические ошибки: ${error.stderr}` : '';
    console.log(message);
    process.exit(1);
  }

  const mutationsErrors = JSON.parse(readFileSync(join(__dirname, 'mutations-errors.json'), 'utf-8'));
  const mutation = JSON.parse(readFileSync(join(__dirname, 'reports', 'mutation', 'mutation.json'), 'utf-8'));
  const error = mutation.files['src/posts.service.ts'].mutants.find(({ status }) => status === 'Survived');

  if(error) {
    const { error: messageError } = mutationsErrors.find(({ id }) => id === error.id);
    errors.push(messageError);
    throw new Error(errors.join('\n'))
  } else {
    console.log("Тесты пройдены");
  }
}

test();
