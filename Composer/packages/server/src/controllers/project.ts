// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as fs from 'fs';

import { Request, Response } from 'express';
import axios from 'axios';

import log from '../logger';
import { BotProjectService } from '../services/project';
import AssectService from '../services/asset';
import { LocationRef } from '../models/bot/interface';
import StorageService from '../services/storage';
import settings from '../settings';

import { Path } from './../utility/path';
const spacyClient = axios.create({
  baseURL: 'http://localhost:9000',
});

async function createProject(req: Request, res: Response) {
  let { templateId } = req.body;
  const { name, description, storageId, location } = req.body;
  if (templateId === '') {
    templateId = 'EmptyBot';
  }

  // default the path to the default folder.
  let path = settings.botsFolder;
  // however, if path is specified as part of post body, use that one.
  // this allows developer to specify a custom home for their bot.
  if (location) {
    // validate that this path exists
    // prettier-ignore
    if (fs.existsSync(location)) { // lgtm [js/path-injection]
      path = location;
    }
  }

  const locationRef: LocationRef = {
    storageId,
    path: Path.resolve(path, name),
  };

  log('Attempting to create project at %s', path);

  try {
    const newProjRef = await AssectService.manager.copyProjectTemplateTo(templateId, locationRef);
    await BotProjectService.openProject(newProjRef);
    const currentProject = BotProjectService.getCurrentBotProject();
    if (currentProject !== undefined) {
      await currentProject.updateBotInfo(name, description);
      await currentProject.index();
      const project = currentProject.getIndexes();
      log('Project created successfully.');
      res.status(200).json({
        ...project,
      });
    }
  } catch (err) {
    res.status(404).json({
      message: err instanceof Error ? err.message : err,
    });
  }
}

async function getProject(req: Request, res: Response) {
  const currentProject = BotProjectService.getCurrentBotProject();
  if (currentProject !== undefined && (await currentProject.exists())) {
    await currentProject.index();
    const project = currentProject.getIndexes();
    res.status(200).json({
      ...project,
    });
  } else {
    res.status(404).json({
      message: 'No such bot project opened',
    });
  }
}

async function openProject(req: Request, res: Response) {
  if (!req.body.storageId || !req.body.path) {
    res.status(400).json({
      message: 'parameters not provided, require stoarge id and path',
    });
    return;
  }

  const location: LocationRef = {
    storageId: req.body.storageId,
    path: req.body.path,
  };

  try {
    await BotProjectService.openProject(location);
    const currentProject = BotProjectService.getCurrentBotProject();
    if (currentProject !== undefined) {
      const project = currentProject.getIndexes();
      res.status(200).json({
        ...project,
      });
    } else {
      res.status(404).json({
        message: 'No such bot project opened',
      });
    }
  } catch (e) {
    res.status(400).json({
      message: e.message,
    });
  }
}

async function saveProjectAs(req: Request, res: Response) {
  if (!req.body.storageId || !req.body.name) {
    res.status(400).json({
      message: 'parameters not provided, require stoarge id and path',
    });
    return;
  }

  const { name, description, location, storageId } = req.body;

  const locationRef: LocationRef = {
    storageId,
    path: location ? Path.join(location, name) : Path.resolve(settings.botsFolder, name),
  };

  try {
    await BotProjectService.saveProjectAs(locationRef);
    const currentProject = BotProjectService.getCurrentBotProject();
    if (currentProject !== undefined) {
      await currentProject.updateBotInfo(name, description);
      await currentProject.index();
      const project = currentProject.getIndexes();
      res.status(200).json({
        ...project,
      });
    } else {
      res.status(404).json({
        message: 'No such bot project opened',
      });
    }
  } catch (e) {
    res.status(400).json({
      message: e instanceof Error ? e.message : e,
    });
  }
}

async function getRecentProjects(req: Request, res: Response) {
  const projects = await BotProjectService.getRecentBotProjects();
  return res.status(200).json(projects);
}

