// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment, useEffect, useState } from 'react';
import { AuthManager } from '@azure/ms-rest-browserauth';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';

export const LoginPage = (props) => {
  const [loginStatus, setLogin] = useState(false);
  const authManager = new AuthManager({
    clientId: 'f8961299-a7b0-40c3-9ae9-eefcd4a7a2a5',
    tenant: 'common',
    redirectUri: 'http://localhost:5000/api/oauth2/callback',
  });

  const login = async () => {
    if (!loginStatus) {
      authManager.finalizeLogin().then((res) => {
        console.log(res);
        if (!res.isLoggedIn) {
          // may cause redirects
          authManager.login();
        }
        setLogin(true);
        // const credentials = res.creds;
        // console.log('Available subscriptions: ', res.availableSubscriptions);
      });
    }
  };

  useEffect(() => {
    console.log(loginStatus);
    console.log(window.localStorage.getItem('adal.idtoken'));
    if (window.localStorage.getItem('adal.idtoken')) {
      window.history.back();
    }
  }, [props]);
  return (
    <Fragment>
      <span>If not redirect, please click </span>
      <DefaultButton
        text="login"
        onClick={async () => {
          login();
        }}
      />
      <span>to redirect</span>
    </Fragment>
  );
};
