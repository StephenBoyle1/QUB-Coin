# Running Tests locally

The easiest way is to run the tests within a docker container that will
internally install all required packages.

From within the *tests* folder build the image locally first (should only be done once):
```
docker build -t qub-coin-test .
```

Then you can just run the *"run.sh"* script within the container that way, from
the *contracts folder of QUB-Coin repository* (aka: *cd ..* from within tests folder) :
```
docker run --rm -v $(pwd):/app -w /app/tests/ qub-coin-test ./run.sh
```

## Results
Tests results are generated in the standard JUnit xml format for ease of integration within CI servers like bamboo/jenkins etc.
The results will be stored within the reports folder:
```
├── lib
│   ├── FileHelper.js
│   └── GethWrapper.js
├── reports
│   └── TEST-BasicQUBCointest.xml
├── run.sh
└── spec
    └── QUBCoinSpec.js
```

Here is a sample report content:
```
<?xml version="1.0" encoding="UTF-8" ?>
<testsuites>
<testsuite name="Basic QUBCoin test" errors="0" tests="2" failures="0" time="14.489" timestamp="2016-08-03T16:02:32">
  <testcase classname="Basic QUBCoin test" name="should have been deployed with 5 instructors" time="13.946"></testcase>
  <testcase classname="Basic QUBCoin test" name="should be able to retrieve first instructor" time="0.539"></testcase>
</testsuite>
</testsuites>
```
