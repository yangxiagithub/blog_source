---
title: 手写一款promise的简单实现
date: 2018-05-29 14:56:47
tags: 异步编程
categories: javascript
---

#### 一. promise简单实现

```Javascript
class MyPromise {
    constructor(excutor) {
        if (!isFunction(excutor))
            throw new TypeError(
                'Pass function object to create a Promise object'
            );
        this.status = 'pending';
        this.value = null;
        this.reason = null;
        this.onFulfilledCallbacks = [];
        this.onRejectedCallbacks = [];
		// excutor函数有可能出错，所以用try  catch包住
        try {
            // 需要绑定this
            excutor(this.resolve.bind(this), this.reject.bind(this));
        } catch (err) {
            this.reject(err);
        }
    }
    resolve(value) {
        if (this.status === 'pending') {
            this.value = value;
            this.status = 'fulfilled';
            this.onFulfilledCallbacks.forEach(item => {
                if (isFunction(item)) {
                    item();
                }
            });
        }
    }
    reject(reason) {
        if ((this.status = 'pending')) {
            this.reason = reason;
            this.status = 'rejected';
            this.onRejectedCallbacks.forEach(item => {
                if (isFunction(item)) {
                    item();
                }
            });
        }
    }
    /**
     * 
     * @param {*} onFulfilled 
     * @param {*} onRejected 
     * then 函数需要返回一个新的promise
     */
    then(onFulfilled, onRejected) {
        onFulfilled = isFunction(onFulfilled)
            ? onFulfilled
            : function(data) {
                  this.resolve(data);
              };
        onRejected = isFunction(onRejected)
            ? onRejected
            : function(err) {
                  throw err;
              };
        let self = this;
        if (this.status === 'fulfilled') {
            return new MyPromise((resolve, reject) => {
                try {
                    let x = onFulfilled(self.value);
                    if (x instanceof MyPromise) {
                        x.then(resolve, reject);
                    } else {
                        resolve(x);
                    }
                } catch (err) {
                    reject(err);
                }
            });
        }
        if (this.status === 'rejected') {
            return new Promise((resolve, reject) => {
                try {
                    let x = onRejected(self.reason);
                    if (x instanceof MyPromise) {
                        x.then(resolve, reject);
                    } else {
                        resolve(x);
                    }
                } catch (err) {
                    reject(err);
                }
            });
        }
        if (this.status === 'pending') {
            return new MyPromise((resolve, reject) => {
                self.onFulfilledCallbacks.push(() => {
                    let x = onFulfilled(self.value);
                    if (x instanceof MyPromise) {
                        x.then(resolve, reject);
                    } else {
                        resolve(x);
                    }
                });
                self.onRejectedCallbacks.push(() => {
                    let x = onRejected(self.reason);
                    if (x instanceof MyPromise) {
                        x.then(resolve, reject);
                    } else {
                        resolve(x);
                    }
                });
            });
        }
    }
    catch(fn) {
        return this.then(null, fn);
    }
    // 所有的入参promise都resolve之后才返回一个resolve的结果promise
    static all(arr) {
        if (!arr instanceof Array)
            throw new TypeError('Pass array to create a Promise array');
        return new MyPromise((resolve, reject) => {
            let length = arr.length;
            const resultArr = [];
            arr.forEach((item, index) => {
                try {
                    if (item instanceof MyPromise) {
                        item.then(value => {
                            resultArr[index] = value;
                            if (--length === 0) {
                                resolve(resultArr);
                            }
                        });
                    } else if (isFunction(item)) {
                        resultArr[index] = item();
                        if (--length === 0) {
                            resolve(resultArr);
                        }
                    }
                } catch (err) {
                    reject(err);
                }
            });
        });
    }
    /** race方法
     * 只要有一个入参promise被resolve之后，就将返回的promise进行resolve。
     * 注意这种事先方案并不会将返回得比较慢的promise进行取消执行。后面的promise即使resolve或者reject了也无法改变被返回的promise的状态
     */
    static race(promiseArr) {
        return new MyPromise((resolve, reject) => {
            if (!promiseArr instanceof Array)
                throw new TypeError('Pass array to create a Promise array');
            promiseArr.forEach(item => {
                item.then(resolve, reject);
            });
        });
    }
}

function isFunction(fn) {
    return typeof fn === 'function';
}

module.exports = MyPromise;
```

#### 二. 测试代码

