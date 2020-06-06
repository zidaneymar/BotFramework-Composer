// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// import { BearerStrategy, OIDCStrategy } from 'passport-azure-ad';
import * as msRestNodeAuth from '@azure/ms-rest-nodeauth';

console.log('azure login plugin');
const credsMap = {} as { [key: string]: any };

const authentication = async (req, res, next) => {
  next();
};
const verification = async (req, res, next) => {
  const { accessToken, user } = req.body;
  if (accessToken && credsMap[user].getAccessToken() === accessToken) {
    console.log(accessToken);
  } else {
    // authentication
    console.log('need authentication');
    res.status(400).json(new Error('need authentication'));
  }
  next();
};
export default async (composer: any): Promise<void> => {
  composer.addWebRoute('post', '/api/publish/subscriptions', verification);
};
