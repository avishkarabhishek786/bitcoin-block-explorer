const express = require('express')
const router = express.Router()
const axios = require('axios')
const {check, validationResult} = require('express-validator/check')
const {matchedData, sanitize} = require('express-validator/filter')
const _ = require('lodash')
var util = require('util')
const client = require('./server')
const funcs = require('./public/js/funcs') 

router.get('/', (req, res)=>{
  res.render('index', {
    title: 'getBlock',
    errors: {},
    data: {}
  })
})

router.get('/getBlock', (req, res)=>{
  res.render('getBlock', {
    title: 'getBlock',
    errors: {},
    data: {}
  })
})

router.post('/getBlock', (req, res)=>{

    let body = _.pick(req.body, ['blockhash']);
    let blockhash = body.blockhash;
    // if (blockhash.length !== 64) {
    //   req.flash('danger', 'Please provide a valid hash.')
    //   return res.render('blockhash', {
    //     data:req.body,
    //     errors: 'Hash must be of 64 charecters.',
    //     title: 'Blockhash'
    //   })
    // }

    try {
      console.log('Getting data from the Blockchain...');
      client.getBlock(blockhash, 2)
      .then(data=>
        res.send(data)
      )
    } catch (e) {
      console.log(e);
    }
})

router.post('/getbestblockhash', (req, res)=> {
  let param = _.pick(req.body, ['bestblockhash'])
  let bestblockhash = param.bestblockhash;
  
  try {
    client.getBestBlockHash().then(hash=>{
      console.log(hash);
      res.json({"getbestblockhash":hash})
    })    
  } catch (error) {
    console.log(error)
  }
})

/**getblockchaininfo */
router.post('/getblockchaininfo', (req, res)=>{
  try {
    client.getBlockchainInfo().then(info=>{
      console.log(info);
      res.json({"getblockchaininfo": info})
    })
  } catch (error) {
    console.log(error);
  }
})

/**getchaintips */
router.post('/getchaintips', (req, res)=>{
  try {
    client.getChainTips().then(height=>{
      res.json({getchaintips:height})
    })
  } catch (error) {
    console.log(error);
  }   
})

/**getblockcount */
router.post('/getblockcount', (req, res)=>{
  try {
    client.getBlockCount().then(count=>{
      res.json({getblockcount:count})
    })
  } catch (error) {
    console.log(error);
  }   
})

/**getconnectioncount */
router.post('/getconnectioncount', (req, res)=>{
  try {
    client.getConnectionCount().then(count=>{
      res.json({getconnectioncount:count})
    })
  } catch (error) {
    console.log(error);
  }   
})

/**getmemoryinfo */
router.post('/getmemoryinfo', (req, res)=>{
  try {
    client.getMemoryInfo().then(info=>{
      res.json({getmemoryinfo:info})
    })
  } catch (error) {
    console.error(error)
  }
})



router.get('/rawtransaction', (req, res)=>{
  res.render('rawtransaction', {
    title: 'rawtransaction',
    errors: {},
    data: {}
  })
})

router.post('/listunspent', (req, res)=>{
  try {
    client.listUnspent().then(data=>{
      res.json({'listUnspent':data})
    })
  } catch (error) {
    console.error(error);    
  }
})

router.post('/rawtransaction', (req, res)=>{

  let params = _.pick(req.body, ['txArr', 'voutArr', 'sendaddr', 'amnt', 'tx_amount'])

  const senderAddr = params.sendaddr  // Sender address
  const amountToSend = parseFloat(params.amnt) // amount to be sent to sender
  const amountInTx = parseFloat(params.tx_amount) // Sum amount in txes
  const fee = 0.0001 //miner's fee
  const change = (amountInTx - amountToSend - fee).toFixed(6);

  console.log(change<0.0001);
  
  if ((change<0.0001)==true) {
    res.json({"error":true, "msg":"Insufficient change", "data":null});
    return;
  }

  const input = [];
  
  if (params.txArr.length !== params.voutArr.length) {
    res.json({"error":true, "msg":"tx and vout mismatch", "data":null});
    return;
  } 

  for (let i = 0; i < params.txArr.length; i++) {
    const txid = params.txArr[i];
    const vout = parseInt(params.voutArr[i]);
    input.push({"txid":txid, "vout":vout});
  }

  funcs.newChangeAddr().then(changeAddr=>{
    const output = new Object({[senderAddr]:amountToSend, [changeAddr]:change});
    //console.log(input);
    //console.log(output);  

    try {
      client.createRawTransaction(input, output)
      .then(hex=>{
        if (hex==null) {
          res.json({"error":true, "msg":"Raw transaction could not be created.", "data":null});
        }
        //console.log(hex)
        try {
          client.decodeRawTransaction(hex)
          .then(dhex=>
            res.json(
            {
              "error":false, 
              "msg":"Raw tx decoded successfully.", 
              "data":[hex, dhex]
            }
          ))
        } catch (error) {
          console.error(error);
        }
      })
    } catch (error) {
      console.log(error);
    } 

  });
  
})

