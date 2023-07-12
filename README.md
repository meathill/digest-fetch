Digest fetch
========

This is a simple wrapper for fetch, to make a request with digest auth.

It uses no dependencies, can work in Edge Function environment.


Usage
-----

```js
import digestFetch from '@meathill/digest-fetch';

const response = await digestFetch(
  url, 
  { // data
    foo: 'bar',
  },
  {
    method: 'POST',
    realm: 'realm',
    username: 'username',
    password: 'password',
  },
);
```

License
-------

[MIT](https://opensource.org/license/MIT/)
