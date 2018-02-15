module.exports = {
  "moduleDirectories": [
    "node_modules",
    "./",
    "src/"
  ],
  "setupTestFrameworkScriptFile": "<rootDir>/test/setup.js",
  "moduleNameMapper": {
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/test/__mocks__/fileMock.js"
  },
  "snapshotSerializers": ["enzyme-to-json/serializer"]
};
