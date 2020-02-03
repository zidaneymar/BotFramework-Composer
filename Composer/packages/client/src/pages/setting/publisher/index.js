// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useContext, useEffect, useState, Fragment } from 'react';
import formatMessage from 'format-message';
import TimeAgo from 'react-timeago';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Stack, StackItem } from 'office-ui-fabric-react/lib/Stack';
import { Dialog, DialogFooter, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
import { TextField } from 'office-ui-fabric-react/lib/TextField';

import { isAbsHosted } from '../../../utils/envUtil';

import { StoreContext } from './../../../store';
import { styles } from './styles';

const DateWidget = props => {
  const { date } = props;

  const timestamp = new Date(date);
  const now = new Date();

  const minutesAgo = parseInt((now.getTime() - timestamp.getTime()) / 60000);

  if (minutesAgo < 60) {
    return <TimeAgo date={date} />;
  } else {
    const formattedDate = timestamp.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
    return <span>{formattedDate}</span>;
  }
};

export const Publisher = () => {
  const { state, actions } = useContext(StoreContext);
  const [dialogHidden, setDialogHidden] = useState(true);
  const [publishAction, setPublishAction] = useState('');
  const [dialogProps, setDialogProps] = useState({
    title: 'Title',
    subText: 'Sub Text',
    type: DialogType.normal,
    children: [],
  });
  const {
    botName,
    botEnvironment,
    publishVersions,
    remoteEndpoints,
    settings,
    publishStatus,
    publishTypes,
    publishTargets,
  } = state;
  const [slot, setSlot] = useState(botEnvironment === 'editing' ? 'integration' : botEnvironment);
  const absHosted = isAbsHosted();

  useEffect(() => {
    // load up the list of all publish targets
    actions.getPublishTargetTypes();

    // display current targets
    updatePublishTargets(settings.publishTargets || []);
  }, []);

  const updatePublishTargets = async rawTargets => {
    // make sure there is space for the status to be loaded
    const targets = rawTargets.map(target => {
      return {
        status: '',
        statusCode: 202,
        ...target,
      };
    });

    console.log('SET PUBLISH TARGETS', targets);
    for (let i = 0; i < targets.length; i++) {
      publishTargets.push(targets[i]);
    }
  };

  useEffect(() => {
    console.log('publish targets changed');
    if (
      publishTargets.filter(target => {
        return target.statusCode === 202;
      }).length
    ) {
      actions.getPublishStatus();
      console.log('NEED TO LOAD PUBLISH STATUS');
    }
  }, [publishTargets]);

  const savePublishTarget = (name, type, configuration) => {
    alert(`save ${name} ${type} ${configuration}`);

    if (!settings.publishTargets) {
      settings.publishTargets = [];
    }

    settings.publishTargets.push({
      name,
      type,
      configuration,
    });

    actions.setSettings(botName, settings, absHosted ? slot : undefined);

    updatePublishTargets(settings.publishTargets || []);
  };

  const addDestination = async () => {
    setDialogProps({
      title: 'Add Target',
      type: DialogType.normal,
      children: (
        <CreatePublishTarget
          targetTypes={publishTypes.map(type => {
            return { key: type, text: type };
          })}
          onSave={savePublishTarget}
        />
      ),
    });
    setDialogHidden(false);
  };

  const publish = async () => {
    setPublishAction('publish');

    // TODO???: first publish editing -> integration
    // publish integration -> prod
    await actions.publish();
  };

  // useEffect(() => {
  //   if (publishStatus === 'inactive') {
  //     // noop
  //   } else if (publishStatus === 'start') {
  //     setDialogProps({
  //       title: formatMessage('Publishing'),
  //       subText: (
  //         <Spinner
  //           size={SpinnerSize.small}
  //           label={formatMessage('Updating your bot')}
  //           ariaLive="assertive"
  //           labelPosition="left"
  //         />
  //       ),
  //     });
  //   } else if (publishStatus === 'ok') {
  //     // reload publish history
  //     actions.getPublishHistory();
  //     if (publishAction === 'publish') {
  //       // display confirmation
  //       setDialogProps({
  //         title: formatMessage('Bot successfully published'),
  //         subText: formatMessage(
  //           'You can view your published bot by opening it locally in Emulator or online with Web Chat.'
  //         ),
  //         type: DialogType.normal,
  //         children: (
  //           <Stack horizontal horizontalAlign="end" gap="1rem">
  //             <PrimaryButton onClick={closeConfirm} text={formatMessage('OK')} />
  //           </Stack>
  //         ),
  //       });
  //       setPublishAction('');
  //       setDialogHidden(false);
  //     } else if (publishAction === 'rollback') {
  //       setDialogProps({
  //         title: formatMessage('Rollback successful'),
  //         subText: formatMessage(
  //           "Your bot was successfully rolled back to it's last published state.You can view your published bot by opening it locally in Emulator or online with Web Chat."
  //         ),
  //         type: DialogType.normal,
  //         children: (
  //           <Stack horizontal horizontalAlign="end" gap="1rem">
  //             <PrimaryButton onClick={closeConfirm} text={formatMessage('OK')} />
  //           </Stack>
  //         ),
  //       });
  //       setPublishAction('');
  //       setDialogHidden(false);
  //     }
  //   } else {
  //     // display confirmation
  //     setDialogProps({
  //       title: formatMessage('Error publishing bot'),
  //       subText: formatMessage('An error was encountered while attempting to publish your bot: { error }', {
  //         error: publishStatus,
  //       }),
  //       type: DialogType.normal,
  //       children: (
  //         <Stack horizontal horizontalAlign="end" gap="1rem">
  //           <PrimaryButton onClick={closeConfirm} text={formatMessage('OK')} />
  //         </Stack>
  //       ),
  //     });
  //     setDialogHidden(false);
  //   }
  // }, [publishStatus]);

  const rollback = async () => {
    setPublishAction('rollback');

    // publish previousProd -> prod
    await actions.publishVersion(publishVersions.previousProduction.label);

    // reload publish history
    actions.getPublishHistory();
  };

  const confirmRollback = () => {
    setDialogProps({
      title: formatMessage('Confirm rollback'),
      subText: formatMessage("Are you sure you want to rollback to your bot's last published state?"),
      type: DialogType.normal,
      children: (
        <Stack horizontal horizontalAlign="end" gap="1rem">
          <DefaultButton onClick={closeConfirm} text={formatMessage('Cancel')} />
          <PrimaryButton onClick={rollback} text={formatMessage('Rollback')} />
        </Stack>
      ),
    });
    setDialogHidden(false);
  };

  const confirmPublish = () => {
    setDialogProps({
      title: formatMessage('Confirm Publish'),
      subText: formatMessage('Are you sure you want to publish your bot?'),
      type: DialogType.normal,
      children: (
        <Stack horizontal horizontalAlign="end" gap="1rem">
          <DefaultButton onClick={closeConfirm} text={formatMessage('Cancel')} />
          <PrimaryButton onClick={publish} text={formatMessage('Publish')} />
        </Stack>
      ),
    });
    setDialogHidden(false);
  };

  const closeConfirm = () => {
    setDialogHidden(true);
  };

  const publishToTarget = index => {
    return async () => {
      if (publishTargets[index]) {
        const target = publishTargets[index];
        console.log('PUBLISH TO TARGET', target);
        await actions.publishToTarget(target);
      }
    };
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.header}>Publish your bot to a remote</h1>
      <PrimaryButton text="Add Destination" onClick={addDestination} styles={styles.button} />
      {publishTypes && publishTypes.length && <div>publish to types: {publishTypes.join(',')}</div>}

      {publishTargets.map((target, i) => {
        return (
          <div key={i}>
            <p>
              <label>Name:</label>
              {target.name}
              <PrimaryButton text="Publish" onClick={publishToTarget(i)} />
            </p>
          </div>
        );
      })}

      {/* {publishVersions && publishVersions.integration && (
        <div style={styles.integration}>
          <Stack horizontal gap="1rem" verticalAlign="start">
            <StackItem grow={0}>
              <Icon iconName="sync" styles={styles.icon} />
            </StackItem>
            <StackItem grow={1}>
              <h1 style={styles.h1}>In Test</h1>
              Last tested <DateWidget date={publishVersions.integration.publishTimestamp} />
            </StackItem>
            <StackItem align="center" shrink={0} styles={styles.buttons}>
              <PrimaryButton text="Publish" onClick={confirmPublish} styles={styles.button} />
            </StackItem>
          </Stack>
        </div>
      )}
      {publishVersions && publishVersions.production && (
        <div style={styles.published}>
          <Stack horizontal gap="1rem" verticalAlign="start">
            <StackItem grow={0}>
              <Icon styles={styles.icon} iconName="Globe" />
            </StackItem>
            <StackItem grow={1}>
              <h1 style={styles.h1}>In Production</h1>
              Current version published <DateWidget date={publishVersions.production.publishTimestamp} />
            </StackItem>
            <StackItem align="center" shrink={0} styles={styles.buttons}>
              <PrimaryButton text="Open in Emulator" onClick={openEmulator} styles={styles.button} />
            </StackItem>
          </Stack>
        </div>
      )}
      <div style={styles.rollback}>
        {publishVersions && publishVersions.previousProduction && (
          <Stack horizontal gap="1rem" verticalAlign="start">
            <StackItem grow={0}>
              <Icon styles={styles.icon} iconName="history" />
            </StackItem>
            <StackItem grow={1}>
              <a href="#" onClick={confirmRollback}>
                Rollback
              </a>
              &nbsp;to last published <DateWidget date={publishVersions.previousProduction.publishTimestamp} />
            </StackItem>
          </Stack>
        )}
        {publishVersions && !publishVersions.previousProduction && (
          <Stack horizontal gap="1rem" verticalAlign="start">
            <StackItem grow={0}>
              <Icon styles={styles.disabledIcon} iconName="history" />
            </StackItem>
            <StackItem grow={1} styles={styles.disabled}>
              Rollback will be available after your next publish.
            </StackItem>
          </Stack>
        )}
      </div> */}
      {!publishVersions && <div>{formatMessage('Loading')}</div>}

      <Dialog hidden={dialogHidden} onDismiss={closeConfirm} dialogContentProps={dialogProps}>
        {dialogProps.children}
        {dialogProps.footer && <DialogFooter>{dialogProps.footer}</DialogFooter>}
      </Dialog>
    </div>
  );
};