async function updateDialog(req: Request, res: Response) {
  const currentProject = BotProjectService.getCurrentBotProject();
  if (currentProject !== undefined) {
    await currentProject.updateDialog(req.body.id, req.body.content);
    res.send(204);
  } else {
    res.status(404).json({
      message: 'No such bot project opened',
    });
  }
}

async function createDialog(req: Request, res: Response) {
  const currentProject = BotProjectService.getCurrentBotProject();
  if (currentProject !== undefined) {
    const content = JSON.stringify(req.body.content, null, 2) + '\n';
    const id = req.body.id;

    //dir = id
    const dialogResources = await currentProject.createDialog(id, content);
    res.status(200).json(dialogResources);
  } else {
    res.status(404).json({
      message: 'No such bot project opened',
    });
  }
}

async function removeDialog(req: Request, res: Response) {
  const currentProject = BotProjectService.getCurrentBotProject();
  if (currentProject !== undefined) {
    const dialogResources = await currentProject.removeDialog(req.params.dialogId);
    res.status(200).json(dialogResources);
  } else {
    res.status(404).json({ error: 'No bot project opened' });
  }
}

async function updateLgFile(req: Request, res: Response) {
  const currentProject = BotProjectService.getCurrentBotProject();
  if (currentProject !== undefined) {
    const lgFiles = await currentProject.updateLgFile(req.body.id, req.body.content);
    res.status(200).json({ lgFiles });
  } else {
    res.status(404).json({
      message: 'No such bot project opened',
    });
  }
}

async function createLgFile(req: Request, res: Response) {
  const currentProject = BotProjectService.getCurrentBotProject();
  if (currentProject !== undefined) {
    const lgFiles = await currentProject.createLgFile(req.body.id, req.body.content);
    res.status(200).json({ lgFiles });
  } else {
    res.status(404).json({
      message: 'No such bot project opened',
    });
  }
}

async function removeLgFile(req: Request, res: Response) {
  const currentProject = BotProjectService.getCurrentBotProject();
  if (currentProject !== undefined) {
    const lgFiles = await currentProject.removeLgFile(req.params.lgFileId);
    res.status(200).json({ lgFiles });
  } else {
    res.status(404).json({
      message: 'No such bot project opened',
    });
  }
}

