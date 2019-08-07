// dom操作
(function($){
    var obj = {
        init: function(){
            this.bindEvent();
            location.hash = "student-echarts";  //初始定义hash值
        },
        bindEvent:function(){
            // 改变左侧栏目状态
            $(".left-side-menu dd").on('click', function(){
                $(".side-active").removeClass("side-active");    //删除显示类名
                $(this).addClass("side-active");  //点击标签添加显示类名
                location.hash = $(this).attr("data-id");  //hash值变为 当前所点击标签的data-id值
                return false;   //取消a标签的默认事件
            })
            $(".mask").on("click", function(){
                $(".dialog").hide();
            })

            // 删除按钮的遮罩层
            $(".del-dialog").on("click", function(){
                $(this).hide();
            })
            $(".del-dialog-content").on("click", function(e){
                e.stopPropagation();  //取消冒泡事件
                // return false 一般用来取消默认事件
            })
        }, 
    }
    obj.init();
})(window.jQuery)




