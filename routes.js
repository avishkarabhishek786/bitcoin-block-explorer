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
    res.json({"error":true, "msg":"Insufficient change"});
    return;
  }

  const input = [];
  
  if (params.txArr.length !== params.voutArr.length) {
    res.json({"error":true, "msg":"tx and vout mismatch"});
    return;
  } 

  for (let i = 0; i < params.txArr.length; i++) {
    const txid = params.txArr[i];
    const vout = parseInt(params.voutArr[i]);
    input.push({"txid":txid, "vout":vout});
  }

  funcs.newChangeAddr().then(changeAddr=>{
    const output = new Object({[senderAddr]:amountToSend, [changeAddr]:change});
    console.log(input);
    console.log(output);  

    try {
      client.createRawTransaction(input, output)
      .then(hex=>console.log(hex))
    } catch (error) {
      console.log(error);
    } 

  });
  
})


router.post('/test', (req, res)=>{
  funcs.newChangeAddr().then(changeAddr=>res.json({"res": changeAddr}));
})


module.exports = router
