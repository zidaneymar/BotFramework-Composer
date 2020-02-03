// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const plugin = {
  publish: async (config, project) => {
    console.log('PUBLISH ', config, project);
    return { message: 'This bot has been deployed!', statusCode: 200 };
  },
  getStatus: async config => {
    return { message: 'This bot has been deployed!', statusCode: 200 };
  },
  history: async config => {},
  rollback: async config => {},
};

module.exports = {
  initialize: composer => {
    composer.addPublishMethod(plugin);
  },
};
