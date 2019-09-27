---
title: 使用canvas画一个雷达图
date: 2018-08-05 14:07:22
catagories: canvas
tags: 前端
---

#### 一. 代码

```
<html>
    <canvas class="radar"></canvas>
</html>
<style>
    canvas {
        display: block;
        width: 500px;
        height: 500px;
    }
</style>
<script>
    const times = (n, cb) => {
        if (typeof n !== 'number') {
            throw new TypeError('times必须传入数字类型参数！')
        }
        let result = []
        let i
        try {
            for (i = 0; i < n; i++) {
                result.push(cb(i))
            }
        } catch (e) {
            console.log(`执行第${i}个时，回调函数错误！`)
            console.log(e)
        }
        return result
    }
</script>
<script>
    var canvas = document.getElementsByClassName('radar')[0];
    var ctx = canvas.getContext('2d');
    var data = {
        '人际交往': 65,
        '逻辑数理': 77,
        '空间感知': 78,
        '自我认知': 55,
        '自然观察': 60,
        '情感判断': 85
    }
    // 图形边数
    var sideNumber = 6;
    // 顶点坐标
    var lineArr = [];
    // 分数坐标
    var scoreArr = [];
    // 分阶数目
    var demensionNum = 5;
    canvas.width = 500;
    canvas.height = 500;
    var rCenter = 250;
    var curR = 100;
    var rAngle = Math.PI * 2 / sideNumber;
    ctx.save();

    // 第一步：画6边型
    ctx.strokeStyle = '#888888';
    ctx.beginPath();
    for(var i = 0; i < sideNumber; i++) {
        // 固定水平向右的角（第一象限和第四象限的相交轴）
        lineArr[i] = {};
        lineArr[i].x = rCenter + curR * Math.cos(rAngle * i);
        lineArr[i].y = rCenter - curR * Math.sin(rAngle * i);
        ctx.lineTo(lineArr[i].x, lineArr[i].y);
        ctx.strokeStyle = '';
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
    ctx.save();

    // 第二步：画对角线
    ctx.strokeStyle = '#e8ddc7';
    ctx.beginPath();
    var crossLineNumber = sideNumber / 2
    for(var i = 0; i < crossLineNumber; i++) {
        ctx.moveTo(lineArr[i].x, lineArr[i].y);
        ctx.lineTo(lineArr[i + crossLineNumber].x, lineArr[i + crossLineNumber].y);
        ctx.stroke();
    }
    ctx.closePath();
   
    // 另一种画 对角线的方法
    // ctx.strokeStyle = '#e8ddc7';
    // ctx.beginPath();
    // for (var i =  0; i < sideNumber; i++) {
    //     ctx.moveTo(250, 250);
    //     ctx.lineTo(lineArr[i].x, lineArr[i].y);
    //     ctx.stroke();
    // }
    // ctx.closePath();

    // 第三步：画分阶
    var gradient = ctx.createRadialGradient(rCenter, rCenter, curR, rCenter, rCenter, 0);
    gradient.addColorStop(0, "#ff960c");
    gradient.addColorStop(1, "#ff4690");
    ctx.fillStyle = gradient;
    for (var i = 0; i < demensionNum; i++) {
        var x = rCenter + curR * Math.cos(rAngle * 0) * (i + 1) / demensionNum;
        var y = rCenter - curR * Math.sin(rAngle * 0) * (i + 1) / demensionNum;
        // 注意beginPath和closePath成对出现
        ctx.beginPath();
        ctx.moveTo(x, y);
        for (var j = 1; j < sideNumber; j++) {
            // 注意这里的括号，之前括号搞错，折腾了好久
            ctx.lineTo(rCenter + curR * Math.cos(rAngle * j) * (i + 1) / demensionNum, rCenter - curR * Math.sin(rAngle * j) * (i + 1) / demensionNum);
        }
        ctx.closePath();
        ctx.globalAlpha = 0.04 * (i + 1);
        ctx.fill();
    }
    ctx.restore();
    ctx.save();
    // 第四步：数据 填充区域
    var keys = Object.keys(data);
    ctx.beginPath();
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.strokeStyle = '#dd3f26';
    ctx.lineWidth = 2;
    times(sideNumber, (i) => {
        let x = rCenter + curR * Math.cos(rAngle * i) * (data[keys[i]]/100) ;
        let y = rCenter - curR * Math.sin(rAngle * i) * (data[keys[i]]/100);
        scoreArr.push({ x: x, y: y });
        i === 0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
    })
    ctx.globalAlpha = 0.5;
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    ctx.save();

    //第五步：绘制小圆点
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    times(sideNumber, (i) => {
        ctx.beginPath();
        ctx.arc(scoreArr[i].x, scoreArr[i].y, 3, 0, 2 * Math.PI);
        ctx.fill();
    })
    ctx.restore();
    ctx.save();

    // 第六步：绘制文字---能力级别
    ctx.fillStyle = '#000';
    ctx.font = '16px Microsoft Yahei';
    keys.forEach((item, i) => {
        var m_width = ctx.measureText(item).width;
        if (lineArr[i].x === rCenter) {
            if (lineArr[i].y > rCenter) {
                ctx.fillText(item, lineArr[i].x, lineArr[i].y - m_width / 2);
            } else {
                 ctx.fillText(item, lineArr[i].x, lineArr[i].y + m_width / 2);
            }
        }else if (lineArr[i].x > rCenter) {
            ctx.fillText(item, lineArr[i].x + m_width / 2, lineArr[i].y);
        } else {
            ctx.fillText(item, lineArr[i].x - m_width * 1.5, lineArr[i].y);
        }
    });
    ctx.restore();
    ctx.save();

    // 第七步：绘制文字---分数
    ctx.fillStyle = '#fe333e';
    ctx.font = '12px Microsoft Yahei';
    keys.forEach((item, i) => {
        const score = data[item];
        var m_width = ctx.measureText(score).width;
        if (scoreArr[i].x === rCenter) {
            if (scoreArr[i].y > rCenter) {
                ctx.fillText(score, [i].x, scoreArr[i].y - m_width / 2);
            } else {
                ctx.fillText(score, scoreArr[i].x, scoreArr[i].y + m_width / 2);
            }
        } else if (scoreArr[i].x > rCenter) {
            ctx.fillText(score, scoreArr[i].x + m_width / 2, scoreArr[i].y);
        } else {
            ctx.fillText(score, scoreArr[i].x - m_width * 1.5, scoreArr[i].y);
        }
    });
</script>

```

#### 二. 效果 

![](/image/radar.png)

