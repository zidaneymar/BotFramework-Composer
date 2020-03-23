## Bot Project
Bot project is the launcher project for the bots written in declarative form (JSON), using the Composer, for the Bot Framework SDK.

## Instructions for setting up the Bot Project runtime
The Bot Project is a regular Bot Framework SDK V4 project. Before you can launch it from the emulator, you need to make sure you can run the bot. 

### Prerequisite:
* Install .Netcore 3.1

### Commands:

* from root folder 
* cd BotProject
* cd Templates/CSharp
* dotnet user-secrets init // init the user secret id
* dotnet build // build
* dotnet run // start the bot
* It will start a web server and listening at http://localhost:3979.

### Test bot
* You can set you emulator to connect to http://localhost:3979/api/messages.

## CutomElements

### HttpRecognizer

{
    "$kind": "Microsoft.HttpRecognizer",
    "method": "Get",
    "url": "http://127.0.0.1:5000/query_app/id/${uriComponent(turn.activity.text)}",
    "intents": "\\{${join(foreach(cats,cat,concat(cat.key,':{\"score\":\"',string(cat.value),'\"}')),',')}\\}",
    "entities": "{\"itemTitle\": [ ${join(foreach(where(ents,x,x[0]=='itemTitle'),x,concat('\"',x[1],'\"')),',')} ], \"listType\": [ ${join(foreach(where(ents,x,x[0]=='listType'),x,concat('\"',x[1],'\"')),',')} ]}"
}

### SpacyRecognizer

{
    "$kind": "Microsoft.SpacyRecognizer",
    "endpoint": "http://127.0.0.1:5000",
    "applicationId": "id"
}
