const path = require('path')
const express = require('express')
const routes = require('./routes')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
//const session = require('express-session');
const flash =  require('connect-flash');
const validator = require('express-validator');
const app = express()

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

const middleware = [
  express.static(path.join(__dirname, 'public')),
  bodyParser.urlencoded({extended:true}),
  cookieParser(),
  // session({
  //   secret: 'super-secret-key',
  //   key: 'super-secret-cookie',
  //   resave: false,
  //   saveUninitialized: false,
  //   cookie: { maxAge: 60000 }
  // }),
  validator(),
  flash()
]

app.use(middleware)

app.use('/', routes)

app.use((req, res, next)=>{
  res.status(404).send("404 ERROR: Page Not Found!")
})

app.use((err, req, res, next)=>{
  console.error(err.stack);
  res.status(500).send('500 Internal Error!')
})

app.listen(3000, (e)=>{
  if (!e) {
    console.log('App listenning on port 3000');
  }
})
