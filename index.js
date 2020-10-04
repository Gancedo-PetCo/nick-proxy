const express = require('express');
const serveStatic = require('serve-static');
const axios = require('axios');
const fs = require('fs');
const { promisifyAll } = require('bluebird');
const { ImagesSecret, ImagesIP } = require('./config.js');
const cors = require('cors');
// const morgan = require('morgan');
require('newrelic');

const server = express();
const PORT = 3000;
server.use(cors());

// server.use(morgan('dev'));
// const mode = 'CSR';
const mode = 'SSR';
const SSRcountTotal = 4;
let SSRcount = 0;

if (mode === 'CSR') {
  server.use(serveStatic('./client/'));

  server.get('/product/:itemId', (req, res) => {
    const { itemID } = req.params;
    const itemIdNumber = Number.parseInt(itemID, 10);

    if (itemIdNumber < 100 || itemIdNumber > 10000099 || itemIdNumber === undefined) {
      res.status(404).send('itemID invalid');
    } else {
      res.sendFile(`${__dirname}/client/index.html`);
    }
  });

  server.listen(PORT, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log(`Listening at port ${PORT}`);
    }
  });
  //-------------------------------------------
  //End CSR
  //-------------------------------------------
  //-------------------------------------------
  //Start SSR
  //-------------------------------------------
} else if (mode === 'SSR') {
  //-------------
  //This first seciton of code is responsible for contacting all services and fetching bundles/module files
  //and then saving them to disc
  //-------------

  server.use(serveStatic('SSR'));
  //For every service, enter a tuple with position 0 as URL address to get bundle and position 0 as file path/file name
  //to store that bundle locally. Whenever adding a new bundle, don't forget to increase SRRcountTotal
  const bundleLocations = [[`http://${ImagesIP}:3003/bundle.js`, './SSR/imagesBundle.js']];

  bundleLocations.forEach((bundleTuple) => {
    axios.get(bundleTuple[0])
      .then((response) => {
        const { data } = response;
        fs.writeFileSync(bundleTuple[1], data);
        SSRcount++;
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send(err);
      });
  });

  //same as for bundleLocations except this array focuses on the .jsx modules and, so public doesn't have access
  //a key is needed to retrieve them. As such, inner arrays are triplets. SSRcountTotal should be increased by 1 per
  //module
  const moduleLocations = [
    [`http://${ImagesIP}:3003/module/index.jsx`, './Modules/Images/index.jsx', ImagesSecret],
    [`http://${ImagesIP}:3003/module/Gallery.jsx`, './Modules/Images/Gallery.jsx', ImagesSecret],
    [`http://${ImagesIP}:3003/module/CSS.js`, './Modules/Images/CSS.js', ImagesSecret],
  ];

  moduleLocations.forEach((moduleTriplet) => {
    axios({
      method: 'get',
      url: moduleTriplet[0],
      headers: { 'SDC_ACCESS_KEY': moduleTriplet[2] },
    })
      .then((response) => {
        const { data } = response;
        fs.writeFileSync(moduleTriplet[1], data);
        SSRcount++;
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send(err);
      });
  });
  //-------------
  //Start actual SSR generating code. As can be seen below, initiatePublicFacingSRRCode is a recursive function
  //which is always called with setTimeout. Basically, the funciton checks if all modules and bundles from
  //the services currently supported, have been saved to disc. If they have, then the server performs the tasks
  //needed to perform SSR and, finally, connects the server to the correct port. Otherwise, setTimepout is called
  //again on initiatePublicFacingSRRCode.
  //-------------
  const initiatePublicFacingSRRCode = function() {
    if (SSRcount === SSRcountTotal) {
      const React = require('react');
      const ReactDOMServer = require('react-dom/server');
      const generateHtmlSSR = require('./server/indexHTMLTemplate.js');
      const redis = require('redis');
      require('@babel/register');

      const client = redis.createClient();
      promisifyAll(client);

      //every service has a triplet array saved in the object "services". The value at position 0 is the URL
      //address needed to retrieve the API data necessary for SSR. Position 1 is for the key in which
      //the service specific SSR code will be saved to, in serviceModules. Position 2 is where the
      //entry file for the service's modules are located, locally. (which were retrieved above when the line
      //of code satrting with moduleLocations.forEach  was executed, above)
      const services = [
        [`http://${ImagesIP}:3003/itemImages/`, 'images', './Modules/Images/index.jsx'],
      ];

      const serviceModules = {};

      for (let i = 0; i < services.length; i++) {
        serviceModules[services[i][1]] = require(`${services[i][2]}`);
      }

      const generateSSR = function(itemId) {
        const servicesCalls = [];

        for (let i = 0; i < services.length; i++) {
          servicesCalls.push(axios.get(`${services[i][0]}${itemId}`)
            .then((response) => {
              const { data } = response;
              return data;
            })
            .catch((err) => {
              console.log(err);
            }));
        }

        return Promise.all(servicesCalls)
          .then((dataResponses) => {
            const { itemImages } = dataResponses[0];
            const imagesSSR = ReactDOMServer.renderToString(React.createElement(serviceModules['images'], { itemImages }, null));

            return generateHtmlSSR(imagesSSR);
          })
          .catch((err) => {
            console.log(err);
            res.status(500).send(err);
          });
      };

      server.get('/product/:itemId', (req, res) => {
        const { itemId } = req.params;
        const itemIdNumber = Number.parseInt(itemId, 10);

        if (itemIdNumber < 100 || itemIdNumber > 10000099 || itemIdNumber === undefined) {
          res.status(404).send('itemID invalid');
        } else {
          client.getAsync(`pSSR${itemId}`)
            .then((response) => {
              if (response) {
                res.status(200).send(response);
              } else {
                generateSSR(itemId)
                  .then((SSR) => {
                    res.status(200).send(SSR);
                    client.setAsync(`pSSR${itemId}`, SSR)
                      .catch((err) => {
                        console.log(err);
                      });
                  })
                  .catch((err) => {
                    console.log(err);
                    res.status(500).send(err);
                  });
              }
            })
            .catch((err) => {
              console.log(err);
              res.status(500).send(err);
            });
        }
      });

      server.listen(PORT, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log(`Listening at port ${PORT}`);
        }
      });
    } else {
      setTimeout(initiatePublicFacingSRRCode, 100);
    }
  };

  setTimeout(initiatePublicFacingSRRCode, 100);

  //----------------------
  //Service specific endpoints
  //----------------------
  server.get('/itemImages/:itemId', (req, res) => {
    const { itemId } = req.params;

    axios.get(`http://${ImagesIP}:3003/itemImages/${itemId}`)
      .then((response) => {
        const { data } = response;
        res.status(200).send(data);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send(err);
      });
  });
}
