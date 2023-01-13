// ==UserScript==
// @name         98浏览助手多图版3
// @namespace    98BAMI
// @author       Virya

// @description  为堂内帖子列表、搜索页、个人页和收藏页增加多图预览支持。下面链接分别是org和net域名下的论坛地址，也可自行添加修改论坛域名或分区地址。如果你希望脚本对某个分区不生效，请在下方添加// @exclude并填写分区地址。

// @match        https://www.sehuatang.org/forum*
// @match        https://sehuatang.org/forum*
// @match        https://www.sehuatang.net/forum*
// @match        https://sehuatang.net/forum*

// @match        https://www.sehuatang.org/search*
// @match        https://sehuatang.org/search*
// @match        https://www.sehuatang.net/search*
// @match        https://sehuatang.net/search*

// @match        https://www.sehuatang.org/home*
// @match        https://sehuatang.org/home*
// @match        https://www.sehuatang.net/home*
// @match        https://sehuatang.net/home*

// @match        https://gfggfdw.0nkaz.com/forum*
// @match        https://gfggfdw.0nkaz.com/search*
// @match        https://gfggfdw.0nkaz.com/home*


// @connect sehuatang.org
// @connect sehuatang.net

// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_setClipboard
// @grant        GM_xmlhttpRequest
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @grant        GM_openInTab
// @grant        GM_registerMenuCommand

// @require https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js
// @require http://lib.baomitu.com/jquery.lazyload/1.9.1/jquery.lazyload.min.js

// @version 3.5.6
// @license MIT
// ==/UserScript==
/* global $ */



//为新增内容添加样式
function addStyles() {
    const title1_style = `.s.xst {
    font-size: 17px;
    font-weight: 700;
    font-family: 'PingFang SC', 'Helvetica Neue', 'Microsoft YaHei New', 'STHeiti Light', sans-serif;
}`;
    const title2_style = `.xst {
    font-size: 17px;
    font-weight: 700;
    font-family: 'PingFang SC', 'Helvetica Neue', 'Microsoft YaHei New', 'STHeiti Light', sans-serif;
}`;
    const imgThumb_style = `.lazy {
    width: 32%;
    max-height: 500px;
    margin-right: 1%;
    border-radius: 2px;
    display: inline;
    cursor: pointer;
    object-fit: contain;
}
`;
   const filterButton_style = `.filterButton {
   position: fixed;
   top: 141px;
   left: 93%;
   background: #ed4014;
   color: white;
   padding: 0px 7px;
   border: 0;
   cursor: pointer;
   border-radius: 3px;
   height : 24px;
   font-size: 14px;
   font-family:'PingFang SC','Helvetica Neue','Microsoft YaHei New','STHeiti Light',sans-serif;
}
`;
    GM_addStyle(title1_style);
    GM_addStyle(title2_style);
    GM_addStyle(imgThumb_style);
    GM_addStyle(filterButton_style);
}




//主功能函数
function main() {

    //判断是帖子列表页、搜索页还是个人页
    var url = window.location.href;
    getSelectors(url);
    //console.log(selector1);

    //获取每个帖子内容
    selector1.each(function(){

        var urls = 'https://'+ location.hostname+'/';
        urls+=$(this).find(selector2).attr("href");
        //console.log(urls);

        //根据页面类型加载图片插入方式
        var insertion = addRow(appendMethod, $(this));


        //跳过已处理过的帖子列表
        if ($(insertion).find('img').length != 0) {
            return true
        }


        GM_xmlhttpRequest({
            method: 'GET',
            url: urls,
            headers: {
                'User-agent': 'Mozilla/5.0  Chrome/70. Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
            },
            onload: function(result) {
                var doc = result.responseText;


                //加载图片
                var img =$(doc).find('#postlist div:nth-child(1) .zoom').filter( ":not([file*='static/image'])").slice(0, 3)
                //console.log(img)

                img.each(function(index) {

                    var pic_url = $(this).attr( "zoomfile" ) || $(this).attr( "file" ) || $(this).attr( "src" );
                    var img_thumb = $('<img>');
                    img_thumb.attr({
                        "data-original": pic_url,
                        src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXYzh8+PB/AAffA0nNPuCLAAAAAElFTkSuQmCC",
                        onclick:"zoom(this, this.src, 0, 0, 0)",
                    });

                   img_thumb.addClass('lazy')
                   img_thumb.appendTo(insertion);
                });

                //图片延迟加载效果
                $(function() {
                    $(insertion).find('img.lazy').lazyload({effect: "fadeIn"});
                });
                //动态调整图片预览遮罩层高度
                $(insertion).find('img.lazy').click(function() {
                    setTimeout(function() {
                        modifyCoverHeight();
                    }, 100);
                });


            }
        });

    });
}