router.post('/sendrawtx', (req, res)=>{

  let data = _.pick(req.body, ['job', 'hex'])
  
  if (typeof data.job == undefined || typeof data.hex==undefined ||  data.job!=="sendtx" || data.hex.length<0) {
    res.json({"error":true, "msg":"Invalid request", "data":null});
    return;
  }

  let raw = data.hex;
  console.log(`unsignedrawtx: ${raw}`);

  try {
    client.signRawTransaction(raw).then(signtx=>{
      console.log(`signedrawtx status: ${signtx.complete}`);
      console.log(`signedrawtx hex: ${signtx.hex}`);
      if(signtx.complete==true) {
        client.sendRawTransaction(signtx.hex).then(txid=>{
          console.log(`txid: ${txid}`);
          res.json({'signedtxid':txid});
        }).catch(function (error) {
          console.log(error);
        });
      } else {
        res.json({'signedtxid':null});
      }
    }).catch(function (error) {
      console.log(error);
    });
  } catch (error) {
    console.error(error)
  } 

})

/**MultiSig Operations */

/**6.1: Sending a Transaction with a Multsig */

router.get('/multisig', (req, res)=>{
  res.render('multisig', {
    title: 'multisig',
    errors: {},
    data: {}
  })
})

router.post('/createmultisig', (req, res)=>{
  let params = _.pick(req.body, ['m', 'keys'])

  let m = parseInt(params.m)
  let pubkeys = params.keys.split(",")
  //0394a88bd5c7daff2cacbd8e95f3f3a742434987d64d4f5d81cc1c8864d116e6db, 033ca57a4330838bde32e2916e5894e2d50a893e3087107556691d5eb2cb1760f7
  
  if (m > pubkeys.length || pubkeys.length<1 || m < 1) {
    res.json({"error":true, "msg":"Invalid m and n values.", data:null})
    return
  }

  let pubkeyarr = []

  for (let p = 0; p < pubkeys.length; p++) {
    const pubkey = pubkeys[p];
    pubkeyarr.push(_.trim(pubkey))
  } 

  try {
    client.createMultiSig(m, pubkeyarr).then(multisig=>{
      res.json({"error":false, "msg":"Multisig address created successfully!", data:multisig})
      return
    }).catch(e=>{
      console.error(e.message)
      res.json({"error":true, "msg":`RPC ERROR: ${e.message}`, data:null})
      return
    })
  } catch (error) {
    console.error(error);
  }

})

/**6.2: Spending a Transaction with a Multisig */
router.get('/spendmultisig', (req, res)=>{
  res.render('spendmultisig', {
    title: 'multisig',
    errors: {},
    data: {}
  })
})

router.post('/importaddress', (req, res)=>{
  let params = _.pick(req.body, ['job', 'addr'])
  let addr = _.trim(params.addr)

  if(_.trim(params.job)==undefined || _.trim(params.job)=="") {
    res.json({error:true, msg:"Invalid request", data:null})
    return
  }

  if(addr==undefined || addr=="") {
    res.json({error:true, msg:"Please specify a valid address.", data:null})
    return
  }

  try {
    client.validateAddress(addr).then(res=>{
      if(res.isvalid==undefined || res.isvalid==false) {
        res.json({error:true, msg:"Invalid address", data:null})
        return
      }
      client.importAddress(res.address).then(vaddr=>{
        console.log(vaddr);
        res.json({error:false, msg:"Please wait while the wallet rescanning is finished!", data:null})
        return
      }).catch((e)=>{
        console.error(e);
      })
    }).catch((e)=>{
      console.error(e);
    })
  } catch (error) {
    console.error(error);
    
  }
  
  
})



router.post('/test', (req, res)=>{
  funcs.newChangeAddr().then(changeAddr=>res.json({"res": changeAddr}));
})


module.exports = router
