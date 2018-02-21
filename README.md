# CodeClippy Portal - UI

## Getting Started

We use [yarn](https://yarnpkg.com/en/) (rather than `npm`) as our package manager. Install `yarn` with `brew install yarn`.

Run `cd client && yarn install` to set up your `node_modules`.

To run locally (with hot module replacement!), simply run `yarn start`.

## Deployment

We host our UI as a static website on S3. Both https://www.staging.app.codeclippy.com/ and https://www.app.codeclippy.com/.

Before deploying, ensure that the `package.json` entry for `config`, namely `stagingcdn` or `productioncdn`, is
set to the appropriate s3 bucket endpoint.

Generally, use existing CircleCI workflows to deploy staging/production builds. If you need to do a manual deploy:

Staging: `yarn build-staging`
Production: `yarn build`

The output build files will be placed in `build/`.

Do not commit these built files. Upload them to S3. Note that the bucket names must be set equal to the domain to make DNS work correctly:

Staging: `aws s3 rm s3://staging.app.codeclippy.com/ --recursive && aws s3 cp build/ s3://staging.app.codeclippy.com/ --recursive`
Production: `aws s3 rm s3://app.codeclippy.com/ --recursive && aws s3 cp build/ s3://app.codeclippy.com/ --recursive`

[HTTPS Configuration Reference](https://medium.com/@sbuckpesch/setup-aws-s3-static-website-hosting-using-ssl-acm-34d41d32e394)

## .env file management

[Parcel.js commit](https://github.com/parcel-bundler/parcel/pull/258/files/bb4f1e62b4948c59983a730262d6938497e4c365) that added dotenv support

[Breakdown](https://github.com/bkeepers/dotenv#what-other-env-files-can-i-use) of intended implementation 

Basically the hierarchy is:
1) .env.${NODE_ENV}.local
2) .env.${NODE_ENV}
3) .env.local (excluded if NODE_ENV == 'test')
4) .env

1 takes priority over 2, etc.

Note that `parcel build` overrides `NODE_ENV` to be `production`, hence our leveraging `REALM` in the script & in `index.js`.

## Running tests

It's important to make sure you're running on the up-to-date GraphQL schema. Extract from CCP by going to project root and doing:

`python manage.py graphql_schema --indent 2 --out client/test/schema.json`

Commit the schema. CCU-26 will automate this process.

We use [jest](https://github.com/facebook/jest) and [enzyme](https://github.com/airbnb/enzyme) for UI testing. 

While developing, using `yarn test-watch`. This will watch test files that are testing the production files to which you have made edits (based on git).

Otherwise, `yarn test` will run the whole test suite.

## Running eslint in PyCharm

To run on all files: `cd client && ./node_modules/eslint/bin/eslint.js --fix .`

To set up a single file hotkey:
1) Preference
2) Keymap
3) "Fix ESLint Problems"
4) Recommend ctrl + opt + L (similar to cmd + opt + L code reformat) 
