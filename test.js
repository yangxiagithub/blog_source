function getQueryByName(name, source) {
    source = source || window.location.search.slice(1);
    const pairs = source.split('&');
    for (let i = 0; i < pairs.length; i ++) {
        const pairArr = pairs[i].split('=');
        if (pairArr[0] === name) {
            return pairArr[1];
        }
    }
    return false;
}

/**
 * 防抖函数：如果触发太多，则让前面的不执行，只让当前绑定生效
 * @param {*} idle 
 * @param {*} action 
 */
function debounce(idle, fn) {
    let id = null;
    return function() {
        const context = this, arg = arguments;
        clearTimeout(id);
        id = setTimeout(() => {
            fn.apply(context, arguments);
        }, idle);
    }
}

/**
 * 节流函数：如果操作太多，则当前操作不执行
 * @param {*} idle 
 * @param {*} fn 
 */
function throttle(idle, fn) {
    const last = 0;
    return function() {
        const now = Date.now();
        if(now - last >= idle) {
            fn(arguments);
            last = now;
        }
    }
}

function mapFn(source, fn) {
    if(typeof source === 'obj' && source instanceof Array) {
        for(let i = 0; i<source.length; i++) {
            fn(source[i], i);
        }
    } else {
        for(let key in source) {
            fn(source[key], key)
        }
    }
}