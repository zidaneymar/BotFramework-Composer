/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { useRecoilCallback, CallbackInterface } from 'recoil';
import { dereferenceDefinitions, LuFile, DialogInfo, SensitiveProperties } from '@bfc/shared';
import { indexer } from '@bfc/indexers';
import lodashGet from 'lodash/get';
import lodashSet from 'lodash/get';
import isArray from 'lodash/isArray';

import filePersistence from '../../store/persistence/FilePersistence';
import lgWorker from '../../store/parsers/lgWorker';
import luWorker from '../../store/parsers/luWorker';
import httpClient from '../../utils/httpUtil';
import { BotStatus } from '../../constants';
import { getReferredFiles } from '../../utils/luUtil';
import luFileStatusStorage from '../../utils/luFileStatusStorage';
import { DialogSetting } from '../../store/types';
import settingStorage from '../../utils/dialogSettingStorage';

import {
  skillManifestsState,
  BotDiagnosticsState,
  settingsState,
  localeState,
  luFilesState,
  skillsState,
  schemasState,
  lgFilesState,
  locationState,
  botStatusState,
  botNameState,
  botEnvironmentState,
  dialogsState,
  projectIdState,
  botOpeningState,
} from './../atoms/botState';
import { recentProjects, botProjects, BotProject, templateProjects } from './../atoms/appState';
import { logMessage } from './../dispatchers/shared';

const checkProjectUpdates = async () => {
  const workers = [filePersistence, lgWorker, luWorker];

  return Promise.all(workers.map((w) => w.flush()));
};

const processSchema = (projectId: string, schema: any) => ({
  ...schema,
  definitions: dereferenceDefinitions(schema.definitions),
});

// if user set value in terminal or appsetting.json, it should update the value in localStorage
const refreshLocalStorage = (projectId: string, settings: DialogSetting) => {
  for (const property of SensitiveProperties) {
    const value = lodashGet(settings, property);
    if (value) {
      settingStorage.setField(projectId, property, value);
    }
  }
};

// merge sensitive values in localStorage
const mergeLocalStorage = (projectId: string, settings: DialogSetting) => {
  const localSetting = settingStorage.get(projectId);
  if (localSetting) {
    for (const property of SensitiveProperties) {
      const value = lodashGet(localSetting, property);
      if (value) {
        lodashSet(settings, property, value);
      } else {
        lodashSet(settings, property, ''); // set those key back, because that were omit after persisited
      }
    }
  }
};

const updateLuFilesStatus = (projectId: string, luFiles: LuFile[]) => {
  const status = luFileStatusStorage.get(projectId);
  return luFiles.map((luFile) => {
    if (typeof status[luFile.id] === 'boolean') {
      return { ...luFile, published: status[luFile.id] };
    } else {
      return { ...luFile, published: false };
    }
  });
};

const initLuFilesStatus = (projectId: string, luFiles: LuFile[], dialogs: DialogInfo[]) => {
  luFileStatusStorage.checkFileStatus(
    projectId,
    getReferredFiles(luFiles, dialogs).map((file) => file.id)
  );
  return updateLuFilesStatus(projectId, luFiles);
};

