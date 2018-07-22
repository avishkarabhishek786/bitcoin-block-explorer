const express = require('express')
const router = express.Router()
const axios = require('axios')
const {check, validationResult} = require('express-validator/check')
const {matchedData, sanitize} = require('express-validator/filter')
const _ = require('lodash')
const client = require('./server')

router.get('/', (req, res)=>{
  res.render('index')
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
  let param = _.pick(req.body, ['addr', 'txid', 'amnt', 'sendaddr'])
  const addr = param.addr
  const senderAddr = param.sendaddr  // Sender address
  const amountToSend = parseFloat(param.amnt)  // amount to be sent to sender
  const txid = param.txid  // txid from where the balance came from in addr

  try {
    client.dumpPrivKey(addr).then(pk=>{ 
      let prikey = pk; // cTPxN1TE9EBuXFFScCVVG9v9hKmkxEGfSRQFCQ7sSG4zyCLYzakc
      let url = `https://testnet.florincoin.info/api/getrawtransaction?txid=${txid}&decrypt=1`
      // console.log('address: '+addr);
      // console.log(`txid: ${txid}`);
      // console.log(`prikey: ${prikey}`);
      var self = this;
      axios.get(url)
      .then((response)=> {  
        if (typeof response.data.vout !== 'undefined' && response.data.vout.length>0) {
         for (let i = 0; i < response.data.vout.length; i++) {
           const element = response.data.vout[i];
           if (parseFloat(amountToSend) <= parseFloat(element.value)) {
              let input = [{"txid": txid,"vout":element.n}]
              //let output = `{"${senderAddr}":"${amountToSend}"}`
              let output = new Object({senderAddr:amountToSend});
              //output.map(({ id }) => ({ label: id}));
              Object.keys(output).map(({senderAddr})=>({senderAddr:senderAddr}))
              console.log(output);
              
              // client.createRawTransaction(input, output).then(raw=>{
              //   console.log(raw);
              //   //return raw;
              // })
              break;
           } else {
             console.log(`This amount is less than the required amount.`)
           }
         } 
        }
      })
      // .then(rawtx=>{

      // })
      .catch(function (error) {
        console.log(error);
      });      

    })
  } catch (e) {
    console.error(e);
  }
})

router.get('/test', (req, res)=>{
  res.render('test', {title:'Testing page'})
})


module.exports = router
