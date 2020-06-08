// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment, useEffect } from 'react';
import { AuthManager } from '@azure/ms-rest-browserauth';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
export const LoginPage = (props) => {
  const authManager = new AuthManager({
    clientId: 'f8961299-a7b0-40c3-9ae9-eefcd4a7a2a5',
    tenant: 'common',
  });
  useEffect(() => {
    authManager.finalizeLogin().then((res) => {
      console.log(res);
      if (!res.isLoggedIn) {
        // may cause redirects
        authManager.login();
      }
      const credentials = res.creds;
      console.log('Available subscriptions: ', res.availableSubscriptions);
    });
  }, [props]);
  return (
    <Fragment>
      <span>If not redirect, please click </span>
      <DefaultButton text="login" onClick={() => authManager.login()} />
      <span>to redirect</span>
    </Fragment>
  );
};
