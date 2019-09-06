import { get, set, cloneDeep } from 'lodash';
import { ConceptLabels, seedNewDialog } from 'shared-menus';
import { ExpressionEngine } from 'botbuilder-expression-parser';
import { DialogInfo } from 'composer-extensions/obiformeditor/lib/types';
import nanoid from 'nanoid/generate';

import { upperCaseName } from './fileUtil';
import { getFocusPath } from './navigation';

const ExpressionParser = new ExpressionEngine();

interface DialogsMap {
  [dialogId: string]: any;
}

export function getDialog(dialogs: DialogInfo[], dialogId: string) {
  const dialog = dialogs.find(item => item.id === dialogId);
  return cloneDeep(dialog);
}

export function getFriendlyName(data) {
  if (get(data, '$designer.name')) {
    return get(data, '$designer.name');
  }

  if (get(data, 'intent')) {
    return `#${get(data, 'intent')}`;
  }

  if (ConceptLabels[data.$type] && ConceptLabels[data.$type].title) {
    return ConceptLabels[data.$type].title;
  }
}

export function insert(content, path: string, position: number | undefined, $type: string) {
  const current = get(content, path, []);
  const newStep = {
    $type,
    $designer: {
      name: getFriendlyName({ $type }),
      id: nanoid('1234567890', 6),
    },
    ...seedNewDialog($type),
  };

  const insertAt = typeof position === 'undefined' ? current.length : position;

  current.splice(insertAt, 0, newStep);

  set(content, path, current);

  return content;
}

export function addNewTrigger(dialogs: DialogInfo[], dialogId: string, $type: string) {
  const dialogCopy = getDialog(dialogs, dialogId);
  if (!dialogCopy) return;
  return insert(dialogCopy.content, 'rules', undefined, $type);
}

export function createSelectedPath(selected: number) {
  return `rules[${selected}]`;
}

export function createFocusedPath(selected: number, focused: number) {
  return `rules[${selected}].steps[${focused}]`;
}

export function deleteTrigger(dialogs: DialogInfo[], dialogId: string, index: number) {
  const dialogCopy = getDialog(dialogs, dialogId);
  if (!dialogCopy) return null;
  const content = dialogCopy.content;
  content.rules.splice(index, 1);
  return content;
}

export function getDialogsMap(dialogs: DialogInfo[]): DialogsMap {
  return dialogs.reduce((result, dialog) => {
    result[dialog.id] = dialog.content;
    return result;
  }, {});
}

const getLabel = (dialog: DialogInfo, dataPath: string) => {
  const data = get(dialog, dataPath);
  if (!data) return '';
  return getFriendlyName(data);
};

export function getbreadcrumbLabel(dialogs: DialogInfo[], dialogId: string, selected: string, focused: string) {
  let label = '';
  const dataPath = getFocusPath(selected, focused);
  if (!dataPath) {
    const dialog = dialogs.find(d => d.id === dialogId);
    label = (dialog && dialog.displayName) || '';
  } else {
    const dialogsMap = getDialogsMap(dialogs);
    const dialog = dialogsMap[dialogId];
    label = getLabel(dialog, dataPath);
  }

  label = upperCaseName(label || '');
  return label;
}

export function getDialogData(dialogsMap: DialogsMap, dialogId: string, dataPath = '') {
  if (!dialogId) return '';
  const dialog = dialogsMap[dialogId];

  if (!dataPath) {
    return dialog;
  }

  return ConceptLabels[get(dialog, dataPath)] ? ConceptLabels[get(dialog, dataPath)].title : get(dialog, dataPath);
}

export function setDialogData(dialogsMap: DialogsMap, dialogId: string, dataPath: string, data: any) {
  const dialogsMapClone = cloneDeep(dialogsMap);
  const dialog = dialogsMapClone[dialogId];

  if (!dataPath) {
    return data;
  }
  return set(dialog, dataPath, data);
}

export function sanitizeDialogData(dialogData: any) {
  if (dialogData === null || dialogData === '') {
    return undefined;
  }

  if (Array.isArray(dialogData)) {
    return dialogData.length > 0 ? dialogData.map(sanitizeDialogData).filter(Boolean) : undefined;
  }

  if (typeof dialogData === 'object') {
    const obj = cloneDeep(dialogData); // Prevent mutation of source object.

    for (const key in obj) {
      if (obj[key] === undefined || obj[key] === null || obj[key] === '') {
        delete obj[key];
        continue;
      }

      const result = sanitizeDialogData(obj[key]);
      switch (typeof result) {
        case 'undefined':
          delete obj[key];
          break;
        case 'boolean':
          obj[key] = result;
          break;
        case 'object':
          if (Object.keys(result).length === 0) {
            delete obj[key];
          } else {
            obj[key] = result;
          }
          break;
        default:
          obj[key] = result;
      }
    }

    if (Object.keys(obj).length === 0) {
      return undefined;
    }

    return obj;
  }

  return dialogData;
}

export function isExpression(str: string): boolean {
  try {
    ExpressionParser.parse(str);
  } catch (error) {
    return false;
  }

  return true;
}
