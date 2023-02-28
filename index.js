const { Requester, Validator } = require('@chainlink/external-adapter')
require('dotenv').config()
 
// Define custom error scenarios for the API.
// Return true for the adapter to retry.
const customError = (data) => {
 if (data.Response === 'Error') return true
 return false
}

// Define your custom parameters to be used by the adapter.
// Extra parameters can be stated in the extra object



const customParams = {
 ip: ['ip'],
 endpoint: false
}
const createRequest = (input, callback) => {
 // The Validator helps you validate the Chainlink request data
 const validator = new Validator(callback, input, customParams)
 const jobRunID = validator.validated.id
 const API_KEY = process.env.API_KEY
 const ip = validator.validated.data.ip
 const url = `https://otx.alienvault.com/api/v1/indicators/IPv4/${ip}`

 // This is the parameters that the external API requires
 const params = {
   ip
 }


 // API Key is located in .env, it is advised not to be hardcoded
 const headers = {
       "OTX-KEY": '${API_KEY}' }

// This is where you add method and headers
 // you can add method like GET or POST and add it to the config
 // The default is GET requests
 // method = 'get'  
 // headers = 'headers...'
 const config = {
   url,
   params,
   headers
 }

// The Requester allows API calls be retry in case of timeout
 // or connection failure
 Requester.request(config, customError)
   .then(response => {
     // It's common practice to store the desired value at the top-level
     // result key. This allows different adapters to be compatible with
     // one another.
     callback(response.status, Requester.success(jobRunID, response))
   })
   .catch(error => {
     callback(500, Requester.errored(jobRunID, error))
   })
}


// This allows the function to be exported for testing
// or for running in express
module.exports.createRequest = createRequest



