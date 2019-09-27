---
title: javascript基础总结
date: 2019-05-15 11:26:35
tags: 前端
catagories: javascript
---

#### 一. 继承



#### 二. lazyMan 笔试题(题目自行上网搜索)

[参考链接](https://github.com/fi3ework/blog/issues/36)

1. 使用队列和next调用下一个任务（同步方式处理）

```javascript
class LazyMan {
    constructor(name) {
        this.tasks = [];
        const task = name => {
            console.log(`Hi! This is ${name}`);
            this.next();
        };
        this.tasks.push(task);
        setTimeout(() => {
            this.next();
        }, 0);
    }
    eat(food) {
        const task = () => {
            console.log('eat ' + food);
            this.next();
        };
        this.tasks.push(task);
        return this;
    }
    sleep(time) {
        const task = () => {
            setTimeout(() => {
                console.log('Wake up after ' + time + 'ms');
                this.next();
            }, time);
        };
        this.tasks.push(task);
        return this;
    }
    sleepFirst(time) {
        const task = () => {
            setTimeout(() => {
                console.log('Wake up after ' + time + 'ms');
                this.next();
            }, time);
        };
        this.tasks.unshift(task);
        return this;
    }
    next() {
        const task = this.tasks.shift();
        task && task.apply(this);
    }
}

function lazyMan(name) {
    return new LazyMan(name);
}

lazyMan('ff')
    .eat('food')
    .sleep(2000)
    .eat('lunch')
    .sleepFirst(1000);

// 通过next函数掉起下一个函数，实现sleep。如果使用promise实现sleep的话，返回的是一个promise对象而不是this
// 用一个队列存储函数，可以随意变化函数的执行顺序
// 每次调用eat或者sleep函数的时候只是将函数存入队列，而constructor里面的setTimeout才是开始从队列里面取出函数来执行。有的方式是通过一个end()函数来作为标志，开始从队列里面取出函数执行
```

2. 使用promise（异步方式处理）

```javascript
class LazyMan {
    constructor(name) {
        this.name = name;
        this._preSleepTime = 0;
        this.sayName = this.sayName.bind(this);
        this.p = Promise.resolve()
            .then(() => {
                if (this._preSleepTime > 0) {
                    return this.holdOn(this._preSleepTime);
                }
            })
            .then(this.sayName);
    }
    holdOn(time) {
        return new Promise(resolve => {
            setTimeout(() => {
                console.log('Wake up after ' + time + 'ms');
                resolve();
            }, time);
        });
    }
    sayName() {
        console.log(`Hi! This is ${this.name}`);
        return this;
    }
    eat(meal) {
        this.p = this.p.then(() => {
            console.log('eat ' + meal);
        });
        return this;
    }
    sleep(time) {
        this.p = this.p.then(() => this.holdOn(time));
        return this;
    }
    sleepFirst(time) {
        this._preSleepTime = time;
        return this;
    }
}
new LazyMan('ff')
    .eat('food')
    .sleep(2000)
    .eat('lunch')
    .sleepFirst(1000);

// 注意promise then函数是微任务，所以会先执行eat sleep sleepFirst 再执行.then里面对_preSleepTime的判断
// 注意holdOn函数需要返回一个promise，否则sleep不会停留几秒钟，会立刻执行下面的eat函数
```

3. 使用队列 + promise + setTimeout/async await (异步方式)

```javascript
class LazyMan {
    constructor(name) {
        this.name = name;
        this.queue = [];
        this.sayName();
        // 下面这行和setTimeout功能类似：用来触发调用队列里面的函数
        Promise.resolve().then(() => this.callByOrder(this.queue));
        // 或者这样写
        // setTimeout(async () => {
        //     for (let todo of this.queue) {
        //         await todo()
        //     }
        // }, 0)
    }

    callByOrder(queue) {
        let sequence = Promise.resolve();
        this.queue.forEach(item => {
            sequence = sequence.then(item);
        });
    }

    sayName() {
        this.queue.push(() => {
            console.log(`Hi! this is ${this.name}!`);
        });
        return this;
    }

    holdOn(time) {
        return () =>
            new Promise(resolve => {
                setTimeout(() => {
                    console.log(`Wake up after ${time} second`);
                    resolve();
                }, time * 1000);
            });
    }

    sleep(time) {
        this.queue.push(this.holdOn(time));
        return this;
    }

    eat(meal) {
        this.queue.push(() => {
            console.log(`eat ${meal}`);
        });
        return this;
    }

    sleepFirst(time) {
        this.queue.unshift(this.holdOn(time));
        return this;
    }
}

new LazyMan('ff')
    .eat('food')
    .sleep(2)
    .eat('lunch')
    .sleepFirst(1);
```

总结：

1. 维护顺序可以用队列，可以用promise.then
2. 触发队列(promise.then)内事件执行可以用setTimeout或者promise.then
3. 如果队列内函数全部是同步处理的话，直接可以用一个next函数来触发下一个函数。

​    如果队列内函数有异步操作的话，需要将队列内函数分装成async await 函数以保证执行顺序。