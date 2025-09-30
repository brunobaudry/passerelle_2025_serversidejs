// const url = require('node:url'); //
const http = require('http');
const myHost = 'localhost';
const myPort = 3000;

/***********************************
 * Open and Read a database
 ***********************************/
const fs = require('node:fs');
const myData = JSON.parse(fs.readFileSync('js/data.json'));

const server =  http.createServer((req,rep)=>{
    /*********************************
     *  URL helper 
     * ******************************/
    let myURL = new URL(`http://${myHost}:${myPort}${req.url}`);
    rep.setHeader('Content-Type','text*html');
    let myHTML = '';
    if(req.method === 'GET'){ //NEW
        if(myURL.pathname === '/'){
            // Root request.
            myHTML = fs.readFileSync('static/index.html');
        }else if (fs.existsSync(`static/${myURL.pathname}.html`)){
            myHTML = fs.readFileSync(`static/${myURL.pathname}.html`);
        }else if(fs.existsSync(`templates/${myURL.pathname}.html`)){
            let TITLE = myURL.pathname.replace('/','').toUpperCase();
            myHTML = fs.readFileSync(`templates/${myURL.pathname}.html`).toString();
            myHTML = myHTML.replaceAll('<%TITLE%>', TITLE );
        }else if(fs.existsSync('.'+myURL.pathname)){
            console.log(myURL.pathname, 'exists');
           myHTML = fs.readFileSync('.'+myURL.pathname);
        }
        else{
            rep.write('404');
            console.warn(myURL.pathname, 404);
        }
        rep.write(myHTML);
        return rep.end();
    }else if (req.method === 'POST'){//NEW
        let body = '';
        // Collect data chunks.
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const url = new URL(`http://${myHost}:${myPort}${req.url}?${body}`);
                // Simple version, need to save it in a better way.
                fs.appendFileSync('formdata.txt',url.searchParams.toString());
                rep.writeHead(200, { 'Content-Type':'text/html'});
                rep.end(fs.readFileSync('static/thankyou.html'));
            } catch (err) {
                rep.writeHead(400, { 'Content-Type': 'text/plain' });
                rep.end('Invalid JSON');
            }
        });
    }
    
});
/****************
 * START SERVER
 ***************/ 
server.listen(myPort,myHost);
