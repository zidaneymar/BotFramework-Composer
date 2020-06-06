// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BearerStrategy, OIDCStrategy } from 'passport-azure-ad';
import { interactiveLogin } from '@azure/ms-rest-nodeauth';

const verification = async () => { };
const getAuthentication = async () => {
  await interactiveLogin({ domain: tenantId });
};
export default async (composer: any): Promise<void> => {
  await composer.usePassportStrategy(new OIDCStrategy({}), schema, instructions);
  composer.addWebRoute('get', '/login');
};
