// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment, useEffect, useState } from 'react';
import { AuthManager, LoggedIn } from '@azure/ms-rest-browserauth';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { ResourceManagementClient } from '@azure/arm-resources';

export const LoginPage = (props) => {
  const [loginStatus, setLogin] = useState(false);
  const authManager = new AuthManager({
    clientId: 'f8961299-a7b0-40c3-9ae9-eefcd4a7a2a5',
    tenant: 'common',
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
        if (res.isLoggedIn) {
          console.log(res.creds);
        }
      });
    }
  };

  useEffect(() => {}, [props]);
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
