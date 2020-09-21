// 规定雷的数量是10
var leiNum = 10;
// 规定雷区宽度
var leiquWidth = 9;
// 规定雷区高度
var leiquHeight = 9;
// 规定雷字符
var leiChar = '*';
// 规定遍历过字符
var bianliChar = '#';
// 规定小旗字符
var qiChar = '%';


window.onload = function () {

    loadWidth();

    $(document).bind("contextmenu", function (e) {
        return false;
    });

    // 初始化cookie
    if (getCookie("saolei") == "") {
        setCookie("saolei", "无", 30);
    }

    // 重玩按钮点击事件
    $(".reset").click(function () {
        window.location.reload();
    })

    // 定义游戏开始时间
    var gameStartTime;
    // 定义一个对象包含雷区和雷区复制数组
    var saolei;
    // 定义时间计时对象
    var intervalObject;

    // 当第一个格子被点，游戏开始，并记录当前时间和坐标
    let isfirst = true;
    $(".item").mousedown(function (e) {
        // 获得被点击格子的索引 itemIndex
        let itemIndex = $(".item").index(this);
        // 通过索引计算格子坐标 itemX itemY
        let itemX = Math.floor(itemIndex / leiquWidth);
        let itemY = itemIndex - itemX * leiquWidth;
        // 如果第一次点击棋盘
        if (isfirst) {
            // 根据被点击格子坐标和雷的数量初始化棋盘
            saolei = saoleiInit(itemX + 1, itemY + 1, leiNum);
            // 记录第一次点击
            isfirst = false;
            // 记录游戏开始时间
            gameStartTime = (new Date()).getTime();
            // 让游戏界面中的时钟开始计时
            intervalObject = window.setInterval(function () {
                // 当前时间戳
                let nowTime = (new Date()).getTime();
                // 当前时间与游戏开始时间秒数差
                let timeDifference = Math.floor((nowTime - gameStartTime) / 1000);
                let m = Math.floor(timeDifference / 60);
                let s = timeDifference - m * 60;
                if (m.toString().length < 2) m = "0" + m;
                if (s.toString().length < 2) s = "0" + s;
                // 输出到界面上
                $(".time").text(m + ":" + s);
            }, 1000);
        } else {
            // 定义鼠标点击事件（左键还是右键）
            let mouseThing = e.which;
            let clickResult = leiquClick(mouseThing, itemX + 1, itemY + 1, saolei);
            // 如果踩到雷导致游戏结束
            if (clickResult == "gameover") {
                leiquGameOver(0, gameStartTime, intervalObject, saolei);
            } // 否则检查是否通关游戏
            else {
                leiquCheck(gameStartTime, intervalObject, saolei);
            }
        }
    });

};

window.resize = function () {
    // 根据屏幕宽度动态调整雷区大小 
    loadWidth();
};

/** 
 * 刷新雷区大小函数
 * @return {message} "成功刷新雷区大小"
*/
function loadWidth() {
    // 获取屏幕宽高 windowWidth windowHeight
    let windowWidth = $(window).width();
    let windowHeight = $(window).height();
    // 判断页面类型，输出大小最合适的雷区
    if (windowWidth > 800) windowWidth = 800;
    if (windowHeight < windowWidth) windowWidth = windowHeight;
    // 根据计算出的windowWidth ，计算每个格子大小
    let itemWidth = windowWidth / leiquWidth - 2;
    $(".item").css({
        width: itemWidth,
        height: itemWidth
    });
    // 返回信息
    return "成功刷新雷区大小";
}

/** 
 * 初始化雷区
 * 在雷区中随机生成规定的雷数量的雷
 * 初始点击位置的一圈不可生成
 * @param {integer} x 横坐标
 * @param {integer} y 纵坐标
 * @param {integer} num 规定的雷数量
 * @return {object} 一个包含雷区和雷区复制数组的对象
*/
function saoleiInit(x, y, num) {
    // 根据x y 生成第一次被点击格子坐标
    let firstCoordinate = new Object();
    firstCoordinate.x = x;
    firstCoordinate.y = y;
    // 定义雷区二维数组
    let leiqu = new Array();
    for (let i = 0; i <= leiquWidth + 1; i++) {
        leiqu[i] = new Array();
    }
    // 循环生成有效雷区
    let i = 0;
    while (i < num) {
        // 随机生成雷坐标x, y
        let itemRandomX = randomNum(1, leiquWidth);
        let itemRandomY = randomNum(1, leiquHeight);
        // 根据随机生成x, y生成随机格子坐标
        let randomCoordinate = new Object();
        randomCoordinate.x = itemRandomX;
        randomCoordinate.y = itemRandomY;
        // 判断该坐标是否有效
        let iseff = effectiveCoordinates(firstCoordinate, randomCoordinate, leiqu);
        // 坐标有效则记录雷区数组中
        if (iseff) {
            leiqu[randomCoordinate.x][randomCoordinate.y] = leiChar;
            // 循环继续
            i++;
        }
    }
    // 根据雷区，循环生成数字
    for (let i = 1; i <= leiquWidth; i++) {
        for (let j = 1; j <= leiquHeight; j++) {
            leiqu[i][j] = leiquNumber(i, j, leiqu);
        }
    }
    // 将雷区结果输出界面
    for (let i = 1; i <= leiquWidth; i++) {
        for (let j = 1; j <= leiquHeight; j++) {
            // 计算坐标对应索引
            let index = (i - 1) * leiquWidth + (j - 1);
            if (leiqu[i][j]) $(".item").eq(index).append("<span style='display: none;'>" + leiqu[i][j] + "</span>");
        }
    }
    // 遍历被点击格子周围，显示到数字或边界结束
    // 复制雷区二维数组用于遍历
    let leiquCopy = JSON.parse(JSON.stringify(leiqu));
    ergodicBoundary(firstCoordinate.x, firstCoordinate.y, leiqu, leiquCopy);
    // 定义一个对象包含雷区和雷区复制数组
    let saolei = new Object();
    saolei.leiqu = leiqu;
    saolei.leiquCopy = leiquCopy;
    return saolei;
}

