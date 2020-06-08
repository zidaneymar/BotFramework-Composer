// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// import { BearerStrategy, OIDCStrategy } from 'passport-azure-ad';
console.log('azure login plugin');
const credsMap = {} as { [key: string]: any };

// set authentication
const setAuthentication = async (req, res, next) => {
  console.log(req);
  res.status(200);
};
const verification = async (req, res, next) => {
  const { accessToken, user } = req.body;
  if (!accessToken) {
    console.log('need authentication');
    res.status(400).json({
      statusCode: '400',
      message: 'need authentication',
    });
  } else if (credsMap[user].getAccessToken() === accessToken) {
    // authentication
    console.log(accessToken);
    next();
  }
};

export default async (composer: any): Promise<void> => {
  composer.addWebRoute('post', '/api/publish/subscriptions', verification);
  composer.addWebRoute('post', '/api/oauth2/callback', setAuthentication);
};
