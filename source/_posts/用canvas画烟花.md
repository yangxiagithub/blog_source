---
title: 用canvas画烟花
date: 2018-08-05 17:50:32
Categories: javascript
tags: canvas
---

```
<html>
    <canvas></canvas>
</html>
<style>
    body {
         background: #000;
    }
    canvas {
        display: block;
    }
</style>
<script>
    var CONFIG =  {
        ShrinkCircleRadius: 5,
        ShrinkCircleRadiusSpeed: 0.1,
        ShrinkCircleLineWidth: 2,

        biuSpeed: 2,
        biuAcceleration: 1.02,
        biuLineWidth: 3,

        boomSpeed: 10,
        boomAcceleration: 0.95,
        boomTargetCount: 100,
        boomGradient: 0.015,
        boomGravity: 0.98,
        boomLineWidth: 3,

        animateTimerTarget: 50
    }
    var canvas = document.querySelector('canvas')
    var context = canvas.getContext('2d');
    var cw = canvas.width = window.innerWidth;
    var ch = canvas.height = window.innerHeight;
    function  randomColor () {
        // 返回一个0-255的数值，三个随机组合为一起可定位一种rgb颜色
        var color = [];
        var num = 3;
        while(num--) {
            color.push(Math.random() * 255);
        }
        return color.join(',');
    }
    function  getDistance (x1,y1,x2,y2) {
        return Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2))
    }
    // 闪烁的圆圈
    class ShrinkCircle {
        /**
        * x: 圆点x轴坐标
        * y: 圆点y轴坐标
        */
        constructor (x, y) {
            this.x = x;
            this.y = y;
            this.radius = CONFIG.ShrinkCircleRadius
        }

        draw () {
            
            context.beginPath();
            context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            context.lineWidth = 2;
            context.strokeStyle = `rgb(${randomColor()})`;
            context.stroke();
        }

        update() {
            // 让圆进行扩张，实现闪烁效果
            if (this.radius < CONFIG.ShrinkCircleRadius) {
                this.radius += CONFIG.ShrinkCircleRadiusSpeed;
            } else {
                this.radius = 1;
            }
        }

        init () {
            this.draw();
            this.update();
        }
    }

    // 射线
    class Biubiubiu {
        constructor (startX, startY, targetX, targetY) {
            this.startLocation = {
                x: startX,
                y: startY
            };
            this.targetLocation = {
                x: targetX,
                y: targetY
            };
            // 运动当前的坐标，初始默认为起点坐标
            this.nowLocation = {
                x: startX,
                y: startY
            },
            this.preLocation = {
                x: startX,
                y: startY
            }
            // 角度
            this.angle =  Math.atan2(this.targetLocation.y - this.startLocation.y, this.targetLocation.x - this.startLocation.x);
            // 速度
            this.speed = CONFIG.biuSpeed;
            // 加速度
            this.acceleration = CONFIG.biuAcceleration;
            // 到目标点的距离
            this.targetDistance = getDistance(this.startLocation.x, this.startLocation.y, this.targetLocation.x, this.targetLocation.y);
            // 是否达到目标点
            this.arrived = false;
        }

        draw () {
            context.beginPath();
            context.moveTo(this.preLocation.x, this.preLocation.y);
            context.lineWidth = CONFIG.biuLineWidth;
            context.lineCap = 'round';
            context.lineTo(this.nowLocation.x, this.nowLocation.y);
            context.strokeStyle = `rgb(${randomColor()})`;
            context.stroke();
        }

        update () {
            this.preLocation.x = this.nowLocation.x;
            this.preLocation.y = this.nowLocation.y;
            this.speed *= this.acceleration;
            var vx = Math.cos(this.angle) * this.speed;
            var vy = Math.sin(this.angle) * this.speed;

            var nowDistance = getDistance(this.startLocation.x, this.startLocation.y, this.nowLocation.x, this.nowLocation.y);
            if (nowDistance >= this.targetDistance) {
                this.arrived = true;
            } else {
                this.nowLocation.x += vx
                this.nowLocation.y += vy;
                this.arrived = false;
            }
        }

        init () {
            this.draw();
            this.update();
        }
    }

    // 爆炸类(其实就是爆炸之后的每根线条)
    class Boom {
        constructor (startX, startY) {
            this.startLocation = { x: startX, y: startY }
            this.nowLocation = { x: startX, y: startY }
            // 速度
            this.speed = Math.random() * CONFIG.boomSpeed + 2
            // 加速度
            this.acceleration = CONFIG.boomAcceleration
            // 没有确定的结束点，所以没有固定的角度，可以随机角度扩散
            this.angle = Math.random() * Math.PI * 2;
            // 这里设置阀值为100, 大于这个值，将线条渐渐隐藏 
            this.targetCount = CONFIG.boomTargetCount;
            // 当前计算为1，用于判断是否会超出阀值
            this.nowNum = 1;
            // 透明度
            this.alpha = 1;
            // 透明度减少梯度
            this.gradient = CONFIG.boomGradient;
            // 重力系数
            this.gravity = CONFIG.boomGravity;
            // 是否到达目标点
            this.arrived = false
            this.preLocation = {x: startX, y: startY}
        }

        draw () {
            context.beginPath()
            context.moveTo(this.preLocation.x, this.preLocation.y)
            context.lineWidth = CONFIG.boomLineWidth
            context.lineCap = 'round'
            context.lineTo(this.nowLocation.x, this.nowLocation.y)
            // 设置由透明度减小产生的渐隐效果，看起来没这么突兀
            context.strokeStyle = `rgba(${randomColor()}, ${this.alpha})`
            context.stroke()
        }
        
        update () {
            this.preLocation.x = this.nowLocation.x;
            this.preLocation.y = this.nowLocation.y;
            this.speed *= this.acceleration;

            let vx = Math.cos(this.angle) * this.speed
            // 加上重力系数，运动轨迹会趋向下
            let vy = Math.sin(this.angle) * this.speed + this.gravity;

            // 当前计算大于阀值的时候的时候，开始进行渐隐处理
            if (this.nowNum >= this.targetCount) {
                this.alpha -= this.gradient
            } else {
                this.nowLocation.x += vx
                this.nowLocation.y += vy
                this.nowNum++
            }

            // 透明度为0的话，可以进行移除处理，释放空间
            if (this.alpha <= 0) {
                this.arrived = true
            }
        }

        init() {
            this.draw()
            this.update()
        }
    }

    // 动画类，程序入口
    class Animate {
        constructor () {
            // 定义一个数组做为闪烁球的集合
            this.shrinkCircles = [];
            // 定义一个数组做为射线类的集合
            this.bius = [];
            // 定义一个数组做为爆炸类的集合
            this.booms = [];
            // 避免每帧都进行绘制导致的过量绘制，设置阀值，到达阀值的时候再进行绘制
            this.timerTarget = CONFIG.animateTimerTarget;
            this.timerNum = 0;
        }
        // 一个爆炸点
        pushBoom (x, y) {
            // 每个爆炸点20条线
            for (var i = 0; i < 20; i++) {
                this.booms.push(new Boom(x, y));
            }
        }

        initAnimate (target, cb) {
            target.map((item, index) => {
                if (!(item instanceof Object)) {
                    console.log('数组值错');
                    return false;
                } else {
                    item.init();
                    if (typeof cb === 'function') {
                        cb(index);
                    }
                }
            });
        }

        run () {
            window.requestAnimationFrame(this.run.bind(this));
            context.clearRect(0,0,cw,ch);

            // 触发射线动画
            this.initAnimate(this.bius, (i) => {
                // 同时开始绘制闪烁圆
                this.shrinkCircles[i].init();
                if (this.bius[i].arrived) {
                    // 到达目标后，可以开始绘制爆炸效果, 当前线条的目标点则是爆炸实例的起始点
                    this.pushBoom(this.bius[i].nowLocation.x, this.bius[i].nowLocation.y);
                    // 到达目标后，把当前类给移除，释放空间 
                    this.bius.splice(i, 1);
                    this.shrinkCircles.splice(i, 1);
                }
            });

            // 当爆炸数组内有数据时， 触发爆炸动画；当爆炸数据arrivaed时，去掉爆炸线条
            this.initAnimate(this.booms, (i) => {
                if(this.booms[i].arrived) {
                    // 到达目标透明度后，把炸点给移除，释放空间
                    this.booms.splice(i, 1);
                }
            });

            if (this.timerNum >= this.timerTarget) {
                // 到达阀值后开始绘制实例化射线
                var startX = Math.random() * (cw / 2);
                var startY = ch;
                var targetX = Math.random() * cw;
                var targetY = Math.random() * (ch / 2);
                // 射线实例化，并入合集中
                let exBiu = new Biubiubiu(startX, startY, targetX, targetY);
                this.bius.push(exBiu);
                // 闪烁球实例化，并入合集中
                let exshrinkCircle = new ShrinkCircle(targetX, targetY);
                this.shrinkCircles.push(exshrinkCircle);
                // 到达阀值后把当前计数重置一下
                this.timerNum = 0
            } else {
                this.timerNum++;
            }
        }
    }

    let a = new Animate();
    a.run();
</script>
```

 [参考链接](https://juejin.im/post/5b587f59e51d45191e0d04ae)