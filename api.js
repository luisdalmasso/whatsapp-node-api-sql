function timeConverter(UNIX_timestamp){
    var a = new Date(UNIX_timestamp * 1000);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var months = ['01','02','03','04','05','06','07','08','09','10','11','12'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours()< 10 ? '0' + a.getHours() : a.getHours();
    var min = a.getMinutes() < 10 ? '0' + a.getMinutes() : a.getMinutes();
    var sec = a.getSeconds()< 10 ? '0' + a.getSeconds(): a.getSeconds();
    
    var time = month + '/' + date + '/' + year + ' ' + hour + ':' + min + ':' + sec ;
    return time;
}


function GuardaMensaje(msg) {

ccmd = "SET QUOTED_IDENTIFIER OFF  exec [dbo].[wa_mensaje_nuevo] ";
var cbody = JSON.stringify(msg.body);
cbody = cbody.replace(/"/gi, '');
if (msg.author == undefined || JSON.stringify(msg.author) == 'status@broadcast') {
    cquien = JSON.stringify(msg.from).split("@");
} else {
    cquien = JSON.stringify(msg.author).split("@")
};
var cchat = JSON.stringify(msg.id.remote).split("@");
var fecha = moment(timeConverter(JSON.stringify(msg.timestamp)), 'DD/MM/YYYY HH:mm:ss').subtract(16600, 'seconds').format('YYYY/MM/DD HH:mm:ss')
ccmd = ccmd + "'" + cbody + "' , '" + JSON.stringify(msg.ack) + "' ,'" + cquien[0].replace(/"/gi, '') + "'," + JSON.stringify(msg.id.id) + "," + JSON.stringify(msg.type) + ",'" + cchat[0].replace(/"/gi, '') + "'," + JSON.stringify(msg.timestamp) + ",'" + dispositivo + "'";
sql.connect(configsql, function (err) {
    var request = new sql.Request();
    request.query(ccmd, function (err, recordset) { });
});

};

var moment = require('moment');
const express = require("express");
const bodyParser = require("body-parser");
const fs = require('fs');
const axios = require('axios');
const shelljs = require('shelljs');
var limit=100
const sql = require('mssql');
var configsql = {
    server: 'desarrollo2012',
    database: 'ssalud',
    user: 'websis',
    password: '123456',
    port: 1433,
    options: {
        encrypt: false ,
        enableArithAbort: true
    }
    };
//var configsql =require('./configsql.json');


global.config  = require('./config.json');
const { Client } = require('whatsapp-web.js');
const SESSION_FILE_PATH = './session.json';
let sessionCfg;
if (fs.existsSync(SESSION_FILE_PATH)) {
    sessionCfg = require(SESSION_FILE_PATH);
}
process.title = "whatsapp-node-api";
global.client = new Client({ puppeteer: { headless: true , args:['--no-sandbox','--disable-setuid-sandbox','--unhandled-rejections=strict'] }, session: sessionCfg});
global.authed = false;
global.dispositivo=""

const app = express();

const port = process.env.PORT || config.port;
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

client.on('qr', qr => {
    fs.writeFileSync('./components/last.qr',qr);
});

client.on('authenticated', (session) => {
    console.log("AUTH!");
    sessionCfg = session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function(err) {
        if (err) {
            console.error(err);
        }
        dispositivo=config.nrotel
        ccmd2 = "SET QUOTED_IDENTIFIER OFF  select numero from wa_dispositivos where token= '"+session.WABrowserId.replace(/"/gi,'')+"'";        
        sql.connect(configsql, function (err) {
            var request = new sql.Request();
            request.query(ccmd2, function (err, recordset) {
                if (err) console.log(err)
                                  // console.log(recordset)  
                    if (recordset == undefined || recordset.recordset[0] == '') {
                    if (config.nrotel != undefined ) {
                        ccmd2 = "SET QUOTED_IDENTIFIER OFF  exec [dbo].[wa_alta_dispo]  '"+session.WABrowserId.replace(/"/gi,'')+"','"+config.nrotel.toString()+"'";        
                       // console.log(ccmd2)
                      
                        sql.connect(configsql, function (err) {
                            var request = new sql.Request();
                            request.query(ccmd2, function (err, recordset) {
                                if (err) console.log(err)
                            });
                        });
                    }
                }
                authed=true;
                console.log("Whatsapp Configurado y autenticado con Nro", dispositivo)               
            });
        }); 
        
    });
    try{
        fs.unlinkSync('./components/last.qr')
    }catch(err){}

});

client.on('auth_failure', () => {
    console.log("AUTH Failed !")
    sessionCfg = ""
    process.exit()
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', async msg => {   
        //INSERT        
        //IattachmentData = {};
    const attachmentData = await msg.downloadMedia();

          
// UPDATE

    if (msg.hasMedia) {
        if (config.pathmedia != "") {
            var FilePath = attachmentData.filename == undefined ? JSON.stringify(msg.id.id) : attachmentData.filename;
            aext = attachmentData.mimetype.split('/')
            sext = aext[1].includes('ogg') ? '.ogg' : '.' + aext[1]
            FilePath = config.pathmedia + FilePath.replace(/"/gi, '') + sext
            console.log(FilePath, attachmentData.mimetype);
            await fs.writeFileSync(FilePath, attachmentData.data, 'base64');
        };
        if (config.sqlmedia = "S") {
            ccmd2 = "SET QUOTED_IDENTIFIER OFF  exec [dbo].[wa_mensaje_media] ";
            ccmd2 = ccmd2 + JSON.stringify(msg.id.id) + ',"' + attachmentData.data + '","' + attachmentData.mimetype + '","' + dispositivo + '"';
            sql.connect(configsql, function (err) {
                var request = new sql.Request();
                request.query(ccmd2, function (err, recordset) {
                    if (err) console.log(err)
                });
            });
        };
    };
        GuardaMensaje(msg);
        
        let elchat = JSON.stringify(msg.from).replace(/"/gi, ''); //  '5492615393332@c.us'  JSON.stringify(msg.from)
        let mchat1 = await client.getChatById(elchat);
        let mmsgs = await mchat1.fetchMessages({ limit: 200 });   // lee los ultimos 200 mensajes del chat
        console.log(mmsgs.length)
        var i;
        for (i = 0; i < mmsgs.length; i++) {
            msg1 = mmsgs[i];
            GuardaMensaje(msg1);
            if (msg1.hasMedia) {
                const attachmentData = await msg.downloadMedia();
                if (msg.hasMedia) {
                    if (config.pathmedia != "") {
                        var FilePath = attachmentData.filename == undefined ? JSON.stringify(msg.id.id) : attachmentData.filename;
                        aext = attachmentData.mimetype.split('/')
                        sext = aext[1].includes('ogg') ? '.ogg' : '.' + aext[1]
                        FilePath = config.pathmedia + FilePath.replace(/"/gi, '') + sext
                        console.log(FilePath, attachmentData.mimetype);
                        await fs.writeFileSync(FilePath, attachmentData.data, 'base64');
                    };
                    if (config.sqlmedia = "S") {
                    ccmd2 = "SET QUOTED_IDENTIFIER OFF  exec [dbo].[wa_mensaje_media] ";
                    ccmd2 = ccmd2 + JSON.stringify(msg.id.id) + ',"' + attachmentData.data + '","' + attachmentData.mimetype + '","' + dispositivo + '"';
                    sql.connect(configsql, function (err) {
                        var request = new sql.Request();
                        request.query(ccmd2, function (err, recordset) {
                            if (err) console.log(err)
                        });
                    });
                    };
                };
            }; 
         }; 
 });  


client.initialize();

const chatRoute = require('./components/chatting');
const groupRoute = require('./components/group');
const authRoute = require('./components/auth');
const contactRoute = require('./components/contact');

app.use(function(req,res,next){
    //console.log(req.method + ' : ' + req.path);
    next();
});
app.use('/chat',chatRoute);
app.use('/group',groupRoute);
app.use('/auth',authRoute);
app.use('/contact',contactRoute);

app.listen(port, () => {
    console.log("Server Running Live on Port : " + port);
});

function utf8_from_str(s) {
    for(var i=0, enc = encodeURIComponent(s), a = []; i < enc.length;) {
        if(enc[i] === '%') {
            a.push(parseInt(enc.substr(i+1, 2), 16))
            i += 3
        } else {
            a.push(enc.charCodeAt(i++))
        }
    }
    return a
}
