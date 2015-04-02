Mockaccino
===========

A simple Node (and Express.js) server to quickly mock web services responses.

It's configurable to work stand-alone or to be installed in your own Express app under a route.

NPM: [https://www.npmjs.com/package/mockaccino](https://www.npmjs.com/package/mockaccino)

# Use
## Run as an Express app
You can create an instance of it (as in app.js), by doing
```
var mockaccino = require('mockaccino')(cfg);
```
Where CFG is a valid config.
## Run standalone

Clone the git repo and run
```
node app --config configFile.json --port 8082
```
or

```
node app --help
```
for more information
# Config
Mockaccino is fully configurable to suite your needs. You just need to pass a valid JSON config.

##Sections of the config
The first level of the config is about generic configuration, and contains the responses level.
```
{
    ext_libs: {...},  [Object] contains the external libraries that can be used by you to have a custom behaviour on an endpoint
    queryStringParam: "tc", [String] specifies the name of the query string parameters that can be used to override the default behaviour of the endpoints
    mockResponses: {...} [Object] contains the behaviour description for all the endpoints
}
```

### ext_libs
It's an object containing a list of name/value pairs, that will tell Mockaccino to load
```
"ext_libs": {
    "example_lib": "./ext_libs/example.js",
    "counters": "./ext_libs/counters.js"
}
```

### mockResponses
This section will contain the definition of the responses behavior.
It needs to have a *default* property defined, from which all the endpoints will be mounted, and other properties which key would be the value of a query string parameter that can override the default behaviour if set. Let's call this level **settings**

*Example:*
```
{
   ...
    "queryStringParam": "tc",
    "mockResponses": {
        "default": {
            "/test1": {
               /* behaviour1 */
            },
            "/test2": {
               /* behaviour2 */
            }
        },
        "override1": {
            "test1": {
                /*behaviour3*/
            }
        }
    }
}
```

   * If you hit http://host:port/test1              --> behaviour1
   * If you hit http://host:port/test2              --> behaviour2
   * If you hit http://host:port/test1?tc=override1 --> behaviour3
   * If you hit http://host:port/test2?tc=override1 --> behaviour2
   * If you hit http://host:port/test1?tc=other     --> behaviour1

### Routes
Under settings properties, you can define an object, which keys will represent the routes the mockserver will be listening for.
Under the routes you can define which HTTP method you'll be listening for (e.g. get or post).
Each method then contains a **type** and informations which are specific to the type or your endpoint.

```
{
   ...

    "mockResponses": {
        "default": {
            "/test1": {
                "get": {
                    "type": "staticFile",
                    "path": "/mockfiles/res_static_1.json"
                }
            },
    ...
}
```
Types can be
   * **staticFile:** serves the data of the static File expressed in **path**

        "get": {
            "type": "staticFile",
            "path": "/mockfiles/res_static_1.json",
            "statusCode": 200
        }
    In this case you can (but it's optional) specify a **statsCode** property which will define the HTTP status code you want to mock.

   * **function:** executes the function specified in **fn**, referring to the names in ext_lib. The function can have the following signature:

    ```
   function foo(req, res, cfgItem, route, method)
   ```
|Attr    | Type   | Description    |
|--------|--------|----------------|
|req     |{object}| the Express req|
|res     |{object}| the Express res|
|cfgItem |{object}| the related item in the config|
|route   |{string}| the identified route|
|method  |{string}| the http method|

```
"/exampleFunction": {
    "get": {
        "type": "function",
        "fn": "example_lib.exampleFunction1"
    }
}
```
   * **extend:** takes the object result of the "setting (e.g. default or override)" in **extendFrom** , and merges what specified in **obj** or what contained in **objPath** [NOT YET IMPLEMENTED] on it.

       "get": {
            "type": "extend",
            "extendFrom": "default",
            "obj": {"myOverride": 1},
       },
       "post": { //[NOT YET IMPLEMENTED]
            "type": "extend",
            "extendFrom": "default",
            "objPath": "/mockfiles/res_static_1.json"
       }

## Example.conf.json
While the documentation might not always be complete, the example config shows you how to use make Mockaccino serve your needs in different ways
You can find it [here](example.conf.json)


