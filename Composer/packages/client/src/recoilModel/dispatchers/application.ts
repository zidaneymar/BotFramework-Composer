/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { useRecoilCallback, CallbackInterface } from 'recoil';
import isArray from 'lodash/isArray';

import httpClient from '../../utils/httpUtil';
import { currentUser } from '../atoms/appState';

import { logMessage } from './shared';

export const applicationDispatcher = () => {
  const fetchStorages = useRecoilCallback<[string, string], Promise<void>>(
    (callbackHelpers: CallbackInterface) => async () => {
      const { set } = callbackHelpers;
      try {
        const response = await httpClient.put(`/storages`);
        if (isArray(response.data)) {
          set(storages, [...response.data]);
        }
      } catch (ex) {
        // TODO: Handle exceptions
        logMessage(`Error fetching storages: ${ex}`);
      }
    }
  );

  return {
    fetchStorages,
  };
};
