// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const plugin = {
  publish: async (config, project) => {
    console.log('PUBLISH ', config);
    return { status: 'complete', statusCode: 200 };
  },
  getStatus: async config => {},
  history: async config => {},
  rollback: async config => {},
};

module.exports = {
  initialize: composer => {
    composer.addPublishMethod(plugin);
  },
};
