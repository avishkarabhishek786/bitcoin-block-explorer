const client = require('../../server')

let newChangeAddr = ()=>{
    
    return new Promise((resolve, reject)=>{
        client.getRawChangeAddress().then(changeAdr=>{
          if (typeof changeAdr==undefined) {
              return reject("Unable to get change address")
          } 
          return resolve(changeAdr)         
        }) 
    })
      
}

module.exports = {
    newChangeAddr
}