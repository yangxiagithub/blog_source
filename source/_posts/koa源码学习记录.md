---
title: koa源码学习记录
date: 2018-02-09 16:11:28
categories: javascript
tags: 前端
---

### 整体了解

koa源码主要有4个文件

```
|____response.js
|____request.js
|____context.js
|____application.js
```

其中response和request，context文件导出的对象，都是作为koa实例属性的原型对象，定义了相关对象的方法和属性。

比较重要的是application文件。

### 解析application文件

#### 1. 从koa的使用开始讲起

`var app = new koa()`

这句代码生成了一个koa实例。

```
app.use(async (ctx, next) => {
    doSomething();
    await next();
});
app.use(async (ctx, next) => {
    doSomethingElse();
    await next();
});
```

上面代码定义了使用的中间件

`app.listen(3004);`

开启服务，监听端口3004。

#### 2.源码解析

（1）整个文件导出的是一个构造函数

#### `module.exports = class Application extends Emitter {}`

appliation文件导出了一个构造函数，这个构造函数继承了node里面的Emitter类，所以它的实例可以有Emitter的方法。

（2）use方法

```
use(fn) {
	// 此处省去不重要的代码
    this.middleware.push(fn);
    return this;
  }
```

use方法只干了一件事情，就是将中间件函数push进一个数组里面。

（3）listen函数

```
listen(...args) {
    debug('listen');
    const server = http.createServer(this.callback());
    return server.listen(...args);
  }
```

listen函数也很简单，就是执行了callback函数，得到一个服务器对象，再监听某个口，所以我们继续看callback函数

（4）callback函数

```
callback() {
    const fn = compose(this.middleware);
    if (!this.listeners('error').length) this.on('error', this.onerror);
    const handleRequest = (req, res) => {
      const ctx = this.createContext(req, res);
      return this.handleRequest(ctx, fn);
    };
    return handleRequest;
  }
```

callback函数比较重要。首先，它将中间件数组作为参数，传入compose函数中，compose函数会返回一个函数fn，fn函数有什么作用呢？只要执行fn函数，中间件函数就能依次被调用，前提是每个中间件都执行了next()。继续说callback函数的第二步，callback函数返回的一个函数handleRequest，handleRequest这个函数是用来处理每个请求的，当请求来临时，这个函数就会被调用。所以我们来看看handleRequest函数是怎样处理每个请求的：

请求来了之后，handleRequest会为每个请求生成一个全新的context对象，然后调用this.handleRequest来处理请求。

下面是this.handleRequest的代码：

```
handleRequest(ctx, fnMiddleware) {
    const res = ctx.res;
    res.statusCode = 404;
    const onerror = err => ctx.onerror(err);
    const handleResponse = () => respond(ctx);
    onFinished(res, onerror);
    return fnMiddleware(ctx).then(handleResponse).catch(onerror);
  }
```

注意`fnMiddleware(ctx)`这句代码，它就是执行了我们之前说的compose函数的返回函数。所以每个中间件 函数都可以将请求做一遍处理。而`fnMiddleware(ctx)`返回的是一个promise，所以调用then函数。在then函数里面调用了handleResponse, 也就是respond函数。

```
function respond(ctx) {
  // allow bypassing koa
  if (false === ctx.respond) return;

  const res = ctx.res;
  if (!ctx.writable) return;

  let body = ctx.body;
  const code = ctx.status;

  // ignore body
  if (statuses.empty[code]) {
    // strip headers
    ctx.body = null;
    return res.end();
  }

  if ('HEAD' == ctx.method) {
    if (!res.headersSent && isJSON(body)) {
      ctx.length = Buffer.byteLength(JSON.stringify(body));
    }
    return res.end();
  }

  // status body
  if (null == body) {
    body = ctx.message || String(code);
    if (!res.headersSent) {
      ctx.type = 'text';
      ctx.length = Buffer.byteLength(body);
    }
    return res.end(body);
  }

  // responses
  if (Buffer.isBuffer(body)) return res.end(body);
  if ('string' == typeof body) return res.end(body);
  if (body instanceof Stream) return body.pipe(res);

  // body: json
  body = JSON.stringify(body);
  if (!res.headersSent) {
    ctx.length = Buffer.byteLength(body);
  }
  res.end(body);
```

这个函数做的操作是返回一个response对象作为请求最终的响应。

（5）compose函数

另外我想说的一个函数是compose函数，也就是处理中间件数组的函数。

```
function compose (middleware) {
  // 前面对参数进行校验的代码已经被删除，只看重点代码
  return function (context, next) {
    // last called middleware #
    let index = -1
    return dispatch(0)
    function dispatch (i) {
      if (i <= index) return Promise.reject(new Error('next() called multiple times'))
      index = i
      let fn = middleware[i]
      if (i === middleware.length) fn = next
      if (!fn) return Promise.resolve()
      try {
        return Promise.resolve(fn(context, function next () {
          return dispatch(i + 1)
        }))
      } catch (err) {
        return Promise.reject(err)
      }
    }
  }
}
```

这个函数入参是中间件数组，出参是一个匿名函数。当调用这个匿名函数（称为a）的时候，就会调用dispatch函数，也就是会自动执行第一个中间件。当第一个中间件里面调用了next()的时候，就会再次调用dispatch函数，同理，如果第二个中间件里面调用了next()的时候，就会第三次调用dispatch….依次类推，直到所有的中间件都执行完了，便返回Promise.resolve()。

（6）为什么中间件需要写成async await函数或者是generator函数？

是为了保证中间件执行的顺序性，next函数之前的操作都要有结果了才能执行next函数，进入下一个中间件。

如果所有的中间件都是同步操作，写不写async await或者generator没有什么关系，但是如果中间件里面有异步操作，却没有将中间件函数写成async await或者generator的形式，那么在执行异步操作时，还没有得到异步操作的结果就有可能已经进入下一个中间件了。

```
app.use((ctx, next) => {
    var fileContent = fs.readFile(path);
    next(ctx, fileContent);
});
```

 这里没有写async await，而fs.readFile是异步操作，这造成的结果是fileContent并不是文件内容，因为异步调用结果还没来得及返回就已经执行next了，这样的话，中间件的顺序就无法保证了。

```
app.use(async (ctx, next) => {
    var fileContent = await fs.readFile(path);
    next(ctx, fileContent);
});
```

这里写了async await，那么await在得到异步操作结果之前会阻塞下面的代码，得到异步操作返回结果之后再继续执行下面的代码，从而保证了顺序性。

#### 3.总结Koa的优点

##### 1. 本身框架轻量级并且简单，开发者可以自定义需要的中间件。

##### 2.解决了异步回调问题，写异步代码就像写同步一样方便。









