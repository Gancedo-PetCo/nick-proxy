const axios = require('axios');

//--------------------------
//Decide which tests to run
//--------------------------

// runTests should be true to actually test serverRPS. If running unit tests, set to false
// const runTests = true;
const runTests = false;

//For each test selected, 4 tests run. The first 3 are isolated tests where the selected
//RPS (see below for testsStorage) are run one time, over the course of a second. The fourth
// and final test is the "Stress Test" that makes the selected RPS every second for 60 seconds (option to change this added below).
//The Stress test causes errors at high RPS that are not due to internal server errors.
//Instead, they are due to connection time outs errors. And so the ability to run only
//the first three tests can be acheived by setting skipStressTest to true
//For unit tests, set to false
const skipStressTest = false;
// const skipStressTest = true;

//Stress test makes the selected amount of RPS per second for the numberOfStressTestCycles.
//For example, default of 60 amd an RPS of 500 means 500 requests made every second for
//60 seconds for a total of 30,000 requests.
//Not recommended to raise number above 60.
//Set to 60 for unit tests
const numberOfStressTestCycles = 60;

//httpRequestString is for index.html
//For unit tests. Use first
const httpRequestString = 'http://127.0.0.1:3000/product/';

//Decide what Series of RPS tests you want to run
//IMPORTANT - for POST testing, you can only run one RPS test at a time
const testsStorage = new Map();
//Every test is in the form of:
//Parameter 1: String representing how many RPS are being tested
//Parameter 2: Number representing how many requests should be made per second
// testsStorage.set('1RPS', 1);
// testsStorage.set('10RPS', 10);
// testsStorage.set('100RPS', 100);
// testsStorage.set('200RPS', 200);
// testsStorage.set('250RPS', 250);
// testsStorage.set('300RPS', 300);
// testsStorage.set('350RPS', 350);
// testsStorage.set('400RPS', 400);
// testsStorage.set('450RPS', 450);
// testsStorage.set('500RPS', 500);
// testsStorage.set('550RPS', 550);
// testsStorage.set('600RPS', 600);
testsStorage.set('1000RPS', 1000);

//To run a test where the traffic throughout the day is expected to be the same items, more or less, for a long
//period of time, set hotItems = to the require statement. Otherwise, the empty array
//For unit tests, set hotItems to an empty array
// const hotItems = require('./hotItems.js');
const hotItems = [];

//Even if site traffic is highly predictable, there is still some fluctuation and so hotItemProbability determines
//if a randomly selected hotItem is used for the query or if a random item is used. The roll made in generateQueries
//is from 0 to 1 and, if the roll is less than hotItemProbability, then a random item is used
// const hotItemProbability = 0.1;
const hotItemProbability = 0.05;
// const hotItemProbability = 0;

//--------------------------
//Generate test boundaries
//--------------------------

const generateHotItems = function() {
  let count = 1000;

  while (count > 0) {
    const roll = Math.ceil(Math.random() * 1000000 + 9000099);
    const hotItem = roll.toString();
    if (hotItems.indexOf(hotItem) === -1) {
      hotItems.push(hotItem);
      count--;
    }
  }
};

if (runTests && hotItems.length === 0) {
  generateHotItems();
}

//--------------------------
//Run tests
//--------------------------

const generateQueries = function (RPS) {
  let count = RPS;
  const queries = [];

  while (count > 0) {
    let itemId;
    const roll = Math.random();
    if (roll < hotItemProbability) {
      itemId = Math.floor(Math.random() * 9000000 + 100);
    } else {
      const index = Math.floor(Math.random() * 1000);
      itemId = hotItems[index];
    }
    queries.push(`${httpRequestString}${itemId}`);
    count--;
  }

  return queries;
};
let errorCount = 0;

const GET = function(request) {
  axios.get(request)
    // .then((response) => {
    //   // console.log(typeof(response.data));
    // })
    .catch((err) => {
      if (err) {
        console.log(err);
        errorCount++;
        console.log(errorCount);
      }
    });
};

const processedRequests = [];

const runIsolatedTest = function (RPS, requests) {
  let count = RPS;
  const delayBetweenRequests = 1000 / RPS;
  let generatedRequests = requests;

  if (!requests) {
    generatedRequests = generateQueries(RPS);
    console.log(`Running ${RPS} RPS Isolated Test at ${new Date()}`);
  }

  while (count > 0) {
    const index = count - 1;
    if (runTests) {
      setTimeout(GET.bind(null, generatedRequests[index]), delayBetweenRequests * count + 5000);
    } else {
      processedRequests.push(generatedRequests[index]);
    }
    count--;
  }
};

const runStressTest = function(RPS) {
  const testRequests = {};

  if (!skipStressTest) {
    let count = numberOfStressTestCycles;

    while (count > 0) {
      const requests = generateQueries(RPS);
      testRequests[`test${count}Requests`] = requests;
      count--;
    }
  }

  if (runTests) {
    if (!skipStressTest) {
      console.log(`Running ${RPS} RPS Stress Test at ${new Date()}`);
      let count = numberOfStressTestCycles;
      while (count > 0) {
        setTimeout(runIsolatedTest.bind(null, RPS, testRequests[`test${count}Requests`]), count * 1000 + 5000);
        count--;
      }
    }
  } else {
    return testRequests;
  }
};

const runAllTests = function() {
  const tests = [];
  const iteratorObject = testsStorage.keys();
  for (const key of iteratorObject) {
    tests.push(key);
  }

  const runTests = function(index) {
    const testName = tests[index];

    if (testName) {
      let count = 3;

      while (count > 0) {
        setTimeout(runIsolatedTest.bind(null, testsStorage.get(testName)), (count - 1) * 120000 + 10000);
        count--;
      }

      setTimeout(runStressTest.bind(null, testsStorage.get(testName)), 370000);
      setTimeout(runTests.bind(null, index + 1), 600000);
    }
  };

  setTimeout(runTests.bind(null, 0), 10000);
};

if (runTests) {
  runAllTests();
}

module.exports.hotItems = hotItems;
module.exports.generateHotItems = generateHotItems;
module.exports.generateQueries = generateQueries;
module.exports.processedRequests = processedRequests;
module.exports.runIsolatedTest = runIsolatedTest;
module.exports.runStressTest = runStressTest;
