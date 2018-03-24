// load env variables from the .env file
require('dotenv-extended').load()

const builder = require('botbuilder')
const restify = require('restify')
const utils = require('./utis')
const AzureEmotion = require('./azure-emotion-api')
const validUrl = require('valid-url')

//=========================================================
// Bot Setup
//=========================================================

const port = process.env.port || process.env.PORT || 3979
const server = restify.createServer()
server.listen(port, () => {
    console.log(`${server.name} listening to ${server.url}`)
})

const connector = new builder.ChatConnector({
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSOFT_APP_PASSWORD
})

const bot = new builder.UniversalBot(connector)
bot.set('storage', new builder.MemoryBotStorage())
server.post('/api/messages', connector.listen())

//=========================================================
// LUIS Dialogs
//=========================================================

const recognizer = new builder.LuisRecognizer(process.env.LUIS_MODEL_URL)

const intents = new builder.IntentDialog({
    recognizers: [recognizer]
})

// Trata a intenção None - atenção com o nome da intent que é case-sensitive
intents.onDefault((session, args) => {
    session.send(`Desculpe, não pude compreender **${session.message.text}**\n\nLembre-se que sou um bot e meu conhecimento é limitado.`)
})

intents.matches('apresentacao', (session, args) =>{
    sesseion.send('Ola eu sou um bot seja bem-vindo(a)')
})

const getImgUrl =(session) => utils.parseAnchorTag(session.message.text) || 
            (validUrl.isUri(session.message.text) ? session.message.text:null)


intents.matches('reconhecimento-facial',[
    (session) => {
        builder.Prompts.text(session, 'Me envia a URL')
    },
    (session, results) => {
        var imageUrl = getImgUrl(session)          
       
        if(imageUrl){
           var service = new AzureEmotion()
           service.findFromUrl(imageUrl)
           
           .then((response)=>{
               if(!response)
                return session.send('nao pude ler a imagem')

                const message = `Descricao: **${response.description.captions[0].text}**\n\n`
                   +  `Tags: **${response.description.tags.join(',')}**\n\n`
                    + `Tem pessoas nesta foto **${response.faces.length}**`
                
                    console.log(response)

                return session.send(message)           
           })
          .catch(()=>{
              session.send('error')
          })   
        
        
        } 

    }
   
])


bot.dialog('/', intents)