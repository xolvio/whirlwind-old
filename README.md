[![Whirlwind](https://raw.githubusercontent.com/xolvio/whirlwind/develop/whirlwind.png)](https://github.com/xolvio/whirlwind#readme) Whirlwind by [Xolv.io](http://xolv.io)
--------------------
[![Circle CI](https://circleci.com/gh/xolvio/whirlwind.svg?style=svg)](https://circleci.com/gh/xolvio/whirlwind) [![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/xolvio/chimp)

Reduce your build times from hours to minutes on TravisCI, CircleCI, CodeShip and even locally.

Whirlwind takes set of tasks that you wish to distribute, such as slow end-to-end tests, and runs them across compute 
nodes (parallelism), as well as within compute nodes (concurrency).  

The tasks source can be either a predefined list, or a directory.

### How does it work?

You provide a set of tasks (files or strings) that you'd like to distribute. You configure the parallelism & concurrency
parameters, and Whirlwind will distribute the list of tasks across the nodes and within them and run them all. If all of
the tasks pass, you get a clean exit code. If any fail, you see the error and deal with it. That's it!

### Can I do more than that?

Yep. You can add pre-processors and post-processors to do some setup and finalizing. For example, if you're running 
end-to-end tests, you'll probably want to start a server first, or you may want to instrument all your files before 
running your tests. And when the tests finish, you may want to pick up all the reports and post them somewhere.

You can also configure other tweaks, such as batch vs single mode. For example, a tool like Cucumber would work better
when it is provided with a batch of files to run, where as a tool that only takes a single paramater would work in 
single mode.

## Installation

`npm install -g whirlwind`

## Usage

The easiest way to use Whirlwind is to supply a `whirlwind.json` file in your project, and then simply run:

`whirlwind`

Enjoy your build time being taken down from hours to minutes!  

### Using a Configuration File

Let's go through the configuration file step-by-step: 

#### Node Count
First you define the total number of nodes and the current node id. You typically have these set as environment 
variables by CI servers, so you just have to let Whirlwins know what these are like this:
```json
{
  "totalNodes": "$CIRCLE_NODE_TOTAL",
  "nodeId": "$CIRCLE_NODE_INDEX",
```
This is for CircleCI as you can see. You can also use numbers here directly if you like.

#### Processors
Next you define a process like this:
```json
  "processes": [{
    "name": "give this task a unique name",
    "parallelism": 1,
    "processor": {
      "concurrency": 2,
      "source": {
        "directory": "lib",
        "pattern": "**/*.*"
      },
      "module": "exec-runner",
      "moduleOptions": {
        "command": "echo do something with these files: $TASKS",
        "separator": " "
      },
      "mode" : "batch"
    }
  }]
```
* **`name`** A unique name for this process      

* **`parallelism`** States how many CI nodes / containers this process should be distributed over

* **`processor.concurrency`** States how many processes to run on a node / container

* **`processor.module`** The runner to use. The `exec-runner` exposes node's `child_process.exec`       

* **`processor.source`** The tasks that will be disributed across and within nodes / containers. You can either use a 
`directory` with a glob `pattern` or you can also use a `list` instead and provide an `['array', 'of', 'strings']`.

* **`processor.moduleOptions`** These options are used by the `exec-runner`. Currently the `exec-runner` is the only 
available runner but we will soon add more and allow you to drop in your own modules. Notice the use of $TASKS. This is 
where the tasks from the `source` are used. If you don't specify a `separator`, the files are passed to the script as a 
space-separated flat array of files / strings.

* **`processor.mode`** This can either be `"batch"` (default) or `"single"`. In single mode, the process receives the 
tasks one by one. In batch mode, the tasks are flattened into a set of paramters to pass to the executable module.

You may specify multiple processors in the configuration files. For example, you might have one processor defined with 
a parallelism of 5 and a concurrency of 1 for your end-to-end tests, and another processor for your integration tests 
that with a parallelism of 2 and a concurrency of 3. This means you'd be utilising 7 nodes / containers. 

#### Pre-Processors and Post-Processors

If you are going to run end-to-end tests on your app, you'll likely want to start a server first. For this you can use
pre-processors like this:

````json
  "processes": [{
    "preProcessors": [
      {
        "module": "exec-runner",
        "moduleOptions": {
          "command": "echo do some stuff first, maybe instrument the source files then start a server"
        }
      }
    ],
    "name": "my first task",
    "parallelism": 1,
    "processor": {
```
Pre-processors are just like normal processes, they just don't support parallelism or concurrency. They are defined 
within the same object as the `processor` under the `processes` namespace. The exact same thing works for 
`postProcessors`.
   
   
#### Full Configuration File
```json
{
  "totalNodes": "$CIRCLE_NODE_TOTAL",
  "nodeId": "$CIRCLE_NODE_INDEX",
  "processes": [
    {
      "name": "my first task",
      "preProcessors": [
        {
          "module": "exec-runner",
          "moduleOptions": {
            "command": "echo do some stuff first, maybe instrument the source files then start a server"
          }
        }
      ],
      "parallelism": 1,
      "processor": {
        "module": "exec-runner",
        "source": {
          "directory": "lib",
          "pattern": "**/*.*"
        },
        "moduleOptions": {
          "command": "echo do something with these files: $TASKS",
          "separator": " "
        },
        "concurrency": 2
      },
      "postProcessors": [
        {
          "module": "exec-runner",
          "moduleOptions": {
            "command": "echo collect the results and post them somewhere"
          }
        }
      ]
    },
    {
      "name": "my other task",
      "parallelism": 1,
      "processor": {
        "module": "exec-runner",
        "source": {
          "list": ["some:package", "another:package", "and:another"]
        },
        "moduleOptions": {
          "command": "echo do something with these list items: $TASKS",
          "separator": " "
        },
        "concurrency": 1
      }
    }
  ]
}
```

### Programatically
You can also include `whirlwind` in your project and use it programatically like this:

```javascript
var path = require('path');
var nodeController = require('./../lib/node-controller');

var configuration = {}; // exactly the same as the configuration file above
nodeController.run(configuration);
```


## Credits
Many thanks to [Dispatch Technologies](http://www.dispatch.me/) for sponsoring this work and for being such a great member of the Open Source community. You should check out their [repository](https://github.com/dispatchme) for some more OSS from their awesome team.