async function updateLuFile(req: Request, res: Response) {
  const currentProject = BotProjectService.getCurrentBotProject();
  if (currentProject !== undefined) {
    try {
      const luFiles = await currentProject.updateLuFile(req.body.id, req.body.content);
      res.status(200).json({ luFiles });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  } else {
    res.status(404).json({
      message: 'No such bot project opened',
    });
  }
}

async function createLuFile(req: Request, res: Response) {
  const currentProject = BotProjectService.getCurrentBotProject();
  if (currentProject !== undefined) {
    const luFiles = await currentProject.createLuFile(req.body.id, req.body.content);
    res.status(200).json({ luFiles });
  } else {
    res.status(404).json({
      message: 'No such bot project opened',
    });
  }
}

async function getDefaultSlotEnvSettings(req: Request, res: Response) {
  const currentProject = BotProjectService.getCurrentBotProject();
  if (currentProject !== undefined) {
    try {
      const settings = await currentProject.getDefaultSlotEnvSettings(req.query.obfuscate);
      res.send(settings);
    } catch (err) {
      res.status(404).json({
        message: err.message,
      });
    }
  } else {
    res.status(404).json({
      message: 'No such bot project opened',
    });
  }
}

async function getEnvSettings(req: Request, res: Response) {
  const currentProject = BotProjectService.getCurrentBotProject();
  if (currentProject !== undefined) {
    try {
      const settings = await currentProject.getEnvSettings(req.params.slot, req.query.obfuscate);
      res.send(settings);
    } catch (err) {
      res.status(404).json({
        message: err.message,
      });
    }
  } else {
    res.status(404).json({
      message: 'No such bot project opened',
    });
  }
}

async function updateEnvSettings(req: Request, res: Response) {
  const currentProject = BotProjectService.getCurrentBotProject();
  if (currentProject !== undefined) {
    try {
      await currentProject.updateEnvSettings(req.params.slot, req.body.settings);
      res.send('ok');
    } catch (err) {
      res.status(404).json({
        message: err.message,
      });
    }
  } else {
    res.status(404).json({
      message: 'No such bot project opened',
    });
  }
}

async function updateDefaultSlotEnvSettings(req: Request, res: Response) {
  const currentProject = BotProjectService.getCurrentBotProject();
  if (currentProject !== undefined) {
    try {
      await currentProject.updateDefaultSlotEnvSettings(req.body.settings);
      res.send('ok');
    } catch (err) {
      res.status(404).json({
        message: err.message,
      });
    }
  } else {
    res.status(404).json({
      message: 'No such bot project opened',
    });
  }
}

async function removeLuFile(req: Request, res: Response) {
  const currentProject = BotProjectService.getCurrentBotProject();
  if (currentProject !== undefined) {
    const luFiles = await currentProject.removeLuFile(req.params.luFileId);
    res.status(200).json({ luFiles });
  } else {
    res.status(404).json({
      message: 'No such bot project opened',
    });
  }
}

async function publishLuis(req: Request, res: Response) {
  const currentProject = BotProjectService.getCurrentBotProject();
  if (currentProject !== undefined) {
    try {
      const luFiles = await currentProject.publishLuis(req.body.authoringKey);
      res.status(200).json({ luFiles });
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : error,
      });
    }
  } else {
    res.status(404).json({
      message: 'No such bot project opened',
    });
  }
}
const luFilesForSpacy = {};
async function uploadSpacy(req: Request, res: Response) {
  // get file path
  const filepath = req.body.path;
  const content = req.body.content;
  const config = {
    headers: {
      'Content-Length': 0,
      'Content-Type': 'text/plain',
    },
    responseType: 'text',
  };
  let appId = '';
  try {
    if (!luFilesForSpacy[filepath]) {
      const response = await spacyClient.get('/create_app');
      console.log(`get spacy appid ---------- ${response.data}`);
      appId = response.data;
      // eslint-disable-next-line require-atomic-updates
      luFilesForSpacy[filepath] = response.data;
    } else {
      appId = luFilesForSpacy[filepath];
    }
    await spacyClient.post(`/update_app/${appId}`, content, config);
    res.status(200).json(appId);
  } catch (error) {
    res.status(400).json(error);
  }
}
async function publishSpacy(req: Request, res: Response) {
  const currentProject = BotProjectService.getCurrentBotProject();
  if (currentProject !== undefined) {
    try {
      const filesto = StorageService.getStorageClient('default');
      if (!(await filesto.exists(`${currentProject.dataDir}/generated`))) {
        await filesto.mkDir(`${currentProject.dataDir}/generated`);
      }
      const content = {
        applicationId: req.body.id,
        $kind: 'Microsoft.SpacyRecognizer',
        endpoint: 'http://127.0.0.1:9000',
      };
      await filesto.writeFile(
        `${currentProject.dataDir}/generated/${req.body.filename}`,
        JSON.stringify(content, null, 2)
      );
      res.status(200).json('success');
    } catch (error) {
      res.status(400);
    }
  } else {
    res.status(404).json({
      message: 'publish spacy error',
    });
  }
}

async function getAllProjects(req: Request, res: Response) {
  const storageId = 'default';
  const folderPath = Path.resolve(settings.botsFolder);
  try {
    res.status(200).json(await StorageService.getBlob(storageId, folderPath));
  } catch (e) {
    res.status(400).json({
      message: e.message,
    });
  }
}

export const ProjectController = {
  getProject,
  openProject,
  updateDialog,
  createDialog,
  removeDialog,
  updateLgFile,
  createLgFile,
  removeLgFile,
  getEnvSettings,
  getDefaultSlotEnvSettings,
  updateEnvSettings,
  updateDefaultSlotEnvSettings,
  updateLuFile,
  createLuFile,
  removeLuFile,
  publishLuis,
  saveProjectAs,
  createProject,
  getAllProjects,
  getRecentProjects,
  publishSpacy,
  uploadSpacy,
};