/**
 * 求minNum 到 maxNum 之间的随机数
 * @param {integer} minNum 随机数下限
 * @param {integer} maxNum 随机数上限
 * @return {integer} 随机数结果
 */
function randomNum(minNum, maxNum) {
    let res = 0;
    switch (arguments.length) {
        case 1:
            res = parseInt(Math.random() * minNum + 1, 10);
            break;
        case 2:
            res = parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
            break;
    }
    return res;
}

/**
 * 判断随机生成的坐标是否有效
 * @param {coordinate} first 第一次被点击格子坐标
 * @param {coordinate} random 随机生成的坐标
 * @param {array} leiqu 雷区二维数组
 * @return {boolean} 随即生成坐标的有效性
 */
function effectiveCoordinates(first, random, leiqu) {
    // 循环判断随机生成的坐标是否和第一次被点击格子坐标冲突
    let repeatFR = false;
    for (let i = first.x - 2; i <= first.x + 2; i++) {
        for (let j = first.y - 2; j <= first.y + 2; j++) {
            if (i == random.x && j == random.y) {
                repeatFR = true;
                break;
            }
        }
    }
    // 判断随机生成的坐标是否和雷区已生成的格子坐标冲突
    let repeatLR = false;
    if (leiqu[random.x][random.y]) {
        repeatLR = true;
    }
    // 返回判断结果 false 表示无效 true 代表有效
    if (repeatFR) {
        return false;
    } else if (repeatLR) {
        return false;
    } else {
        return true;
    }
}

/**
 * 根据雷区判断当前遍历位置是否需要生成数字，并生成对应数字
 * @param {integer} x 遍历位置横坐标
 * @param {integer} y 遍历位置纵坐标
 * @param {array} leiqu 雷区二维数组
 * @return {char} 当前遍历位置应当的值
 */
function leiquNumber(x, y, leiqu) {
    // 如果当前遍历位置为雷，直接返回
    if (leiqu[x][y] == leiChar) {
        return leiChar;
    }
    // 否则循环计算当前遍历位置周围雷数
    let roundNum = 0;
    for (let i = x - 1; i <= x + 1; i++) {
        for (let j = y - 1; j <= y + 1; j++) {
            if (leiqu[i][j] == leiChar) {
                roundNum++;
            }
        }
    }
    return roundNum;
}

/**
 * 遍历雷区，显示空白区域和边界数字
 * @param {integer} x 遍历位置横坐标
 * @param {integer} y 遍历位置纵坐标
 * @param {array} leiqu 雷区二维数组
 * @param {array} leiquCopy 复制雷区二维数组
 * @return {void} 
 */
function ergodicBoundary(x, y, leiqu, leiquCopy) {
    // 判断当前位置是否已遍历或被插旗标记
    if (leiquCopy[x][y] == bianliChar || leiquCopy[x][y] == qiChar) {
        return;
    }
    // 把当前位置设定为已遍历
    leiquCopy[x][y] = bianliChar;
    // 计算当前索引
    let index = (x - 1) * leiquWidth + (y - 1);
    // 根据索引显示背景图片
    $(".item").eq(index).addClass("icon-" + leiqu[x][y]);
    $(".item").eq(index).addClass("icon-0");
    // 如果当前位置存在数字，停止遍历
    if (leiqu[x][y]) return;
    // 遍历上下左右方向的格子
    if (y - 1 > 0) ergodicBoundary(x, y - 1, leiqu, leiquCopy);
    if (y + 1 <= leiquWidth) ergodicBoundary(x, y + 1, leiqu, leiquCopy);
    if (x - 1 > 0) ergodicBoundary(x - 1, y, leiqu, leiquCopy);
    if (x + 1 <= leiquHeight) ergodicBoundary(x + 1, y, leiqu, leiquCopy);
    return;
}

/**
 * 雷区点击事件，判断玩家点击的格子并进行下一步
 * @param {integer} mouseThing 鼠标点击事件 1为左键，3为右键 
 * @param {integer} x 格子横坐标
 * @param {integer} y 格子纵坐标
 * @param {object} saolei 一个包含雷区和雷区复制数组的对象
 * @return {message} 返回信息
 */
