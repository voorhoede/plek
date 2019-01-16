0. get now-cli repo
1. npm install
2. npm run build
3. babel dist/index.js -o dist/index-babelified.js
  - babel config
  - dependencies: @babel/polyfill @babel/cli @babel/core @babel/preset-env
  - Node 10 or later
4. ncc build dist/index-babelified.js -o packed