export const projectDispatcher = () => {
  const initBotState = async (callbackHelpers: CallbackInterface, data: any) => {
    const { set, snapshot } = callbackHelpers;
    const { files, botName, botEnvironment, location, schemas, settings, id, locale, diagnostics, skills } = data;
    schemas.sdk.content = processSchema(id, schemas.sdk.content);
    const { dialogs, luFiles, lgFiles, skillManifestFiles } = indexer.index(
      files,
      botName,
      schemas.sdk.content,
      locale
    );
    set(projectIdState, id);
    set(dialogsState, dialogs);
    set(botEnvironmentState, botEnvironment);
    set(botNameState, botName);
    const curLocation = await snapshot.getPromise(locationState);
    if (location !== curLocation) {
      set(botStatusState, BotStatus.unConnected);
      set(locationState, location);
    }
    set(lgFilesState, lgFiles);
    set(skillsState, skills);
    set(schemasState, schemas);
    set(luFilesState, initLuFilesStatus(botName, luFiles, dialogs));
    set(settingsState, settings);
    set(localeState, locale);
    set(BotDiagnosticsState, diagnostics);
    set(skillManifestsState, skillManifestFiles);
    set(botOpeningState, false);
    refreshLocalStorage(id, settings);
    mergeLocalStorage(id, settings);
  };

  const setOpenPendingStatusasync = async (callbackHelpers: CallbackInterface) => {
    const { set } = callbackHelpers;
    set(botOpeningState, true);
    await checkProjectUpdates();
  };

  const openBotProject = useRecoilCallback<[string, string], Promise<string>>(
    (callbackHelpers: CallbackInterface) => async (path: string, storageId = 'default') => {
      await setOpenPendingStatusasync(callbackHelpers);
      const response = await httpClient.put(`/projects/open`, { path, storageId });
      await initBotState(callbackHelpers, response.data);
      return response.data.id;
    }
  );

  const fetchProjectById = useRecoilCallback<[string], Promise<void>>(
    (callbackHelpers: CallbackInterface) => async (projectId: string) => {
      const response = await httpClient.get(`/projects/${projectId}`);
      await initBotState(callbackHelpers, response.data);
    }
  );

  const createProject = useRecoilCallback<[string, string, string, string, string], Promise<string>>(
    (callbackHelpers: CallbackInterface) => async (
      templateId: string,
      name: string,
      description: string,
      location: string,
      schemaUrl?: string
    ) => {
      await setOpenPendingStatusasync(callbackHelpers);
      const response = await httpClient.post(`/projects`, {
        storageId: 'default',
        templateId,
        name,
        description,
        location,
        schemaUrl,
      });
      const projectId = response.data.id;
      if (settingStorage.get(projectId)) {
        settingStorage.remove(projectId);
      }
      await initBotState(callbackHelpers, response.data);
      return projectId;
    }
  );

  const fetchRecentProjects = useRecoilCallback<[], void>((callbackHelpers: CallbackInterface) => async () => {
    const { set } = callbackHelpers;
    try {
      const response = await httpClient.get(`/projects/recent`);
      set(recentProjects, response.data);
    } catch (ex) {
      // TODO: Handle exceptions
      set(recentProjects, []);
      logMessage(`Error in fetching recent projects: ${ex}`);
    }
  });

  const removeRecentProject = useRecoilCallback<[string], void>(
    (callbackHelpers: CallbackInterface) => async (path: string) => {
      const {
        set,
        snapshot: { getPromise },
      } = callbackHelpers;
      try {
        const currentRecentProjects = await getPromise(recentProjects);
        const index = currentRecentProjects.findIndex((p) => p.path == path);
        currentRecentProjects.splice(index, 1);
        set(recentProjects, {
          ...currentRecentProjects,
        });
      } catch (ex) {
        // TODO: Handle exceptions
        logMessage(`Error removing recent project: ${ex}`);
      }
    }
  );

  const updateBotEndpointForProject = useRecoilCallback<[string, string], Promise<void>>(
    (callbackHelpers: CallbackInterface) => async (projectId: string, endpoint: string) => {
      const {
        snapshot: { getPromise },
        set,
      } = callbackHelpers;
      try {
        const currentBotProjects = await getPromise(botProjects);
        const index = currentBotProjects.findIndex((currentProject: BotProject) => currentProject.id === projectId);
        if (index !== -1) {
          currentBotProjects[index].endpoints.push(endpoint);
        }
        set(botProjects, { ...currentBotProjects });
      } catch (ex) {
        // TODO: Handle exceptions
        logMessage(`Error updating bot endpoint: ${ex}`);
      }
    }
  );

  const setTemplateProjects = useRecoilCallback<[string, string], Promise<void>>(
    (callbackHelpers: CallbackInterface) => async () => {
      const { set } = callbackHelpers;
      try {
        const response = await httpClient.get(`/assets/projectTemplates`);
        if (isArray(response.data)) {
          set(templateProjects, [...response.data]);
        }
      } catch (ex) {
        // TODO: Handle exceptions
        logMessage(`Error setting template projects: ${ex}`);
      }
    }
  );

  return {
    openBotProject,
    createProject,
    fetchProjectById,
    fetchRecentProjects,
    removeRecentProject,
    updateBotEndpoint: updateBotEndpointForProject,
    setTemplateProjects,
  };
};