//根据不同页面确定图片插入位置和插入方式
var selector1, selector2, appendMethod;

function getSelectors(url) {
    if (url.match(/^.*forum\.php\?.*mod=forumdisplay.*$/) || url.match(/[\w.-]+\/.*forum-\d+.*/)) {
        selector1 = $('[id^=normalthread]');
        selector2 = ".icn a";
        appendMethod = 'append';

    } else if (url.match(/.*\/search.*/)) {

        // 将按钮添加到页面中
        $('body').append(filterButton);
        // 如果配置项的值为 true，则调用 removeSpecialPosts() 函数
        if (filterConfig.enabled) {
            removeSpecialPosts("fid=143","fid=118");
        }

        selector1 = $('.pbw');
        selector2 = ".xs3 a";
        appendMethod = 'append';
        $('head').append( $('<link rel="stylesheet" type="text/css" />').attr('href', 'data/cache/style_1_forum_forumdisplay.css?acl') );
    } else if (url.match(/^.*home\.php\?.*do=thread.*$/)) {
        selector1 = $('tr');
        selector2 = "th a";
        appendMethod = 'after';
        $('head').append( $('<link rel="stylesheet" type="text/css" />').attr('href', 'data/cache/style_1_forum_forumdisplay.css?acl') );
    } else if (url.match(/^.*home\.php\?.*do=favorite.*$/)) {
        selector1 = $('.bbda.ptm.pbm');
        selector2 = "a:eq(1)";
        appendMethod = 'append';
        //$('head').append( $('<link rel="stylesheet" type="text/css" />').attr('href', 'data/cache/style_1_forum_forumdisplay.css?acl') );
    } else if (url.match(/^.*forum\.php\?.*mod=guide.*$/)) {
        selector1 = $('[id^=normalthread]');
        selector2 = ".icn a";
        appendMethod = 'append_guide';
    }
}


//根据不同的页面以不同方式插入图片
function addRow(appendMethod, target) {
  if (appendMethod === 'append') {
    var row = $('<tr><td id = "imgbox_td" colspan=5></td ></tr>');
    row.appendTo(target);
    return target.find('#imgbox_td')
  } else if (appendMethod === 'after') {
    row = $('<tr><td id = "imgbox_td" colspan=5 ></td ></tr>');
    target.after(row);
    return target.next('tr').find('#imgbox_td')
  } else if (appendMethod === 'append_guide') {
    row = $('<tr><td id = "imgbox_td" colspan=6 ></td ></tr>');
    row.appendTo(target);
    return target.find('#imgbox_td')
  }
}




//在当前页面过滤特殊帖子类型
function removeSpecialPosts(keyword1,keyword2) {
    $("li:has(a[href*='" + keyword1 + "'])").remove();
    $("li:has(a[href*='" + keyword2 + "'])").remove();
}

// 设置过滤按钮
var filterButton = $('<button>').text('点击过滤悬赏贴').addClass('filterButton');


// 获取过滤配置项的值
var filterConfig = JSON.parse(localStorage.getItem('config')) || {};

// 根据过滤配置项的值更新过滤按钮文案和按钮颜色
if (filterConfig.enabled) {
    filterButton.text('停止过滤悬赏贴').css('background', 'gray');
} else {
    filterButton.text('点击过滤悬赏贴').css('background', '#ed4014');
}

// 绑定过滤按钮点击事件
filterButton.click(function() {
    // 切换配置项的值
    filterConfig.enabled = !filterConfig.enabled;
    localStorage.setItem('config', JSON.stringify(filterConfig));

    // 刷新当前页面
    location.reload();

});

// 图片预览遮罩层高度修正函数
function modifyCoverHeight() {
    // 获取当前页面高度
    var pageHeight = $(document).height();
    console.log(pageHeight)

    // 修改遮罩层高度
    $("#imgzoom_cover").height(pageHeight);
}




//调用函数，插入图片
$(document).ready(function(){
    addStyles();
    main();


    $("#autopbn").click(function() {
        setTimeout(function() {
            main();
        }, 500);
    });



});










