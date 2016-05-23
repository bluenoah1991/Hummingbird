var restify = require('restify');
var builder = require('botbuilder');

var bot = new builder.BotConnectorBot({
	appId: '',
	appSecret: ''
});

bot.add('/', function(session){
	//debugger;
	session.send('Hello World');
});

var server = restify.createServer();
server.post('/api/messages', bot.verifyBotFramework(), bot.listen());
//server.post('/api/messages', bot.verifyBotFramework(), function(req, res){
//	debugger;
//});
server.listen(process.env.port || 3978, function() {
	console.log('%s listening to %s', server.name, server.url);
});