const CreatePublishTarget = props => {
  let targetType = '';
  let config = '';
  let name = '';
  const updateType = (e, type) => {
    // console.log('UPDATE TYPE', type);
    targetType = type.key;
  };
  const updateConfig = (e, newConfig) => {
    // console.log('UPDATE CONFIG', config);
    // todo: attempt json parse and only allow submit if json is valid
    config = newConfig;
  };
  const updateName = (e, newName) => {
    name = newName;
  };

  const submit = () => {
    try {
      JSON.parse(config);
      return props.onSave(name, targetType, config);
    } catch (err) {
      alert('Error parsing configuration');
    }
  };

  return (
    <Fragment>
      <form onSubmit={submit}>
        create a publish target.
        <TextField
          placeholder="My Publish Target"
          label={formatMessage('Name')}
          styles={styles.input}
          onChange={updateName}
        />
        <Dropdown
          placeholder={formatMessage('Choose One')}
          label={formatMessage('Publish Destination Type')}
          options={props.targetTypes}
          onChange={updateType}
        />
        <TextField
          label={formatMessage('Paste Configuration')}
          styles={styles.textarea}
          onChange={updateConfig}
          multiline={true}
        />
      </form>
      <DialogFooter>
        <PrimaryButton onClick={submit} text={formatMessage('Save')} />
      </DialogFooter>
    </Fragment>
  );
};
