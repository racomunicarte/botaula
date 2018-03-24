const AzureRequests = require('./azure-request')

 class AzureEmotion extends AzureRequests{

     constructor(){
         const ENDPOINt = `${process.env.MICROSOFT_VISION_API_ENDPOINT}` 
         const KEY = `${process.env.MICROSOFT_VISION_API_KEY}`
         super(ENDPOINt, KEY)
     }
 }

 module.exports = AzureEmotion