1. 测试基本功能---------测试代码1

   ```javascript
   const MyPromise = require('./my-promise.js');
   const ThePromise = MyPromise;
   const fs = require('fs');

   const test = () => {
       const pro = new ThePromise((resolve, reject) => {
           fs.readFile('./a.js', 'utf-8', (err, data) => {
               if (err) {
                   throw err;
               }
               console.log('data111:', data);
               resolve(data);
           });
       });
       console.log('pro', pro);
       const pro2 = pro.then(
           value => {
               console.log('data2222:', value);
               return new ThePromise(resolve => {
                   fs.readFile('./a.js', 'utf-8', (err, data) => {
                       if (err) {
                           throw err;
                       }
                       console.log('data3333:', data);
                       resolve(data);
                   });
               });
           },
           reason => {
               throw reason;
           }
       );
       // 注意这里是pro2.then  如果是pro.then 那么执行顺序会不一样
       pro2.then(data => {
           console.log('data4444:', data);
           return new ThePromise(resolve => {
               fs.readFile('./a.js', 'utf-8', (err, data) => {
                   if (err) {
                       throw err;
                   }
                   console.log('data555:', data);
                   resolve(data);
               });
           });
       });
   };

   test();
   ```

2. 测试promise.all功能--------测试代码2

   ```javascript
   const MyPromise = require('./my-promise.js');
   const ThePromise = MyPromise;
   const fs = require('fs');

   const testAll = function() {
       const pro1 = new MyPromise((resolve, reject) => {
           fs.readFile('./a.js', 'utf-8', (err, data) => {
               console.log('a.js:', data);
               resolve(data);
           });
       });
       const pro2 = new MyPromise((resolve, reject) => {
           fs.readFile('./b.js', 'utf-8', (err, data) => {
               console.log('b.js:', data);
               resolve(data);
           });
       });
       MyPromise.all([pro1, pro2]).then(arr => {
           console.log('arr[0]:', arr[0]);
           console.log('arr[1]:', arr[1]);
       });
   };

   testAll();
   ```

3. 测试promise.race功能---------测试代码3

   ```Javascript
   const MyPromise = require('./my-promise.js');
   const ThePromise = MyPromise;
   const fs = require('fs');

   const testRace = function() {
       const pro1 = new MyPromise((resolve, reject) => {
           fs.readFile('./a.js', 'utf-8', (err, data) => {
               console.log('a.js:', data);
               resolve(data);
           });
       });
       const pro2 = new MyPromise((resolve, reject) => {
           fs.readFile('./b.js', 'utf-8', (err, data) => {
               console.log('b.js:', data);
               resolve(data);
           });
       });
       MyPromise.race([pro1, pro2]).then(data => {
           console.log('race-result:', data);
       });
   };
   testRace();
   ```

#### 三. 注意点

1. 一个promise在resolve之后，就会按照顺序执行这个promise所有的then函数里所注册的函数。

   注意是这个promise。而不是由then函数重新生成的promise。

   比如

   ```javascript
   const pro1 = new Promise((resolve, reject) => {resolve('aaa')})
   const pro2 = pro1.then((data) => {
       // 这是一个异步操作
       // 打印点0
       fs.readFile('./b.js', 'utf-8', (err, data) => {
           	// 打印点1
               console.log('b.js:', data);
               resolve(data);
       });
   }, (reason) => {console.log(reason)});
   const pro22 = pro1.then(data => {
       // 打印点2
       consolele.log(data);
   }, (reason) => {console.log(reason)});
   const pro3 = pro2.then((data) => {
       // 打印点3
       console.log(data);
   });
   ```

   打印顺序为：打印点0  打印点2 打印点1 打印点3

   原因：0，1 和2本来都是应该在pro1被resolve之后就会执行，但是打印完0之后，1是在一个异步函数结束之后才会打印，所以pro1.then会先返回一个pending状态的promise，并且继续执行pro1的第二个then函数。而打印点3是必须要pro1的第一个then函数所返回的promise被resolve只有才能执行的，所以会在最后打印。

2. 由此可见，promise之所以能够保持异步函数执行顺序，是因为每个promise只有一个then函数，在then函数里面又重新返回一个promise，然后下一个promise是在前一个then函数所返回的promise被resolve之后才执行，也就是这样：

   ```
   // 可以保证顺序：
   pro1.then().then().then()
   // 下面两个then之间在有异步操作情况下不可以保证顺序，但是pro1和他对应的then还是可以保证顺序的
   pro1.then()
   pro1.then()
   ```

   也就是说：

   一个promise如果对应了两个then，而这两个then中又有异步操作的话，这两个then是无法保证顺序的。

   只有promise的入参函数里面的操作和这个promise的then函数里面的操作才是保证执行先后顺序的：即promise的入参函数里面的操作先执行，then函数里面的操作后执行。

   而两个并列的then函数之间如果有异步操作则无法保证顺序，同步的话还是可以保证按照顺序执行的。因为从上面实现代码可以看出来，当promise的入参函数返回的promise是pending状态时，then函数里面的操作是被存入一个数组里，等待promise被resolve再拿出来执行；当promise的入参函数返回的promise是resolve或者reject状态时，则直接可以执行相应的then函数里面的操作，不需要存入数组了