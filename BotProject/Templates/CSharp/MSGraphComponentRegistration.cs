using System.Collections.Generic;
using Microsoft.Bot.Builder.ComposerBot.Json.Actions.MSGraph;
using Microsoft.Bot.Builder.ComposerBot.Json.Input;
using Microsoft.Bot.Builder.Dialogs.Declarative;

namespace Microsoft.Bot.Builder.ComposerBot.Json
{
    public class MSGraphComponentRegistration : ComponentRegistration
    {
        public IEnumerable<DeclarativeType> GetDeclarativeTypes()
        {
            // Actions
            yield return new DeclarativeType<CancelEvent>(CancelEvent.DeclarativeType);
            yield return new DeclarativeType<CreateEvent>(CreateEvent.DeclarativeType);
            yield return new DeclarativeType<CreateOnlineMeeting>(CreateOnlineMeeting.DeclarativeType);
            yield return new DeclarativeType<DeclineEvent>(DeclineEvent.DeclarativeType);
            yield return new DeclarativeType<FindMeetingTimes>(FindMeetingTimes.DeclarativeType);
            yield return new DeclarativeType<GetContacts>(GetContacts.DeclarativeType);
            yield return new DeclarativeType<GetEvents>(GetEvents.DeclarativeType);
            yield return new DeclarativeType<GetPeople>(GetPeople.DeclarativeType);
            yield return new DeclarativeType<UpdateEvent>(UpdateEvent.DeclarativeType);
            yield return new DeclarativeType<EventDateTimeInput>(EventDateTimeInput.DeclarativeType);
        }
    }
}