function leiquClick(mouseThing, x, y, saolei) {
    // 如果这个位置已经遍历过，直接跳过
    if (saolei.leiquCopy[x][y] == bianliChar) {
        return;
    }
    // 左键单击事件
    if (mouseThing == 1) {
        // 判断该位置是否为雷
        if (saolei.leiqu[x][y] == leiChar) {
            // 如果该位置被插旗标记过
            if (saolei.leiquCopy[x][y] == qiChar) {
                return;
            }
            // 游戏结束
            return "gameover";
        }
        // 否则遍历雷区
        ergodicBoundary(x, y, saolei.leiqu, saolei.leiquCopy);

    } else if (mouseThing == 3) {
        // 计算当前索引
        let index = (x - 1) * leiquWidth + (y - 1);
        // 右键点击事件，为未遍历的位置插上小旗
        if (saolei.leiquCopy[x][y] != qiChar) {
            $(".item").eq(index).addClass("icon-qi");
            // 插上旗后，为该位置做标记，禁止点击
            saolei.leiquCopy[x][y] = qiChar;
        } else { // 取消插旗
            $(".item").eq(index).removeClass("icon-qi");
            // 取消插旗后，还原该位置标记
            saolei.leiquCopy[x][y] = saolei.leiqu[x][y];
        }
    } else {
        // 如果传参错误
        return "鼠标事件错误";
    }
}

/**
 * 游戏结束事件
 * @param {integer} isFinished 是否完成游戏 0未完成 1完成
 * @param {timestamp} startTime 游戏开始时间
 * @param {interval} interval 游戏界面计时对象
 * @param {object} saolei
 * @return {void}
 */
function leiquGameOver(isFinished, startTime, interval, saolei) {
    // 游戏结束事件
    let endTime = (new Date()).getTime();
    // 游戏用时 单位：s
    let gameTime = (endTime - startTime) / 1000;
    // 结束页面上计时时钟
    clearInterval(interval);
    // 如果踩到雷导致游戏结束，把所有的雷显示出来
    if (isFinished == 0) {
        for (let i = 1; i <= leiquWidth; i++)
            for (let j = 1; j <= leiquHeight; j++)
                if (saolei.leiqu[i][j] == leiChar) {
                    // 计算当前索引
                    let index = (i - 1) * leiquWidth + (j - 1);
                    // 根据索引显示背景图片
                    setTimeout(() => {
                        $(".item").eq(index).addClass("icon-lei");
                    }, i * 40);
                }
        setTimeout(() => {
            swal("真可惜", "游戏失败了，再来一局吧", "error");
        }, leiquWidth * 40);
    } else {
        // 游戏胜利
        // 界面上显示的游戏时间
        time = $(".time").text();
        // 如果还没保存过游戏记录
        if (getCookie("saolei") == "无" || getCookie("saolei") == "undefined") {
            setCookie("saolei", $(".time").text(), 30);
            $(".score > span").text($(".time").text());
        } else { // 如果保存过游戏记录
            // 获取旧的历史记录，转换为秒
            let oldscores = new Array();
            oldscores = getCookie("saolei").split(":");
            let oldscore = parseInt(oldscores[0] * 60 + oldscores[1]);
            // 与现在的时间作比较，存储更好的记录
            if (oldscore > gameTime) {
                setCookie("saolei", $(".time").text(), 30);
                $(".score > span").text($(".time").text());
            }
        }
        // 输出游戏胜利界面
        setTimeout(() => {
            swal("厉害了", "你真厉害，👍👍👍！用时：" + gameTime + "秒", "success");
        }, leiquWidth * 10);
    }
}

/**
 * 通过雷区检查玩家是否通关游戏
 * @param {timestamp} startTime 游戏开始时间
 * @param {interval} interval 游戏界面计时对象
 * @param {object} saolei
 * @return {void}
 */
function leiquCheck(startTime, interval, saolei) {
    // 计算有多少经过了遍历标记
    let bianliNum = 0;
    for (let i = 1; i <= leiquWidth; i++) {
        for (let j = 1; j <= leiquHeight; j++) {
            if (saolei.leiquCopy[i][j] == bianliChar) bianliNum++;
        }
    }
    // 判断除雷之外是否全部进行了标记
    if (bianliNum == leiquWidth * leiquHeight - leiNum) {
        // 游戏胜利
        leiquGameOver(1, startTime, interval, saolei);
    }
}

/**
 * 设置cookie
 * @param {string} cname 
 * @param {string} cvalue 
 * @param {integer} exdays
 * @return {void}
 */
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toGMTString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

/**
 * 获取cookie
 * @param {string} cname 
 * @return {string} cookie的值
 */
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i].trim();
        if (c.indexOf(name) == 0) { return c.substring(name.length, c.length); }
    }
    return "";
}

/**
 * 删除cookie
 * @param {string} name 
 * @return {void}
 */
function delCookie(name)//删除cookie
{
    document.cookie = name + "=;expires=" + (new Date(0)).toGMTString();
}