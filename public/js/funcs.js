const client = require('../../server')
const _ = require('lodash')

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

let isAddressValid = (addr) => {
    return new Promise((resolve, reject)=>{
        address = _.trim(addr)
        try {
        return client.validateAddress(address).then(res=>{
            if (res==undefined) {
                return reject(error)
            }
            if (res.isvalid!==true) {
               return reject(error)          
            }
            return res;
        }).then(response=>{
            return resolve(response.address)
        })
        } catch (error) {
            return reject(error)
        } 
    }).catch ((error)=>{
        console.error(error);
    })
}

module.exports = {
    newChangeAddr,
    isAddressValid
}