// ==UserScript==
// @name         98浏览助手多图版3
// @namespace    98BAMI
// @author       Virya

// @description  为堂内帖子列表、搜索页和个人页增加多图预览支持。下面链接分别是org和net域名下的论坛地址，也可自行添加修改论坛域名或分区地址。如果你希望脚本对某个分区不生效，请在下方@exclude填写分区地址。
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

// @grant          GM_xmlhttpRequest
// @require https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js
// @require http://lib.baomitu.com/jquery.lazyload/1.9.1/jquery.lazyload.min.js

// @connect sehuatang.org
// @connect sehuatang.net


// @version 3.2.1
// @license MIT
// ==/UserScript==
/* global $ */

function main() {


    //判断是帖子列表页、搜索页还是个人页
    var url = window.location.href;
    getSelectors(url);
    //console.log(selector1, selector2, appendMethod);

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
                    img_thumb.css({
                        //"vertical-align": "top",
                        "width": "32%",
                        "margin-right": "1%",
                        "border-radius": "2px",
                        "display": "inline",
                        'cursor':'pointer'
                    });

                    img_thumb.addClass('lazy')
                    img_thumb.appendTo(insertion);
                });

                //图片延迟加载效果
                $(function() {
                    $(insertion).find('img.lazy').lazyload({effect: "fadeIn"});
                });

            }
        });

    });
}


var selector1, selector2, appendMethod;

function getSelectors(url) {
    if (url.match(/.*\/forum.*/)) {
        selector1 = $('[id^=normalthread]');
        selector2 = ".icn a";
        appendMethod = 'append';
        //调整标题字体效果
        var title = $('[id^=normalthread]').find('.s.xst')
        title.css({
            'font-size':'17px',
            //'color':'#000',
            'font-weight':700,
            //'font-family':'"Microsoft YaHei", Helvetica, sans-serif',
            'font-family':"'PingFang SC','Helvetica Neue','Microsoft YaHei New','STHeiti Light',sans-serif"
        });

        var category = $('[id^=normalthread]').find('th em')
        category.css({
            'font-size':'17px',
            'font-weight':700,
            'font-family':"'PingFang SC','Helvetica Neue','Microsoft YaHei New','STHeiti Light',sans-serif",
        });
    } else if (url.match(/.*\/search.*/)) {
        selector1 = $('.pbw');
        selector2 = ".xs3 a";
        appendMethod = 'append';
        $('head').append( $('<link rel="stylesheet" type="text/css" />').attr('href', 'data/cache/style_1_forum_forumdisplay.css?acl') );
    } else if (url.match(/.*\/home.*/)) {
        selector1 = $('tr');
        selector2 = "th a";
        appendMethod = 'after';
        $('head').append( $('<link rel="stylesheet" type="text/css" />').attr('href', 'data/cache/style_1_forum_forumdisplay.css?acl') );
    }
}


function addRow(appendMethod, target) {
  var row = $('<tr><td id = "imgbox_td" colspan=5></td ></tr>');
  if (appendMethod === 'append') {
    row.appendTo(target);
    return target.find('#imgbox_td')
  } else if (appendMethod === 'after') {
    target.after(row);
    return target.next('tr').find('#imgbox_td')
  }
}



$(document).ready(function(){

    main();


    $("#autopbn").click(function() {
        setTimeout(function() {
            main();
        }, 500);
    });

});










