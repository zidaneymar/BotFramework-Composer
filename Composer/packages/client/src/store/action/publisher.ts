// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ActionCreator } from '../types';

import { ActionTypes } from './../../constants/index';
import httpClient from './../../utils/httpUtil';

export const getPublishTargetTypes: ActionCreator = async ({ dispatch }) => {
  try {
    const response = await httpClient.get(`/publish/types`);
    dispatch({
      type: ActionTypes.GET_PUBLISH_TYPES_SUCCESS,
      payload: {
        response: response.data,
      },
    });
  } catch (err) {
    dispatch({ type: ActionTypes.GET_PUBLISH_TYPES_FAILURE, payload: null, error: err });
  }
};
