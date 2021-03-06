## Overview

This tutorial is designed to walk you through every aspect of **Glue42 Core** - setting up a project with the [**Glue42 CLI**](../../../core/core-concepts/cli/index.html), initializing [**Glue42 Clients**](../../../core/core-concepts/glue42-client/overview/index.html) and extending your applications with [Shared Contexts](../../../core/capabilities/shared-contexts/index.html), [Interop](../../../core/capabilities/interop/index.html), [Window Management](../../../core/capabilities/window-management/index.html), [Channels](../../../core/capabilities/channels/index.html), [Application Management](../../../core/capabilities/application-management/index.html) and [Workspaces](../../../core/capabilities/workspaces/index.html).

This guide uses plain JavaScript and its goal is to allow you to put the basic concepts of **Glue42 Core** to practice. There are also [React](../react/index.html) and [Angular](../angular/index.html) tutorials for **Glue42 Core**, but it is recommended that you go through the JavaScript tutorial first in order to get acquainted with **Glue42 Core** without the distractions of additional libraries and frameworks.

## Introduction

You are a part of the IT department of a big multi-national bank and you have been tasked to create an application which will be used by the Asset Management department of the bank. The project will consist of two applications:
- **Clients** - displays a full list of clients and details about them;
- **Stocks** - displays a full list of stocks with prices. When the user clicks on a stock, details about the selected stock should be displayed.

The two applications must be hosted on the same domain where `/clients` resolves to the **Clients** application and `/stocks` resolves to the **Stocks** application.

As an end result, the users want to be able to run two apps as Progressive Web Apps in separate windows in order to take advantage of their multi-monitor setups. Also, they want the apps, even though in separate windows, to be able to communicate with each other. For example, when a client is selected in the **Clients** app, the **Stocks** app should display only the stocks of the selected client.

## Prerequisites

This tutorial assumes that you are familiar with the concepts of JavaScript and asynchronous programming.

It is also recommended to have the [**Glue42 CLI**](../../../core/core-concepts/cli/index.html), [**Glue42 Environment**](../../../core/core-concepts/environment/overview/index.html), [**Glue42 Clients**](../../../core/core-concepts/glue42-client/overview/index.html) and [**Glue42 Web**](../../../reference/core/latest/glue42%20web/index.html) documentation available for reference.

## Tutorial Structure

