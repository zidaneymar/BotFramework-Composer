// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import pluginLoader from '../services/pluginLoader';

export const PublishController = {
  getTypes: async (req, res) => {
    res.json(Object.keys(pluginLoader.extensions.publish));
  },
  publish: async (req, res) => {
    const method = req.params.method;
    if (pluginLoader.extensions.publish[method] && pluginLoader.extensions.publish[method].publish) {
      // get the externally defined method
      const pluginMethod = pluginLoader.extensions.publish[method].publish;

      // call the method
      const results = await pluginMethod.apply(null, { foo: 'bar' }, {});
      res.json(results);
    } else {
      res.send(`Got invalid request to publish`);
    }
  },
};
