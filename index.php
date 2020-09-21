<?php
    if (!isset($_COOKIE['saolei'])) {
        $_COOKIE['saolei'] = "无";
    } else if ($_COOKIE['saolei'] == "undefined") {
        $_COOKIE['saolei'] = "无";
    }
?>

<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>扫雷小游戏</title>

    <link rel="stylesheet" href="./saolei.css">

    <script src="./jquery.js"></script>
    <script src="./sweetalert.min.js"></script>
    <script src="./saolei.js"></script>
</head>
<body>

    <div class="top">
        <div class="reset">重玩</div>
        <div class="time">00:00</div>
        <div class="score">最佳纪录:
            <span><?php if(isset($_COOKIE['saolei'])) echo $_COOKIE['saolei'] ?></span>
        </div>
    </div>
    
    <div class="main">
        <?php for($i = 1; $i < 10; $i++ ) { ?>

            <ul class="row">
                <?php for($j = 1; $j < 10; $j++ ) { ?>

                    <li class="item"></li>

                <?php } ?>
            </ul>

        <?php } ?>
    </div>

</body>
</html>