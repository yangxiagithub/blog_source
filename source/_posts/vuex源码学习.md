---
title: vuex源码学习
date: 2018-12-20 12:19:08
tags: 前端
catogories: javascript
---

### 一. 前言

使用vue的小伙伴们对于vuex应该是非常熟悉的，其作用是使用一个store对象来存储应用层级状态和数据。
放上一张store的图片
<p class="img-tip" data-str="store2.png"><img src='https://sf3-ttcdn-tos.pstatp.com/img/tos-cn-v-0000/03934e71f6114ca69ae17855462d0a47~noop.png' height=300 width=300/></p>

store就是这样一个对象。可以看到里面有我们熟悉的commit，dispatch函数，state属性；也有和模块相关的_modules,_modulesNamespaceMap内部属性等等。

使用起来非常简单：
```
import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);
const store = new Vuex.Store({
    state: {
        a: 0
    },
    action: {
        action1: ({commit}) => {
            // 省略其他步骤，这里一般是一些异步操作
            commit('changeA', 10);
        }
    },
    mutations: {
        changeA: (state, data) => {
        	state.a = data;
    	}
    }
}
new Vue({
    store,
    el: '#app',
});
```
在组件里
```
this.$store.commit('changeA', 2);
```
就能达到修改state里面的数据a的效果。
这只是最简单的情况，里面还可以有模块划分，getter，插件机制，工具函数等等具体使用可以[点击链接](https://vuex.vuejs.org/zh/)。今天我们就可以大概探索一下其中的奥秘，看看它的源码实现。

### 二. 整体流程分析
根据上面使用案例的代码，发现代码其实也就是做了两个事情：首先执行的是Vue.use(Vuex); 之后将实例化的一个Vuex.Stored的实例当做参数传进Vue里。

对于第一个事情，vue的插件都是通过在使用Vue.use()时自动调用了插件的install方法进行初始化。所以vuex只需要定义好install函数，然后业务方调用一下vue的use函数，就可以了。

对于第二个事情，就得看看Vuex导出的Store构造函数干了什么。

综上所述我们要看两个东西：一个是install函数，另一个是Store构造函数。

#### 1. install函数
```
export function install (_Vue) {
  if (Vue && _Vue === Vue) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(
        '[vuex] already installed. Vue.use(Vuex) should be called only once.'
      )
    }
    return
  }
  Vue = _Vue
  applyMixin(Vue)
}
```
applyMixin里面主要代码:
```
Vue.mixin({ beforeCreate: vuexInit })
function vuexInit () {
    const options = this.$options
    // store injection
    if (options.store) {
      this.$store = typeof options.store === 'function'
        ? options.store()
        : options.store
    } else if (options.parent && options.parent.$store) {
      this.$store = options.parent.$store
    }
  }
```
由此可以看出：
vuex的install函数里面做了两件事：

(1) 限定vuex只可以被安装一次

(2) 给vue的每个实例注入store

其中比较重要的是第二件事：在beforeCreate生命周期函数里自动执行注入$store属性。这样所有的组件只要是有options.parent属性，就能在beforeCreate的时候传入store。

但是注意一点：自己new出来的组件是需要手动传入store的。

#### 2. Store构造函数
在具体学习之前，先看看执行Store构造函数生成实例的一些重要过程，留个印象：

- 生成一个ModuleCollection实例this._modules，得到根模块。
  - 递归生成每个模块，并记录模块之间的层级关系（注意模块之间的层级结构是通过数组path来体现的）
- 将dispatch和commit函数绑定this为当前store实例
- 递归安装this._modules里的每一个模块
  - 将子模块的state放进根级state属性里
  - 将模块内的mutaions actions getters 与命名空间进行绑定
- 执行resetStoreVM，让store.getters具有响应式

##### （1）首先可以看下Store的constructor函数(只列出重要代码)
```
 constructor (options = {}) {
    // store internal state
    this._committing = false
    this._actions = Object.create(null)
    this._actionSubscribers = []
    this._mutations = Object.create(null)
    this._wrappedGetters = Object.create(null)
    this._modules = new ModuleCollection(options)
    this._modulesNamespaceMap = Object.create(null)
    this._subscribers = []
    this._watcherVM = new Vue()

    // bind commit and dispatch to self
    const store = this
    const { dispatch, commit } = this
    this.dispatch = function boundDispatch (type, payload) {
      return dispatch.call(store, type, payload)
    }
    this.commit = function boundCommit (type, payload, options) {
      return commit.call(store, type, payload, options)
    }

    const state = this._modules.root.state
    
    installModule(this, state, [], this._modules.root)

    resetStoreVM(this, state)
  }
```
首先定义了一些实例属性，包括_committing ,  _actions, _actionSubscribers, _mutations等等。这里可以看一下this._modules = new ModuleCollection(options) 这句代码，它生成了一个ModuleCollection实例，一个模块集合。我们看看ModuleCollection构造函数
##### （2）ModuleCollection类
ModuleCollection构造函数里只执行了一个register函数。
```
register (path, rawModule, runtime = true) {
    const newModule = new Module(rawModule, runtime)
    if (path.length === 0) {
      this.root = newModule
    } else {
      const parent = this.get(path.slice(0, -1))
      parent.addChild(path[path.length - 1], newModule)
    }

    // register nested modules
    if (rawModule.modules) {
      forEachValue(rawModule.modules, (rawChildModule, key) => {
        this.register(path.concat(key), rawChildModule, runtime)
      })
    }
  }
```
register函数里得到了一个Module实例newModule。

如果是根模块的话，就将newModule赋值给root属性；否则将当前模块和父模块使用addChild方法建立关联(在module实例的_children数组上添加一个元素)。

接着处理子模块：根据我们之前调用Store构造函数时传的对象(rawModule)里的modules字段, 生成了子模块。
**注意在生成子模块的时候传入的path变成了path.concat(key)，path数组里元素的顺序代表着模块之间的关系。** 例如
```
path = ['m1', 'm2'];
// 意思是根模块下有一个m1模块，m1模块下有一个m2模块。
```
下面我们看看前面提到的Module类。
##### （3） Module类

    constructor (rawModule, runtime) {
        this.runtime = runtime
        // Store some children item
        this._children = Object.create(null)
        // Store the origin module object which passed by programmer
        this._rawModule = rawModule
        const rawState = rawModule.state
    
        // Store the origin module's state
        this.state = (typeof rawState === 'function' ? rawState() : rawState) || {}
      }

这个对象有3个重要属性：

a. 一个模块的子模块（_children属性，一个数组）

b. 传入的用于生成module的config对象（_rawModule）

c.模块内的state对象

其中state对象是公有属性，其他两个是内部的私有属性

每个实例有几个重要方法：用于操作child子模块的方法

    addChild (key, module) {
        this._children[key] = module
    }
    
    removeChild (key) {
        delete this._children[key]
    }
    
    getChild (key) {
       return this._children[key]
    }
这几个方法在实例化ModuleCollection调用register时会被使用，用来记录模块之间的层级关系，上面的代码已经列出。
##### （4）回到Store的构造函数
所以当代码执行到Store构造函数的this._modules = new ModuleCollection(options) 时，已经生成了一个ModuleCollection实例(this._modules），this._modules的root属性指向了根模块。同时递归生成了各个子模块。

与此同时，其他属性也通过Object.create(null)得到了一个初始值null

##### （5）绑定dispatch和commit函数的作用域
```
    // Store构造函数里的代码
    const store = this
    const { dispatch, commit } = this
    	this.dispatch = function boundDispatch (type, payload) {
    	return dispatch.call(store, type, payload)
    }
    this.commit = function boundCommit (type, payload, options) {
    	return commit.call(store, type, payload, options)
    }
```

commit和dispatch是类似的，这里以commit为例：
这段代码缓存了Store类原型上的commit的方法，将在commit方法绑定this为根级store对象。这段代码的作用就是绑定commit方法的this对象。

接下来执行的是installModule方法
##### （6）installModule方法
```
function installModule (store, rootState, path, module, hot) {
  const isRoot = !path.length
  const namespace = store._modules.getNamespace(path)

  // register in namespace map
  if (module.namespaced) {
    store._modulesNamespaceMap[namespace] = module
  }

  // set state
  if (!isRoot && !hot) {
    const parentState = getNestedState(rootState, path.slice(0, -1))
    const moduleName = path[path.length - 1]
    store._withCommit(() => {
      Vue.set(parentState, moduleName, module.state)
    })
  }

  const local = module.context = makeLocalContext(store, namespace, path)

  module.forEachMutation((mutation, key) => {
    const namespacedType = namespace + key
    registerMutation(store, namespacedType, mutation, local)
  })

  module.forEachAction((action, key) => {
    const type = action.root ? key : namespace + key
    const handler = action.handler || action
    registerAction(store, type, handler, local)
  })

  module.forEachGetter((getter, key) => {
    const namespacedType = namespace + key
    registerGetter(store, namespacedType, getter, local)
  })

  module.forEachChild((child, key) => {
    installModule(store, rootState, path.concat(key), child, hot)
  })
```
获取所安装模块的命名空间，如果命名空间存在，就在_modulesNamespaceMap对象上存起来。

    const local = module.context = makeLocalContext(store, namespace, path)

这句是生成一个与store类似的context对象，里面的commit和dispatch方法都是与当前模块的命名空间进行了关联，可以在模块内不需要关注当前命名空间是什么，state拿到的也是当前模块的state，当然如果你想拿到根级别state或者store也是可以拿到的。总之makeLocalContext的作用是让命名空间使用起来更方便，让内部代码不用关注当前命名空间。

##### （7）在installModule里面注册mutation，action和getter
三个类似，这里拿mutaion举出例子：
```
    forEachMutation (fn) {
        if (this._rawModule.mutations) {
          forEachValue(this._rawModule.mutations, fn)
        }
    }
    function forEachValue (obj, fn) {
      Object.keys(obj).forEach(key => fn(obj[key], key))
    }

    function registerMutation (store, type, handler, local) {
      const entry = store._mutations[type] || (store._mutations[type] = [])
      entry.push(function wrappedMutationHandler (payload) {
        handler.call(store, local.state, payload)
      })
    }
```
上面代码其实就是对每一个mutation先处理他的namespace，把自身type和namespace拼接得到最终名字，
然后执行registerMutation，registerMutation就是在store._mutations[type]里面添加一个handle，这个handler是这个mutation被commit的时候会被调用的。
同时将这个handler的this绑定为store实例对象，并传入模块内部state，所以模块内部的mutation直接能拿到模块内部的state来使用。

所以这一部分作用就是绑定命名空间和this对象，并将模块内state传入mutation。
##### （8）递归调用installModule方法。

    module.forEachChild((child, key) => {
        installModule(store, rootState, path.concat(key), child, hot)
     })

对每一个modules对象调用installModule方法。

注意在子模块执行installModule的时候下面代码会被执行

    if (!isRoot && !hot) {
        const parentState = getNestedState(rootState, path.slice(0, -1))
        const moduleName = path[path.length - 1]
        store._withCommit(() => {
          Vue.set(parentState, moduleName, module.state)
        })
      }

这段代码的作用是将子模块的state添加到根级state上。我们传入的state是按照模块区分的，而这部分代码将所有的state合成了一个大的state对象。并且利用Vue.set实现数据响应式，让state改变触发视图的改变。
##### （9）resetStoreVM函数

installModulec彻底执行完之后，开始执行resetStoreVM，resetStoreVM作用是让store.getters具有响应式。
```
function resetStoreVM (store, state, hot) {
  const oldVm = store._vm

  // bind store public getters
  store.getters = {}
  const wrappedGetters = store._wrappedGetters
  const computed = {}
  forEachValue(wrappedGetters, (fn, key) => {
    // use computed to leverage its lazy-caching mechanism
    computed[key] = () => fn(store)
    Object.defineProperty(store.getters, key, {
      get: () => store._vm[key],
      enumerable: true // for local getters
    })
  })

  // use a Vue instance to store the state tree
  // suppress warnings just in case the user has added
  // some funky global mixins
  const silent = Vue.config.silent
  Vue.config.silent = true
  store._vm = new Vue({
    data: {
      $$state: state
    },
    computed
  })
  Vue.config.silent = silent

  // enable strict mode for new vm
  if (store.strict) {
    enableStrictMode(store)
  }

  if (oldVm) {
    if (hot) {
      // dispatch changes in all subscribed watchers
      // to force getter re-evaluation for hot reloading.
      store._withCommit(() => {
        oldVm._data.$$state = null
      })
    }
    Vue.nextTick(() => oldVm.$destroy())
  }
}
```
这段代码是生成了一个名叫_vm的vue实例，利用vue实例的computed属性可以让每一个getter都能实现数据响应。
```
forEachValue(wrappedGetters, (fn, key) => {
    // use computed to leverage its lazy-caching mechanism
    computed[key] = () => fn(store)
    Object.defineProperty(store.getters, key, {
      get: () => store._vm[key],
      enumerable: true // for local getters
    })
  })
```
从这段代码可以看出，store.getters对象里的每一个属性对应值其实就是store._vm[key]的值。

### 三. 帮助函数解析
vuex的帮助函数有5个: mapState, mapMutations, mapGetters, mapActions, createNamespacedHelpers.

具体功能就不细说了，大家可以查看官网。这里主要讲一下他们的实现。
#### 以mapState为例：
先说如何使用masState
```
    // 或者
    computed: {
       ...mapState({
            'a',
            'bb': 'b'
       }
    }
    // 或者
    computed: {
        ...mapState({
		a: state => state.some.nested.module.a
		b: state => state.some.nested.module.b
        })
    }
```

再看代码实现：
```
// 代码一
export const mapState = normalizeNamespace((namespace, states) => {
  const res = {}
  normalizeMap(states).forEach(({ key, val }) => {
    //  computedFn函数：
    res[key] = function mappedState () {
      let state = this.$store.state
      let getters = this.$store.getters
      if (namespace) {
        const module = getModuleByNamespace(this.$store, 'mapState', namespace)
        if (!module) {
          return
        }
        state = module.context.state
        getters = module.context.getters
      }
      return typeof val === 'function'
        ? val.call(this, state, getters)
        : state[val]
    }
    // mark vuex getter for devtools
    res[key].vuex = true
  })
  return res
})
```
其中normalizeNamespace方法传入一个函数（这里暂时叫fn）
并返回一个函数（这里暂时叫fn2）。normalizeNamespace作用就是将fn函数的第一个参数作为命名空间，并将命名空间做了绑定，如没有传入命名空间，则认为是根模块。
具体实现可以看下面代码：
```
// 代码二
function normalizeNamespace (fn) {
  return (namespace, map) => {
    if (typeof namespace !== 'string') {
      map = namespace
      namespace = ''
    } else if (namespace.charAt(namespace.length - 1) !== '/') {
      namespace += '/'
    }
    return fn(namespace, map)
  }
}
```
所以mapState函数就可以理解为绑定了作用域的fn函数。当我们执行mapState时，就可以理解为执行了fn。所以我们继续看代码一里面传入normalizeNamespace里面的函数（也就是我们说的fn函数）。

这个fn函数返回的是一个对象，并且对象每个属性名是传入参数对象的属性名，属性值是一个函数（我们暂时称为computedFn）。而我们使用的时候是在vue的computed里面使用的，使用代码上面也列出了，读者可以返回去看看。
所以我们就知道了为什么平时要用
```
...mapState({})
```
的形式来使用。
computedFn函数里获取到了指定命名空间的context对象里的的state和getter(所以我们在mapState的时候可以获取到模块内部的state和getter)。
computedFn返回的值是根据调用mapState时候传进来的第二个参数确定的（如不传命名空间，则这根据第一个参数确定）。
```
    // 或者
    computed: {
       ...mapState({
            'a',
            'bb': 'b'
       }
    }
    // 或者
    computed: {
        ...mapState({
		a: state => state.some.nested.module.a
		b: state => state.some.nested.module.b
        })
    }
```
上面列出的两种情况，结合代码理解：

1. 如果val是一个函数，那就执行这个函数并将命名空间内的state和getters传进去执行；
2. 如果是val不是函数，就认为是一个字符串，则将这个字符串作为state的属性来获取state值返回。

#### 2. createNamespacedHelper函数
有了上面的基础，那么createNamespacedHelper函数简单了。

首先看createNamespacedHelper的使用
```
    import { createNamespacedHelpers } from 'vuex'
    
    const { mapState, mapActions } = createNamespacedHelpers('some/nested/module')
    
    export default {
      computed: {
        // 在 `some/nested/module` 中查找
        ...mapState({
          a: state => state.a,
          b: state => state.b
        })
      },
      methods: {
        // 在 `some/nested/module` 中查找
        ...mapActions([
          'foo',
          'bar'
        ])
      }
    }
```

再看实现：
```
export const createNamespacedHelpers = (namespace) => ({
  mapState: mapState.bind(null, namespace),
  mapGetters: mapGetters.bind(null, namespace),
  mapMutations: mapMutations.bind(null, namespace),
  mapActions: mapActions.bind(null, namespace)
})
```
就是返回了mapState， mapGetters，mapMutations， mapActions四个函数并绑定了一下命名空间而已。 

### 四. 插件机制
vuex插件实质是一个函数，vuex会将store传入插件函数。在插件函数内部，可以利用store.subscribe和store.subscribeAction两个函数来达到监听commit mutaion和dispatch action的目的。

store.subscribe和store.subscribeAction是类似的，我们以subscrib为例看看源码实现：

store维护了一个数组_subscribers，执行subscrib函数时，将传入的参数fn放入_subscribers，当commit了一个mutation的时候，就会调用_subscribers数组里的每一个元素，也就是之前传入的每一个fn。使用这种方式可以达到监听commit mutation的作用。

```
commit (_type, _payload, _options) {
   	// ...省略其他的
    this._subscribers.forEach(sub => sub(mutation, this.state))
  }
```
```
subscribe (fn) {
   return genericSubscribe(fn, this._subscribers)
}
  
function genericSubscribe (fn, subs) {
  if (subs.indexOf(fn) < 0) {
    subs.push(fn)
  }
  return () => {
    const i = subs.indexOf(fn)
    if (i > -1) {
      subs.splice(i, 1)
    }
  }
}
```
如果大家有兴趣可以去看看vuex自带的logger插件的代码，会发现这个插件做的事情很简单：就是之后对比一下commit mutaion之前的state和之后的state，并将新旧两个state和触发state改变的mutation打印出来，仅仅做了这些操作。
vuex自带的logger插件的代码在这里就不展示了，大家可以自行去guthub上看。

### 五. 严格模式
开启严格模式，仅需在创建 store 的时候传入 strict: true
```
const store = new Vuex.Store({
  // ...
  strict: true
})
```
在严格模式下，无论何时发生了状态变更且不是由 mutation 函数引起的，将会抛出错误。这能保证所有的状态变更都能被调试工具跟踪到。

我们看看源码实现：
```
function enableStrictMode (store) {
  store._vm.$watch(function () { return this._data.$$state }, () => {
    if (process.env.NODE_ENV !== 'production') {
      assert(store._committing, `do not mutate vuex store state outside mutation handlers.`)
    }
  }, { deep: true, sync: true })
}
```
代码利用vue的监听函数对this._data.$$state做了监听。这里注意store._vm是一个vue实例，是在resetStoreVM方法对getter实现响应式的时候创建的（上面有提到）。而$$state就是我们vuex的state。这里对整个state做监听，当state发生变化时，去判断如果store._committing为false，那么说明不是有commit触发的对state的改变，而是用户自己手动修改的state的值，这时候就会报错。 
### 五. 结语
了解了store的真面目之后是不是感觉非常简单呢，相信大家使用起来也会更加顺手啦。与此同时，我们也可以在此基础上学习vuex源码中对于子module的管理方式，以一种树的结构来管理模块，相信这种思想在在其他地方也可以使用到呢。

总之，看源码不仅仅是可以了解它的原理，方便自己更好地使用，也可以学习其代码风格和思路，举一反三，融会贯通，逐渐形成自己的思想和风格哦~













