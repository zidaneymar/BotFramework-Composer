// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using AdaptiveExpressions.Properties;
using Microsoft.Bot.Builder;
using Microsoft.Bot.Builder.AI.Luis;
using Microsoft.Bot.Builder.Dialogs;
using Microsoft.Bot.Schema;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace BotProject.CustomElements
{
    public class SpacyRecognizer : Recognizer
    {
        [JsonProperty("$kind")]
        public const string DeclarativeType = "Microsoft.SpacyRecognizer";

        public SpacyRecognizer()
        {
        }

        /// <summary>
        /// Gets or sets application ID.
        /// </summary>
        /// <value>Application ID.</value>
        [JsonProperty("applicationId")]
        public StringExpression ApplicationId { get; set; }

        /// <summary>
        /// Gets or sets endpoint like http://127.0.0.1:5000 to query.
        /// </summary>
        /// <value>LUIS Endpoint.</value>
        [JsonProperty("endpoint")]
        public StringExpression Endpoint { get; set; }

        public override async Task<RecognizerResult> RecognizeAsync(DialogContext dialogContext, Activity activity, CancellationToken cancellationToken = default, Dictionary<string, string> telemetryProperties = null, Dictionary<string, double> telemetryMetrics = null)
        {
            var utterance = activity.Text;

            RecognizerResult recognizerResult = null;

            if (string.IsNullOrWhiteSpace(utterance))
            {
                recognizerResult = new RecognizerResult
                {
                    Text = utterance,
                    Intents = new Dictionary<string, IntentScore>() { { string.Empty, new IntentScore() { Score = 1.0 } } },
                    Entities = new JObject(),
                };
            }
            else
            {
                var httpClient = new HttpClient();

                var uri = BuildUri(dialogContext);
                var content = BuildRequestBody(utterance);
                var response = await httpClient.PostAsync(uri.Uri, new StringContent(content.ToString(), System.Text.Encoding.UTF8, "application/json")).ConfigureAwait(false);
                response.EnsureSuccessStatusCode();
                var luisResponse = (JObject)JsonConvert.DeserializeObject(await response.Content.ReadAsStringAsync().ConfigureAwait(false));
                recognizerResult = new RecognizerResult();

                recognizerResult.Text = utterance;
                recognizerResult.Intents = GetIntents(luisResponse);
                recognizerResult.Entities = ExtractEntitiesAndMetadata(luisResponse);
            }

            return recognizerResult;
        }

        // Follow botbuilder-dotnet\libraries\Microsoft.Bot.Builder.AI.LUIS\V3\LuisUtil.cs
        internal static string NormalizedIntent(string intent) => intent.Replace('.', '_').Replace(' ', '_');

        internal static IDictionary<string, IntentScore> GetIntents(JObject luisResult)
        {
            var result = new Dictionary<string, IntentScore>();
            var intents = (JObject)luisResult["cats"];
            if (intents != null)
            {
                foreach (var intent in intents)
                {
                    result.Add(NormalizedIntent(intent.Key), new IntentScore { Score = intent.Value.Value<double>() });
                }
            }

            return result;
        }

        internal static string NormalizeEntity(string entity)
        {
            // Type::Role -> Role
            var type = entity.Split(':').Last();
            return type.Replace('.', '_').Replace(' ', '_');
        }

        internal static JObject ExtractEntitiesAndMetadata(JObject prediction)
        {
            var entities = (JArray)prediction["ents"];
            if (entities != null)
            {
                var result = new JObject();
                foreach (var entity in entities)
                {
                    var arr = (JArray)entity;
                    var name = NormalizeEntity(arr[0].ToString());
                    var val = arr[1].ToString();
                    if (!result.ContainsKey(name))
                    {
                        result.Add(name, new JArray());
                    }

                    ((JArray)result[name]).Add(val);
                }

                return result;
            }

            return null;
        }

        // Follow botbuilder-dotnet\libraries\Microsoft.Bot.Builder.AI.LUIS\LuisRecognizerOptionsV3.cs
        private UriBuilder BuildUri(DialogContext dialogContext)
        {
            var dcState = dialogContext.GetState();
            var endPoint = Endpoint.GetValue(dcState);
            var id = ApplicationId.GetValue(dcState);
            return new UriBuilder($"{endPoint}/query_app/{id}");
        }

        private JObject BuildRequestBody(string utterance)
        {
            var content = new JObject
            {
                { "query", utterance },
            };

            return content;
        }
    }
}
