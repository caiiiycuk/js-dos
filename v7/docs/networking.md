---
id: networking
slug: /cloud/networking
title: Networking
sidebar_label: Networking 
---

Some dos games offers multiplayer gaming based on ipx, modem, or direct connection.
Using browser isn't possible to directly connect two clients. BUT, using js-dos 
cloud you can emulate direct connection.

## IPX

To activate IPX support in js-dos you need to set `withNetworkingApi` to `true`:

```ts
	Dos(<element>, {
        withNetowkringApi: true,
	}).run(<bundleUrl>);
```

However to connect two js-dos clients by ipx user should setup ipx server and provied server token to other clients. Looks this tutorial video that explains how to connect two browsers with ipx protocol.

<iframe width="560" height="315" src="https://www.youtube.com/embed/XEoWLQmU168" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Local IPX server

You can use own server to connect two browsers by ipx (in that case you can ignore withNetworkingApi setting). To do this, please checkout js-dos ipx server and start it.

**TODO: setup server**

When server is started you need to connect js-dos to that server using API:

```ts
    ci.networkConnect(NETWORK_DOSBOX_IPX, "ws://127.0.0.1", 1901);
```

If success case you will see green "Connected" bage over js-dos window.

To disconnect please use `ci.networkDisconnect(NETWORK_DOSBOX_IPX)`.
