const express = require('express')
const router = express.Router()
const axios = require('axios')
const {check, validationResult} = require('express-validator/check')
const {matchedData, sanitize} = require('express-validator/filter')
const _ = require('lodash')
const client = require('./server')

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
              let output = new Object({[senderAddr]:amountToSend});
              
              client.createRawTransaction(input, output).then(raw=>{
                console.log(`unsignedrawtx: ${raw}`);
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
              })
              .catch(function (error) {
                console.log(error);
              });
              break;
           } else {
             console.log(`This amount is less than the required amount.`)
           }
         } 
        }
      })
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