The tutorial code is located in the **Glue42 Core** [**GitHub repo**](https://github.com/Glue42/core). There you will find a `/tutorials` directory with the following structure:

```cmd
/tutorials
    /angular
        /solution
        /start
    /guides
        /02_core
            /01_javascript
            /02_react
            /03_angular
    /javascript
        /solution
        /start
    /react
        /solution
        /start
    /rest-server
```

- `/guides` - contains the text files of the tutorials;
- `/javascript`, `/react` and `/angular` - contain the starting files for the tutorials and also a full solution for each of them;
- `/rest-server` - a simple server used in the tutorials to serve the necessary `JSON` data;

**Glue42 Core** is an open-source project, so all feedback and contributions, both to the code base and the tutorials, are welcome.

## 1. Setup

Clone the **Glue42 Core** [**GitHub repo**](https://github.com/Glue42/core) to get the tutorial files.

### 1.1. Start Files

Next, go to the `/tutorials/javascript/start` directory which contains the starting files for the project. The tutorial examples assume that you will be working in the `/start` directory, but, of course, you can move the files and work from another directory.

The `/start` directory contains the following:
- `/assets` - holds shared assets for both applications (icons);
- `/lib` - holds common libraries used by both applications(the [**Glue42 Web**](../../../reference/core/latest/glue42%20web/index.html) library, CSS and other files);
- `/clients` - this is the **Clients** app which consists of an `index.html` file, script file and a `manifest.json` file;
- `/stocks` - this is the **Stocks** app which consists of the same elements as the **Clients** app, with the addition of a `/details` directory which contains the `.html` and `.js` files for the Stock Details view;
- `/client-details` - this is the **Client Details** app which will be used later in the tutorial (in the [Workspaces](#8_workspaces) chapter) to display detailed information about a selected client;
- `favicon.ico` - a standard favicon;
- `index.html` - the project landing page;
- `package.json` - standard `package.json` file;
- `service-worker.js` - a Service Worker script used by both applications. The Service Worker and the manifests classify the application as an installable [**Progressive Web App**](https://developer.mozilla.org/nl/docs/Web/Progressive_web_apps). Does not contain any meaningful logic;

### 1.2. Solution Files

Before you continue, take a look at the solution files. You are free to use the solution as you like - you can check after each section to see how it solves the problem, or you can use it as a reference point in case you get stuck.

Go to the `/rest-server` directory and start the REST Server (as described in the [REST Server](#setup-rest_server) chapter). Go to the `/javascript/solution` directory, open a command prompt and run the following commands to install the necessary dependencies and run the project (assuming the Glue42 CLI is installed globally):

```cmd
npm install

gluec serve
```

You can now access the **Clients** app at `localhost:4242/clients` and the **Stocks** app at `localhost:4242/stocks`.

### 1.3. REST Server

Before starting with the project, go to the `/tutorials/rest-server` directory and start the REST server that will host the necessary data for the applications:

```cmd
npm install

npm start
```

This will launch the server at port 8080.

### 1.4. Glue42 Environment

Now, you will use the [**Glue42 CLI**](../../../core/core-concepts/cli/index.html) to set up the [**Glue42 Environment**](../../../core/core-concepts/environment/overview/index.html) files. For that purpose, you need to install the Glue42 CLI and run the `init` command which will automatically set up your development environment. Go to the `/tutorials/javascript/start` directory, open a command prompt and run the following:

```cmd
npm install --global @glue42/cli-core

gluec init
```
Or you can also do it this way:

```cmd
npm install --save-dev @glue42/cli-core

npx gluec init
```

The `init` command installs the necessary dependencies and creates the necessary configuration files with default settings.

Next, you have to configure the development server that comes with the Glue42 CLI. It will allow you to serve or proxy to your apps, define shared resources and serve the [**Glue42 Environment**](../../../glue42-core/what-is-glue42-core/core-concepts/environment/index.html) files correctly. To do that, open the `glue.config.dev.json` file that was created with the `init` command and add the locations and routes for the shared resources and the **Clients** and **Stocks** apps. Your configuration should look something like this:

```json
{
    "glueAssets": ...,
    "server": {
        "settings": ...,
        "apps": [
            {
                "route": "/",
                "file": {
                    "path": "./"
                }
            },
            {
                "route": "/clients",
                "file": {
                    "path": "./clients/"
                }
            },
            {
                "route": "/stocks",
                "file": {
                    "path": "./stocks/"
                }
            }
        ],
        "sharedAssets": [
            {
                "route": "/assets",
                "path": "./assets/"
            },
            {
                "route": "/lib",
                "path": "./lib/"
            },
            {
                "route": "/favicon.ico",
                "path": "./favicon.ico"
            },
            {
                "route": "/service-worker.js",
                "path": "./service-worker.js"
            }
        ]
    },
    "logging": "default"
}
```

*For more information on how to configure the Glue42 CLI development server, see the [**Glue42 CLI: Configuration**](../../../core/core-concepts/cli/index.html#configuration) section.*

Next, open a command prompt in the project base directory and run:

```cmd
gluec serve
```

The `serve` command launches a development server at port 4242 which will serve all defined apps and resources together with the [**Glue42 Environment**](../../../glue42-core/what-is-glue42-core/core-concepts/environment/index.html) files.

Now, you can open the apps at `localhost:4242/clients` for the **Clients** app and at `localhost:4242/stocks` for the **Stocks** app or access them directly from the project landing page at `localhost:4242/`.

Landing page:

![Landing Page](../../../images/tutorials/core-js/landing-page.png)

Clients:

![Clients](../../../images/tutorials/core-js/clients.png)

Stocks:

![Stocks](../../../images/tutorials/core-js/stocks.png)

At the right side of the address bar you will see an install icon from which you can install the app on your desktop:

![Install](../../../images/tutorials/core-js/install.png)

Once installed, you can launch it from the shortcut created on your desktop or by going to `chrome://apps` (if you are using Google Chrome) and clicking its icon.

## 2. Initializing the Glue42 Web Library

Now, you need to initialize the [**Glue42 Web**](../../../reference/core/latest/glue42%20web/index.html) library in each of the applications. To do that, you have to reference the Glue42 Web script in the `index.html` file of each app and initialize the library in the respective `index.js` file of each app.

Open the `index.html` files located in `/clients`, `client-details`, `/stocks` and `stocks/details` and add a new `<script>` tag just below the `TODO: Chapter 2` comment and reference the Glue42 Web script from the `/lib` directory:

```html
<script src="/lib/web.umd.min.js"></script>
```

Next, open the `index.js` files located in `/clients`, `/stocks` and `stocks/details` and find the `TODO: Chapter 2` comment inside the `start()` function. Initialize the [**Glue42 Web**](../../../reference/core/latest/glue42%20web/index.html) library by using the `GlueWeb()` factory function attached to the global `window` object. Assign the returned object as a property of the global `window` object for easy use:

```javascript
// In `start()`.
window.glue = await GlueWeb();
```
Find the `toggleGlueAvailable` function and uncomment it. Call it once the `GlueWeb()` factory function has resolved.

```javascript
// In `start()`.
toggleGlueAvailable();
```

After refreshing the apps, you should see in the top left corner of each of them that Glue42 is available. This means that you have successfully connected to the [**Glue42 Environment**](../../../glue42-core/what-is-glue42-core/core-concepts/environment/index.html).

Next, you will start to add more functionalities to the apps.

## 3. Interop

In this section you will use some of the functionalities provided by the **Glue42 Core** [**Interop API**](../../../reference/core/latest/interop/index.html).

### 3.1. Registering Interop Methods and Streams

When a user clicks on a client, the **Stocks** app should show only the stocks owned by this client. You can achieve this by registering an Interop method in the **Stocks** app which, when invoked, will receive the portfolio of the selected client and re-render the stocks table. Also, the **Stocks** app will create an Interop stream to which it will push the new stock prices. Subscribers to the stream will get notified when new prices have been generated.

Go to `index.js` file of the **Stocks** app and find the `TODO: Chapter 3.1` comment. Register a method called `SelectClient` in the `start()` function, below the invocation of the `toggleGlueAvailable()` function. This method will expect as an argument an object with a property `client`, which is also an object with a `portfolio` property. Next, filter all stocks and pass only the ones present in the portfolio of the client to the `setupStocks()` function. Then, create a stream called `"LivePrices"` and assign it to the global `window` object for easy access:

```javascript
// In `start()`.

// Registering an Interop method.
glue.interop.register("SelectClient", (args) => {
    const clientPortfolio = args.client.portfolio;
    const stockToShow = stocks.filter(stock => clientPortfolio.includes(stock.RIC));
    setupStocks(stockToShow);
});

// Registering an Interop stream.
window.priceStream = await glue.interop.createStream("LivePrices");
```
Finally, go to the `newPricesHandler()` function and find the `TODO: Chapter 3.1` comment in it. This function is invoked every time new prices are generated. Push the updated prices to the stream if it exists. The result should look something like this:

```javascript
// Update the `newPricesHandler()` to push the new prices to the stream.
const newPricesHandler = (priceUpdate) => {
    priceUpdate.stocks.forEach((stock) => {
        const row = document.querySelectorAll(`[data-ric='${stock.RIC}']`)[0];

        if (!row) {
            return;
        }

        const bidElement = row.children[2];
        bidElement.innerText = stock.Bid;

        const askElement = row.children[3];
        askElement.innerText = stock.Ask;
    });

    // Check if the stream exists and push the new prices to it.
    if (priceStream) {
        priceStream.push(priceUpdate);
    };
};
```

Next, you will find and invoke the registered method from the **Clients** app.

### 3.2. Method Discovery

Now, go to the `index.js` file of the **Clients** app, find the `TODO: Chapter 3.2.` comment and extend the `clientClickedHandler()`. This function is invoked every time the user clicks on a client. Use the Interop API inside it to check for a registered Interop method with the name `SelectClient`. Your code should look something like this:

```javascript
// In `clientClickedHandler()`.

// Get a list of all registered Interop methods and filter them by name.
const selectClientStocks = glue.interop.methods().find(method => method.name === "SelectClient");
```

### 3.3. Method Invocation

What is left is to invoke the method, if present. Remember that the **Clients** and **Stocks** apps are designed to be launched and used on their own, so if the **Stocks** app is not open, there will be no method to invoke.

Find the `TODO: Chapter 3.3.` comment and invoke the method if it has been registered. The `clientClickedHandler()` accepts a `client` object as an argument. Wrap it in an object, invoke the `SelectClient` method and pass this object as its argument.

```javascript
// In `clientClickedHandler()`.

// Check if the method exists, invoke it and pass an argument to it.
if (selectClientStocks) {
    glue.interop.invoke(selectClientStocks, { client });
};
```

The updated handler should now look something like this:

```javascript
const clientClickedHandler = (client) => {
    const selectClientStocks = glue.interop.methods().find((method) => method.name === "SelectClient");

    if (selectClientStocks) {
        glue.interop.invoke(selectClientStocks, { client });
    };
};
```

### 3.4. Stream Subscription

Next, use the Interop API to subscribe the **Stock Details** app to the previously created `"LivePrices"` stream.

Go to the `index.js` file of the **Stock Details** app and find the `TODO: Chapter 3.4` comment in the `start()` function. Subscribe to the `"LivePrices"` stream and use the `onData()` method of the returned subscription object to assign a handler for the received stream data. The end result should look like this:

```javascript
// In `start()`.

// Create a stream subscription.
const subscription = await glue.interop.subscribe("LivePrices");

// Handle the received stream data.
subscription.onData((streamData) => {
    const updatedStocks = streamData.data.stocks;
    const selectedStock = updatedStocks.find(updatedStock => updatedStock.RIC === stock.RIC);

    updateStockPrices(selectedStock.Bid, selectedStock.Ask);
});
```

## 4. Window Management

Currently, when a user clicks on a stock in the **Stocks** app, they are redirected to a new view. The users, however, have multiple monitors and would like to take advantage of that. So, they want clicking on a stock to open a new window with the stock details. They also want the window to have specific dimensions and position. To do this, you will use the [Window Management API](../../../reference/core/latest/windows/index.html).

### 4.1. Opening Windows at Runtime

Go to the `index.js` file of the **Stocks** app and find the `TODO: Chapter 4.1` comment in the `stockClickedHandler()` function. Currently, it rewrites the value of `window.location.href` to redirect to the **Stock Details** view. Remove that and use [`glue.windows.open()`](../../../reference/core/latest/windows/index.html#!API-open) to open a new window with the same URL. The updated handler should look like this:

```javascript
const stockClickedHandler = (stock) => {
    sessionStorage.setItem("stock", JSON.stringify(stock));

    // The window name and URL are required parameters. The window name must be unique.
    const windowName = `${stock.BPOD} Details`;
    const URL = "http://localhost:4242/stocks/details/";

    glue.windows.open(windowName, URL).catch(console.error);
};
```

After refreshing, when you click on a stock, a separate **Stock Details** window will be opened.

### 4.2. Window Settings

Now, you will extend the [`glue.windows.open()`](../../../reference/core/latest/windows/index.html#!API-open) logic to pass specific values for the window size (`width` and `height`) and position (`top` and `left`):

```javascript
const stockClickedHandler = (stock) => {
    sessionStorage.setItem("stock", JSON.stringify(stock));

    const windowName = `${stock.BPOD} Details`;
    const URL = "http://localhost:4242/stocks/details/";
    // Optional configuration object for the newly opened window.
    const windowConfig = {
        left: 100,
        top: 100,
        width: 550,
        height: 550
    };

    glue.windows.open(windowName, URL, windowConfig).catch(console.error);
};
```

### 4.3. Window Context

Next, you will pass the selected stock as a context for the newly opened **Stock Details** window. Find the `TODO: Chapter 4.3` comment in the `stockClickedHandler()` of the **Stocks** app and remove the logic for saving the selected stock by using the `sessionStorage.setItem()` method. Add a `context` property in the window configuration object and assign the `stock` object as its value:

```javascript
const stockClickedHandler = (stock) => {
    const windowName = `${stock.BPOD} Details`;
    const URL = "http://localhost:4242/stocks/details/";
    const windowConfig = {
        left: 100,
        top: 100,
        width: 550,
        height: 550,
        // Set the `stock` object as a context for the new window.
        context: stock
    };

    glue.windows.open(windowName, URL, windowConfig).catch(console.error);
};
```

Next, you need to update the **Stock Details** app to correctly get the `stock` object. Find the `TODO: Chapter 4.3` comment in the `index.js` file of the **Stock Details** app and remove the logic for getting the stock by using the `sessionStorage.getItem()` method. Get a reference to the current window using the [`glue.windows.my()`](../../../reference/core/latest/windows/index.html#!API-my) method and get its context. Remember to place that logic and also move the invocation of the `setFields()` function *after* the initialization of the [**Glue42 Web**](../../../reference/core/latest/glue42%20web/index.html) library in order for the Window Management API to be available:

```javascript
// In `start()`.
const currentWindow = glue.windows.my();
const stock = currentWindow.context;

setFields(stock);
```

The final version of the `start()` function in the **Stock Details** app should look something like this:

```javascript
const start = async () => {

    window.glue = await GlueWeb();

    toggleGlueAvailable();

    const currentWindow = glue.windows.my();
    const stock = currentWindow.context;

    setFields(stock);

    const subscription = await glue.interop.subscribe("LivePrices");

    subscription.onData((streamData) => {
        const updatedStocks = streamData.data.stocks;
        const selectedStock = updatedStocks.find(updatedStock => updatedStock.RIC === stock.RIC);

        updateStockPrices(selectedStock.Bid, selectedStock.Ask);
    });
};
```

## 5. Shared Contexts

The next request of the users is to be able to see in the **Stock Details** app whether the selected client has the selected stock in their portfolio. This time, you will use the [Shared Contexts API](../../../reference/core/latest/shared%20contexts/index.html) to connect the **Clients**, **Stocks** and **Stock Details** apps.

### 5.1. Updating a Context

Go to the `index.js` file of the **Clients** app and find the `TODO: Chapter 5.1.` comment in the `clientClickedHandler()` function. Comment out or delete the existing code that uses the Interop API. Use [`glue.contexts.update()`](../../../reference/core/latest/shared%20contexts/index.html#!API-update) to create and set a shared context object by providing a name and value for it. This will allow other applications to subscribe for updates to the same context and be notified when its value changes:

```javascript
const clientClickedHandler = (client) => {
    // The `update()` method updates the value of a specified context object.
    // If the specified context does not exist, it is created.
    glue.contexts.update("SelectedClient", client).catch(console.error);
};
```

### 5.2. Subscribing for Context Updates

Next, go to the **Stocks** app and find the `TODO: Chapter 5.2` comment in the `start()` function. Comment out or delete the code that uses the Interop API to register the method `SelectClient` (but leave the code that registers the `"LivePrices"` stream). Use the [`glue.contexts.subscribe()`](../../../reference/core/latest/shared%20contexts/index.html#!API-subscribe) method to subscribe for updates to the `SelectedClient` context object:

```javascript
// In `start()`.

// Define a function that will handle the context updates.
const updateHandler = (client) => {
    const clientPortfolio = client.portfolio;
    const stockToShow = stocks.filter(stock => clientPortfolio.includes(stock.RIC));

    setupStocks(stockToShow);
};

// Subscribe for updates to the context.
glue.contexts.subscribe("SelectedClient", updateHandler);
```

Go to the **Stock Details** app and subscribe to the `SelectedClient` context and to show whether the selected client has the displayed stock in their portfolio. In the `index.js` file of the **Stock Details** app uncomment the `updateClientStatus()` function. Find the `TODO: Chapter 5.2` comment in the `start()` function and subscribe for the `SelectedClient` context. Invoke the `updateClientStatus()` function and pass the selected client and stock to it:

```javascript
// In `start()`.

// Define a function that will handle the context updates.
const updateHandler = (client) => {
    updateClientStatus(client, stock);
};

// Subscribe for updates to the context.
glue.contexts.subscribe("SelectedClient", updateHandler);
```

Now the **Stock Details** app will show whether the client selected from the **Clients** app has the the displayed stock in their portfolio.

## 6. Channels

The latest requirement from the users is to be able work with multiple clients at a time by having multiple instances of the **Stocks** app show the portfolios of different clients. Currently, no matter how many instances of the **Stocks** app are running, they are all listening for updates to the same context and therefore all show information about the same selected client. Here, you will use the [Channels API](../../../reference/core/latest/channels/index.html) to allow each instance of the **Stocks** app to subscribe for updates to the context of a selected channel. The different channels are color coded and the user will be able to select a channel from a Channel Selector UI. The **Clients** app will update the context of the currently selected channel when the user clicks on a client.

### 6.1. Channels Configuration

First, you need to add channel definitions to the [**Glue42 Environment**](../../../core/core-concepts/environment/overview/index.html). Add the following configuration to the `glue.config.json` file located at the base directory of your project. After that, restart the Glue42 CLI by quitting it and running the `gluec serve` command again for the changes to take effect:

```json
{
    "glue": ...,
    "gateway": ...,
    "channels": [
        {
            "name": "Red",
            "meta": {
                "color": "red"
            }
        },
        {
            "name": "Green",
            "meta": {
                "color": "green"
            }
        },
        {
            "name": "Blue",
            "meta": {
                "color": "#66ABFF"
            }
        },
        {
            "name": "Pink",
            "meta": {
                "color": "#F328BB"
            }
        },
        {
            "name": "Yellow",
            "meta": {
                "color": "#FFE733"
            }
        },
        {
            "name": "Dark Yellow",
            "meta": {
                "color": "#b09b00"
            }
        },
        {
            "name": "Orange",
            "meta": {
                "color": "#fa5a28"
            }
        },
        {
            "name": "Purple",
            "meta": {
                "color": "#c873ff"
            }
        },
        {
            "name": "Lime",
            "meta": {
                "color": "#8af59e"
            }
        },
        {
            "name": "Cyan",
            "meta": {
                "color": "#80f3ff"
            }
        }
    ]
}
```

To enable the Channels API, you need to initialize the [**Glue42 Web**](../../../reference/core/latest/glue42%20web/index.html) library by passing a configuration object to the `GlueWeb()` factory function. Go to the `index.js` files of the **Clients** and **Stocks** apps and modify the initialization of the library:

```javascript
// In `start()`.

const config = { channels: true };

window.glue = await GlueWeb(config);
```

### 6.2. Channel Selector Widget

The users have to be able to navigate through the channels for which they will need some sort of user interface. You can create your own channel selector widget by using the Channels API, but for the purpose of the tutorial there is a jQuery channel widget included. To add it to the **Clients** and **Stocks** apps, follow these steps:

1. Go the `index.html` files of both apps and find the `TODO: Chapter 6` comments in the `<head>` tag. Reference the `channelSelectorWidget.js` file located in the `/lib` folder:

```html
<script src="/lib/channelSelectorWidget.js"></script>
```

2. Next, find the other `TODO: Chapter 6` comment in the `<body>` tag and uncomment the `<select>` element. It will be populated by the channel selector widget script.

3. Find the `TODO: Chapter 6.2` comment in the `index.js` files of both apps and call the globally exposed `createChannelSelectorWidget()` function to populate the channel selector widget. The `createChannelSelectorWidget()` method expects three arguments:

- `NO_CHANNEL_VALUE` - a string for the default value to be displayed in the widget. The users will use it to leave the current channel;

```javascript
// In `start()`.

// Define and initialize the variable that will be used as a first argument.
const NO_CHANNEL_VALUE = "No channel";
```

- `channelNamesAndColors` - an array of objects with `name` and `color` properties holding the name and the color code of each channel. You will get them through the Channels API:

```javascript
// In `start()`.

// Get the contexts of all available channels.
const channelContexts = await window.glue.channels.list();
// Extract only the names and colors of the channels.
const channelNamesAndColors = channelContexts.map((channelContext) => {
    const channelInfo = {
        name: channelContext.name,
        color: channelContext.meta.color
    };

    return channelInfo;
});
```

- `onChannelSelected` - a callback that will be called when the user selects a channel from the widget;

```javascript
// In `start()`.

const onChannelSelected = (channelName) => {
    // Leave the current channel when the user selects "No Channel".
    if (channelName === NO_CHANNEL_VALUE) {
        if (glue.channels.my()) {
            glue.channels.leave().catch(console.error);
        }
    } else {
        // Join the channel selected by the user.
        glue.channels.join(channelName).catch(console.error);
    };
};
```

Finally, call `createChannelSelectorWidget()` providing the arguments defined above:

```javascript
// In `start()`.

await createChannelSelectorWidget(
    NO_CHANNEL_VALUE,
    channelNamesAndColors,
    onChannelSelected
);
```

### 6.3. Publishing and Subscribing

Find the `TODO: Chapter 6.3.` comment in the `clientClickedHandler()` function of the **Clients** app. Call the [`glue.channels.publish()`](../../../reference/core/latest/channels/index.html#!API-publish) method passing the selected client as an argument. Note that `publish()` will throw an error if the app tries to publish data but is not on a channel. Use the `glue.channles.my()` method to check for the current channel:

```javascript
// In `clientClickedHandler()`.

const currentChannel = glue.channels.my();

if (currentChannel) {
    glue.channels.publish(client).catch(console.error);
};
```

Next, go to the **Stocks** app and comment out or delete the code in the `start()` function that uses the Shared Contexts API to listen for updates of the `SelectedClient` context. Find the `TODO: Chapter 6.3` comment and use the [`glue.channels.subscribe()`](../../../reference/core/latest/channels/index.html#!API-subscribe) method instead to enable the **Stocks** app to listen for updates of the current channel context. Provide the same callback you used in Chapter 5.2. to handle context updates:

```javascript
// In `start()`.

glue.channels.subscribe();
```

## 7. Application Management

Up until now the **Stocks** app had to use the Window Management API to open the **Stock Details** application when the user clicks on a stock. This works fine for small projects, but does not scale well for larger ones, because this way each app has to know all details (URL, start position, initial context, etc.) about every application it needs to start. In this chapter you will replace the Window Management API with the [Application Management API](../../../reference/core/latest/appmanager/index.html) which will allow you to predefine the applications in the [**Glue42 Environment**](../../../core/core-concepts/environment/overview/index.html). The **Stocks** app will be decoupled from the **Stock Details** - it will need only the name of the **Stock Details** app to be able to start it.

### 7.1. Application Configuration

To take advantage of the [Application Management API](../../../reference/core/latest/appmanager/index.html), you need to define configurations for your applications in the `glue.config.json` file of your project and enable the Application Management API by passing a [`Config`](../../../reference/core/latest/glue42%20web/index.html#!Config) object during the initialization of the [**Glue42 Web**](../../../reference/core/latest/glue42%20web/index.html) library in each application.

First, open the `glue.config.json` and add the following application configurations using the `appManager` top-level key. Restart the Glue42 CLI by quitting it and running the `gluec serve` command again for the changes to take effect:

```json
{
    "glue": ...,
    "gateway": ...,
    "channels": ...,
    "appManager": {
        "localApplications": [
            {
                "name": "Clients",
                "details": {
                    "url": "http://localhost:4242/clients"
                }
            },
            {
                "name": "Stocks",
                "details": {
                    "url": "http://localhost:4242/stocks",
                    "left": 0,
                    "top": 0,
                    "width": 860,
                    "height": 600
                }
            },
            {
                "name": "Stock Details",
                "details": {
                    "url": "http://localhost:4242/stocks/details",
                    "left": 100,
                    "top": 100,
                    "width": 400,
                    "height": 400
                }
            }
        ]
    }
}
```

After that enable the Application Management API by passing `{ appManager: true }` and the application name to the `GlueWeb()` factory function:

```javascript
// In `start()`.
const config = {
    channels: true,
    appManager: true,
    application: "Clients"
};

window.glue = await GlueWeb(config);
```

Do this for all three applications, passing in the correct application name. The application name is used by the platform to map it to the respective local/remote application definition that is then accessible through the `application` property of [`glue.appManager.myInstance`](../../../reference/core/latest/appmanager/index.html#!API-myInstance). For the mapping to work, it is important that the application name provided to `GlueWeb()` is the same as the application name defined in the local/remote application configuration.

### 7.2. Starting Applications

Go to the **Stocks** app and find the `TODO: Chapter 7.2` comment. Comment out or delete the code that uses the Window Management API to open the **Stock Details** app. Now use the [`glue.appManager.application()`](../../../reference/core/latest/appmanager/index.html#!API-application) method to get the **Stock Details** app and call the `start()` method on the application object to start it. The `start()` method also accepts a context object as first parameter that will be passed as context to the started application instance:

```javascript
// In `stockClickedHandler()`.

const detailsApplication = glue.appManager.application("Stock Details");

// Start the app and pass the `stock` as context.
detailsApplication.start(stock).catch(console.error);
```

To get the `stock` from the starting context in the **Stock Details** application:

```javascript
// In `start()`.

const stock = glue.appManager.myInstance.context;

setFields(stock);
```

Now everything should work as before, the difference being that the apps now use the Application Management API instead of the Window Management API.

### 7.3. Application Instances

Next, you will use the Application Management API to add new functionality to the **Clients** application. When the user selects a client, you can check whether there is a running instance of the **Stocks** app, and if there isn't one, you will start the **Stocks** app. You will also pass the current channel as context to the started instance of the **Stocks** app. Each application object has an [`instances`](../../../reference/core/latest/appmanager/index.html#!Application-instances) property that allows you to get the running instances of the application.

Go the the **Clients** app, find the `TODO: Chapter 7.3` comment, check for running instances of the **Stocks** app and if there aren't any, start one. Pass the current channel as context to the started instance:

```javascript
// In `clientClickedHandler()`.

const isStocksRunning = glue.appManager.application("Stocks").instances.length > 0;

if (!isStocksRunning) {
    glue.appManager.application("Stocks").start({ channel: currentChannel }).catch(console.error);
};
```

Now go to the **Stocks** application, find the `TODO: Chapter 7.3` comment and use the following to receive and join the channel:

```javascript
// In `start()`.

const channelToJoin = glue.appManager.myInstance.context.channel;

if (channelToJoin) {
    glue.channels.join(channelToJoin);
};
```

This, however, will not re-render the Channel Selector widget in the **Stocks** app with the newly programmatically joined channel. To make the Channel Selector react to calls to [`join()`](../../../reference/core/latest/channels/index.html#!API-join) and [`leave()`](../../../reference/core/latest/channels/index.html#!API-leave), you need to define a method which will re-render the widget every time the current channel has changed:

```javascript
// In `start()`.

const updateChannelSelectorWidget = createChannelSelectorWidget(
    NO_CHANNEL_VALUE,
    channelNamesAndColors,
    onChannelSelected
);

// Re-render the Channel Selector each time the channel changes.
const handleChannelChanges = (channelName) => {
    updateChannelSelectorWidget(channelName);
};

glue.channels.onChanged(handleChannelChanges);
```

Now when the user clicks on a client in the **Clients** app and there is no running instance of the **Stocks** app, the **Stocks** app will be started, showing the portfolio of the selected client, and it will also join the channel that the **Clients** app is currently on.

## 8. Workspaces

The latest feedback from the users is that their desktops very quickly become cluttered with multiple floating windows. The **Glue42 Core** [Workspaces](../../../core/capabilities/workspaces/index.html) feature solves exactly that problem.

The new requirement is that when a user clicks on a client in the **Clients** application, a new Workspace should open displaying detailed information about the selected client in one app and his stocks portfolio in another. When the user clicks on a stock, a third application should appear in the same Workspace displaying more details about the selected stock. You will use the **Client Details** application for displaying information about the selected client.

Go to the `index.html` and `index.js` files of the **Clients** and **Stocks** apps and comment out all logic and references related to Channels, introduced in a previous chapter. Instead, you will use Workspaces to allow the users to work with multiple clients at once and organize their desktop at the same time. Channels and Workspaces can, of course, be used together to provide extremely enhanced user experience, but in order to focus entirely on working with Workspaces, the Channels functionality will be ignored.

Use the [Workspaces API](../../../reference/core/latest/workspaces/index.html) documentation as a reference when working on this chapter. 

### 8.1. Setup

Configure your current development environment for Workspaces by running the following command in the Glue42 CLI:

```cmd
gluec workspaces init
```

This command will add the necessary Workspaces packages to your project and set up the Workspaces default settings in your configuration files.

*Note that this command only works if the current directory has already been initialized with the `gluec init` command. In case of a brand new **Glue42 Core** project, you have to use the `gluec init -w` command to set up the basic **Glue42 Core** files and Workspaces at the same time.*

### 8.2. Workspace Layouts

Next, you need to build a Workspace layout which will be the blueprint of the Workspace that the **Clients** app will restore when the user clicks on a client. This layout should contain the **Client Details** and **Stocks** apps.

Define the **Client Details** app in the `glue.config.dev.json` file so that the [**Glue42 CLI**](../../../core/core-concepts/cli/index.html) will be able to serve it:

```json
{
    "glueAssets": ...,
    "server": {
        "apps": [
            ...,
            {
                "route": "/clientdetails",
                "file": {
                    "path": "./client-details/"
                }
            }
        ],
        "settings": ...,
        "sharedAssets": ...
    },
    "logging": "dev"
}
```

Define the **Client Details** app as a **Glue42 Core** application in the `glue.config.json` file (see the [Application Management](#7_application_management-71_application_configuration) chapter for more details):

```json
{
    "glue": ...,
    "channels": ...,
    "appManager": {
        "localApplications": [
            ...,
            {
                "name": "Client Details",
                "details": {
                    "url": "http://localhost:4242/clientdetails"
                }
            }
        ]
    }
}
```

*Note that you have to define all apps that will be used in the Workspace in the `glue.config.json` file. Also, you have to specify the application name in the [`applications`](../../../reference/core/latest/glue42%20web/index.html#!Config-application) property of the configuration object when initializing them as [Glue42 Clients](../../../core/core-concepts/glue42-client/overview/index.html). This is necessary in order for the applications to become available in the "Add Application" menu of the [Workspaces App](../../../core/capabilities/workspaces/index.html#workspaces_concepts-frame).*

The [**Glue42 CLI**](../../../core/core-concepts/cli/index.html) offers access to a [Workspace Builder](../../../core/capabilities/workspaces/index.html#creating_workspace_layouts) which you can use to compose and save a Workspace layout:

```cmd
gluec workspaces build
```

*Note that in order for this command to work, the Glue42 development server must be running.*

This will open the Workspace Builder in your default browser. Add the **Client Details** app by clicking on the `+` icon in the center and then add the **Stocks** app by clicking the `+` icon in the top right corner of the newly formed group. You should have both apps open next to each other in the new Workspace.

Save the Workspace layout by clicking the "Save" icon on the left of the Workspace title and name it (e.g., "client-space"). Next, click the "Download" button and save the `.txt` file in the project directory. Copy the contents of the downloaded `.txt` file and paste it in the `workspaces` array of the `glue.layouts.json` file.

Now this Workspace layout can be restored by name using the [Workspaces API](../../../reference/core/latest/workspaces/index.html).

### 8.3. Initializing Workspaces

To be able to use Workspaces functionalities, you need to initialize the [Workspaces API](../../../reference/core/latest/workspaces/index.html) in the **Clients**, **Client Details** and **Stocks** apps. The **Stock Details** app will participate in the Workspace, but will not need to use any Workspaces functionality. Find the `TODO: Chapter 8.3` comment in the `index.html` files of the **Clients**, **Client Details** and **Stocks** apps and reference the Workspaces library:

```html
<script src="/lib/workspaces.umd.min.js"></script>
```

The Workspaces script attaches the `GlueWorkspaces()` factory function to the global `window` object. Go to the `index.js` files of the **Clients**, **Client Details** and **Stocks** apps and add `GlueWorkspaces` to the `libraries` array of the configuration object when initializing the Glue42 Web library:

```javascript
// In `start()`.

const config = {
    appManager: true,
    application: "Client Details",
    libraries: [GlueWorkspaces]
};

window.glue = await GlueWeb(config);
```

*Remember to pass the correct name for each application in the `application` property of the configuration object when initializing the Glue42 Web library so that the application will be available in the "Add Application" menu of the Workspaces App.*

### 8.4. Opening Workspaces

Next, you have to implement opening a new Workspace when the user clicks on a client in the **Clients** app. Go to the `clientClickedHandler` function in the **Clients** app, restore by name the Workspace layout you created earlier and pass the selected client as a starting context. The specified context will be attached as a window context to all windows participating in the Workspace:

```javascript
const clientClickedHandler = (client) => {
    const restoreConfig = { 
        context: { client } 
    };

    glue.workspaces.restoreWorkspace("client-space", restoreConfig).catch(console.error);
};
```

If everything is correct, a new Workspace should now open every time you click a client. 

### 8.5. Starting Context

The windows of the **Client Details** and **Stocks** apps participating in the new Workspace will have a starting context attached to them. You have to handle this starting context in order to display the relevant client data when the user selects a client from the **Clients** app.

To get the starting window context, you have to subscribe for updates to the context of the current window using the [Window Management API](../../../reference/core/latest/windows/index.html). When the window context has been updated and if it contains a `client` property, you have to handle the client data in the respective application and also set the Workspace title to the name of the selected client.

Go to the **Client Details** app, find the `TODO: Chapter 8.5` comment in the `start()` function and use the [`onContextUpdated()`](../../../reference/core/latest/windows/index.html#!WebWindow-onContextUpdated) method of the current window to subscribe for updates of the window context. Invoke the `setFields()` function passing the `client` property of the updated context and set the title of the Workspace to the name of the selected client:

```javascript
// In `start()`.

glue.windows.my().onContextUpdated((context) => {
    if (context.client) {
        setFields(context.client);

        // Get the current Workspace and set its title.
        const workspace = await glue.workspaces.getMyWorkspace().catch(console.error);
        
        if (workspace) {
            workspace.setTitle(context.client.name);
        };
    };
});
```

Go to the **Stocks** app, find the `TODO: Chapter 8.5` comment, subscribe to the [`onContextUpdated()`](../../../reference/core/latest/windows/index.html#!WebWindow-onContextUpdated) event and set up the stocks for the selected client:

```javascript
// In `start()`.

glue.windows.my().onContextUpdated((context) => {
    if (context.client) {
        const clientPortfolio = context.client.portfolio;
        const stocksToShow = stocks.filter(stock => clientPortfolio.includes(stock.RIC));

        setupStocks(stocksToShow);
    };
});
```

Now when you select a client in the **Clients** app, a new Workspace should open with the **Client Details** and **Stocks** apps showing the relevant client information.

### 8.6. Modifying Workspaces

Next, you have to make the **Stock Details** app appear in the same Workspace as a sibling of the **Stocks** app when the user clicks on a stock. You have to check whether the **Stock Details** app has already been added to the Workspace, and if not - add it and update its context with the selected stock, otherwise - only update its context.

*To achieve this functionality, you will have to manipulate a Workspace and its elements. It is recommended that you familiarize yourself with the Workspaces terminology to fully understand the concepts and steps below. You can use the available documentation about [Workspaces Concepts](../../../core/capabilities/workspaces/index.html#workspaces_concepts), [Workspace Box Elements](../../../glue42-concepts/windows/workspaces/javascript/index.html#box_elements) and the [Workspaces API](../../../reference/core/latest/workspaces/index.html).*

The **Stocks** app is a [`WorkspaceWindow`](../../../reference/core/latest/workspaces/index.html#!WorkspaceWindow) that is the only child of a [`Group`](../../../reference/core/latest/workspaces/index.html#!Group) element. If you add the **Stock Details** app as a child to that `Group`, it will be added as a second tab window and the user will have to manually switch between both apps. The **Stock Details** has to be a sibling of the **Stocks** app, but both apps have to be visible within the same parent element. That is why, you have to add a new `Group` element as a sibling of the existing `Group` that contains the **Stocks** app, and then load the **Stock Details** app in it.

After the **Stocks Details** app has been opened in the Workspace as a [`WorkspaceWindow`](../../../reference/core/latest/workspaces/index.html#!WorkspaceWindow), you have to pass the selected stock as its context. To do that, get a reference to the underlying [Glue42 Window](../../../reference/core/latest/windows/index.html#!WebWindow) object of the **Stock Details** window using the [`getGdWindow()`](../../../reference/core/latest/workspaces/index.html#!WorkspaceWindow-getGdWindow) method of the [`WorkspaceWindow`](../../../reference/core/latest/workspaces/index.html#!WorkspaceWindow) instance and update its context with the [`updateContext()`](../../../reference/core/latest/windows/index.html#!WebWindow-updateContext) method.

Go to the `stockClickedHandler()` function of the **Stocks** app, find the `TODO: Chapter 8.6` comment, comment out or delete the code for starting the **Stock Details** app with the Application Management API and add the following:

```javascript
// In `stockClickedHandler()`.

// Reference to the Glue42 Window object of the Stock Details instance.
let detailsGlue42Window;

const myWorkspace = await glue.workspaces.getMyWorkspace();

// Reference to the `WorkspaceWindow` object of the Stock Details instance.
let detailsWorkspaceWindow = myWorkspace.getWindow(window => window.appName === "Stock Details");

// Check whether the Stock Details has already been opened.
if (detailsWorkspaceWindow) {
    detailsGlue42Window = detailsWorkspaceWindow.getGdWindow();
} else {
    // Reference to the current window.
    const myId = glue.windows.my().id;
    // Reference to the immediate parent element of the Stocks window.
    const myImmediateParent = myWorkspace.getWindow(window => window.id === myId).parent;
    // Add a `Group` element as a sibling of the immediate parent of the Stocks window.
    const group = await myImmediateParent.parent.addGroup();

    // Open the Stock Details window in the newly create `Group` element.
    detailsWorkspaceWindow = await group.addWindow({ appName: "Stock Details" });
    await detailsWorkspaceWindow.forceLoad();
    detailsGlue42Window = detailsWorkspaceWindow.getGdWindow();
};

// Update the window context with the selected stock.
detailsGlue42Window.updateContext({ stock });
```

*Note that [`forceLoad()`](../../../reference/core/latest/workspaces/index.html#!WorkspaceWindow-forceLoad) is used to make sure that the **Stock Details** app is loaded and a [Glue42 Window](../../../reference/core/latest/windows/index.html#!WebWindow) instance is available. This is necessary, because [`addWindow()`](../../../reference/core/latest/workspaces/index.html#!Group-addWindow) adds a new window to the [`Group`](../../../reference/core/latest/workspaces/index.html#!Group) (meaning that it exists as an element in the Workspace), but it does not guarantee that the content has loaded.*

Now, go to the **Stock Details** app, find the `TODO: Chapter 8.6` comment in the `start()` function, check for the selected stock in the window context and subscribe for context updates. Comment out or delete the existing code for setting the stock details and listening for context and subscription updates and replace it with the following:

```javascript
// In `start()`.

const context = glue.windows.my().context;
let selectedStock;

subscription.onData((streamData) => {
    if (!selectedStock) {
        return;
    }
    const newPrices = streamData.data.stocks;
    const selectedStockPrice = newPrices.find(prices => prices.RIC === selectedStock.RIC);
    updateStockPrices(selectedStockPrice.Bid, selectedStockPrice.Ask);
});

if (context && context.stock) {
    selectedStock = context.stock;
    setFields(selectedStock);
};

glue.windows.my().onContextUpdated(context => {
    if (context.stock) {
        selectedStock = context.stock;
        setFields(selectedStock);
    };
});
```

## Congratulations!

You have successfully completed the **Glue42 Core** JavaScript tutorial! If you are a React or an Angular developer, try also the [React](../react/index.html) and [Angular](../angular/index.html) tutorials for **Glue42 Core**.