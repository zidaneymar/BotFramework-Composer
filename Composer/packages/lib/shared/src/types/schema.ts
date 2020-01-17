// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { JSONSchema6 } from 'json-schema';

// All of the known SDK types. Update this list when we take a schema update.
// To get this list copy the output of the following commands in a node repl from the project root:

// const schema = JSON.parse(fs.readFileSync('./packages/server/schemas/sdk.schema', 'utf-8'));
// const types = schema.oneOf.map(t => t.title);
// let uType = 'export enum SDKTypes {\n';
// uType += types.map(t => `  ${t.replace('Microsoft.', '')} = '${t}',`).join('\n');
// uType += '\n}';
// console.log(uType);

/**
 * All SDK Types defined by the schema.
 * All references of the type should be accessed through this enum.
 * */

export enum SDKTypes {
  ActivityTemplate = 'Microsoft.ActivityTemplate',
  AdaptiveCardRecognizer = 'Microsoft.AdaptiveCardRecognizer',
  AdaptiveDialog = 'Microsoft.AdaptiveDialog',
  AgeEntityRecognizer = 'Microsoft.AgeEntityRecognizer',
  Ask = 'Microsoft.Ask', //done
  AttachmentInput = 'Microsoft.AttachmentInput',
  BeginDialog = 'Microsoft.BeginDialog',
  BreakLoop = 'Microsoft.BreakLoop',
  CancelAllDialogs = 'Microsoft.CancelAllDialogs',
  ChoiceInput = 'Microsoft.ChoiceInput',
  ConditionalSelector = 'Microsoft.ConditionalSelector',
  ConfirmInput = 'Microsoft.ConfirmInput',
  ConfirmationEntityRecognizer = 'Microsoft.ConfirmationEntityRecognizer',
  ContinueLoop = 'Microsoft.ContinueLoop',
  CrossTrainedRecognizerSet = 'Microsoft.CrossTrainedRecognizerSet',
  CurrencyEntityRecognizer = 'Microsoft.CurrencyEntityRecognizer',
  DateTimeEntityRecognizer = 'Microsoft.DateTimeEntityRecognizer',
  DateTimeInput = 'Microsoft.DateTimeInput',
  DebugBreak = 'Microsoft.DebugBreak',
  DeleteActivity = 'Microsoft.DeleteActivity',
  DeleteProperties = 'Microsoft.DeleteProperties',
  DeleteProperty = 'Microsoft.DeleteProperty',
  DimensionEntityRecognizer = 'Microsoft.DimensionEntityRecognizer',
  EditActions = 'Microsoft.EditActions',
  EditArray = 'Microsoft.EditArray',
  EmailEntityRecognizer = 'Microsoft.EmailEntityRecognizer',
  EmitEvent = 'Microsoft.EmitEvent',
  EndDialog = 'Microsoft.EndDialog',
  EndTurn = 'Microsoft.EndTurn',
  FirstSelector = 'Microsoft.FirstSelector',
  Foreach = 'Microsoft.Foreach',
  ForeachPage = 'Microsoft.ForeachPage',
  GetActivityMembers = 'Microsoft.GetActivityMembers',
  GetConversationMembers = 'Microsoft.GetConversationMembers',
  GotoAction = 'Microsoft.GotoAction',
  GuidEntityRecognizer = 'Microsoft.GuidEntityRecognizer',
  HashtagEntityRecognizer = 'Microsoft.HashtagEntityRecognizer',
  HttpRequest = 'Microsoft.HttpRequest',
  IfCondition = 'Microsoft.IfCondition',
  InitProperty = 'Microsoft.InitProperty',
  IpEntityRecognizer = 'Microsoft.IpEntityRecognizer',
  LanguagePolicy = 'Microsoft.LanguagePolicy',
  LogAction = 'Microsoft.LogAction',
  LuisRecognizer = 'Microsoft.LuisRecognizer',
  MentionEntityRecognizer = 'Microsoft.MentionEntityRecognizer',
  MostSpecificSelector = 'Microsoft.MostSpecificSelector',
  MultiLanguageRecognizer = 'Microsoft.MultiLanguageRecognizer',
  NumberEntityRecognizer = 'Microsoft.NumberEntityRecognizer',
  NumberInput = 'Microsoft.NumberInput',
  NumberRangeEntityRecognizer = 'Microsoft.NumberRangeEntityRecognizer',
  OAuthInput = 'Microsoft.OAuthInput',
  OnActivity = 'Microsoft.OnActivity',
  OnAssignEntity = 'Microsoft.OnAssignEntity', //done
  OnBeginDialog = 'Microsoft.OnBeginDialog',
  OnCancelDialog = 'Microsoft.OnCancelDialog',
  OnChooseEntity = 'Microsoft.OnChooseEntity', //done
  OnChooseIntent = 'Microsoft.OnChooseIntent', //done
  OnChooseProperty = 'Microsoft.OnChooseProperty', //done
  OnClearProperty = 'Microsoft.OnClearProperty', //done
  OnCondition = 'Microsoft.OnCondition',
  OnConversationUpdateActivity = 'Microsoft.OnConversationUpdateActivity',
  OnCustomEvent = 'Microsoft.OnCustomEvent',
  OnDialogEvent = 'Microsoft.OnDialogEvent',
  OnEndOfActions = 'Microsoft.OnEndOfActions', // done
  OnEndOfConversationActivity = 'Microsoft.OnEndOfConversationActivity',
  OnError = 'Microsoft.OnError',
  OnEventActivity = 'Microsoft.OnEventActivity',
  OnHandoffActivity = 'Microsoft.OnHandoffActivity',
  OnIntent = 'Microsoft.OnIntent',
  OnInvokeActivity = 'Microsoft.OnInvokeActivity',
  OnMessageActivity = 'Microsoft.OnMessageActivity',
  OnMessageDeleteActivity = 'Microsoft.OnMessageDeleteActivity',
  OnMessageReactionActivity = 'Microsoft.OnMessageReactionActivity',
  OnMessageUpdateActivity = 'Microsoft.OnMessageUpdateActivity',
  OnQnAMatch = 'Microsoft.OnQnAMatch',
  OnRepromptDialog = 'Microsoft.OnRepromptDialog',
  OnTypingActivity = 'Microsoft.OnTypingActivity',
  OnUnknownIntent = 'Microsoft.OnUnknownIntent',
  OrdinalEntityRecognizer = 'Microsoft.OrdinalEntityRecognizer',
  PercentageEntityRecognizer = 'Microsoft.PercentageEntityRecognizer',
  PhoneNumberEntityRecognizer = 'Microsoft.PhoneNumberEntityRecognizer',
  QnAMakerDialog = 'Microsoft.QnAMakerDialog',
  QnAMakerRecognizer = 'Microsoft.QnAMakerRecognizer',
  RandomSelector = 'Microsoft.RandomSelector',
  RecognizerSet = 'Microsoft.RecognizerSet',
  RegexEntityRecognizer = 'Microsoft.RegexEntityRecognizer',
  RegexRecognizer = 'Microsoft.RegexRecognizer',
  RepeatDialog = 'Microsoft.RepeatDialog',
  ReplaceDialog = 'Microsoft.ReplaceDialog',
  SendActivity = 'Microsoft.SendActivity',
  SetProperties = 'Microsoft.SetProperties',
  SetProperty = 'Microsoft.SetProperty',
  SignOutUser = 'Microsoft.SignOutUser',
  StaticActivityTemplate = 'Microsoft.StaticActivityTemplate',
  SwitchCondition = 'Microsoft.SwitchCondition',
  TemperatureEntityRecognizer = 'Microsoft.TemperatureEntityRecognizer',
  // Test.AssertCondition = 'Microsoft.Test.AssertCondition',
  // Test.AssertReply = 'Microsoft.Test.AssertReply',
  // Test.AssertReplyActivity = 'Microsoft.Test.AssertReplyActivity',
  // Test.AssertReplyOneOf = 'Microsoft.Test.AssertReplyOneOf',
  // Test.Script = 'Microsoft.Test.Script',
  // Test.UserActivity = 'Microsoft.Test.UserActivity',
  // Test.UserConversationUpdate = 'Microsoft.Test.UserConversationUpdate',
  // Test.UserDelay = 'Microsoft.Test.UserDelay',
  // Test.UserSays = 'Microsoft.Test.UserSays',
  // Test.UserTyping = 'Microsoft.Test.UserTyping',
  TextInput = 'Microsoft.TextInput',
  TextTemplate = 'Microsoft.TextTemplate',
  TraceActivity = 'Microsoft.TraceActivity',
  TrueSelector = 'Microsoft.TrueSelector',
  UpdateActivity = 'Microsoft.UpdateActivity',
  UrlEntityRecognizer = 'Microsoft.UrlEntityRecognizer',
}

export interface OBISchema extends JSONSchema6 {
  $schema?: string;
  $role?: string;
  $type?: SDKTypes;
  $copy?: string;
  $id?: string;
  $designer?: {
    id: string;
    [key: string]: any;
  };
  description?: string;
  definitions?: any;
  title?: string;
  __additional_property?: boolean;
}
