// ajax
(function($){
    var obj = {
        init: function(){
            this.bindEvent();
            this.dataList = [];
            this.size = null;
        },
        bindEvent:function(){
            var self = this;
            //hashchange事件
            $(window).on('hashchange', function(){
                $(".content-active").removeClass("content-active"); //去除内容区显示类名
                var hash = location.hash;  //取当前的hash值
                $(hash).addClass("content-active");   //当前hash值为内容区的对应id值  添加显示类名
            });
            $(".student_list").on("click", function(){
                //闭包 这里的this指向的是$("#student-list") 而这里需要调用 getAllData() 
                self.getAllData();
            });
            $(".add-student-btn").on("click", function(){
                self.addData();
                return false;
            })
            $(".search-btn").on("click", function(){
                self.searchData();
            })
        },
        searchData: function(){
            var self = this;
            var sex = $("input:radio:checked").val();
            var search = $("#inp").val();
            var page = 1;
            var size = this.size;
            if(!search){
                alert("请输入搜索内容！");  //如果没有输入搜索内容 则弹出框
            }
            sex = sex || 0; // 如果没选性别 默认是男的
            $.ajax({
                url:"http://api.duyiedu.com/api/student/searchStudent?appkey=uqw1205_1553869664317", 
                data: {sex:sex, search: search, page: page, size: size},
                success: function(data){
                    var list = JSON.parse(data).data.searchList;
                    console.log(list);
                    self.randerDom(list);
                },
                error: function(){
                    alert("查询失败")
                }
            })
        },
        addData:function(){
            //学号需要4-16位数字
            var data = this.getFormData($(".addstudent-form"));
            console.log(data);
            $.ajax({
                url:"http://api.duyiedu.com/api/student/addStudent?appkey=uqw1205_1553869664317",
                data: data,
                success: function(data){
                    alert("添加成功");
                    $(".student_list").trigger("click")
                },
                error: function(){
                    alert("error");
                }
            })
            
        },
        getAllData: function(){
            var self = this;
            $.ajax({
                url: "http://api.duyiedu.com/api/student/findAll?appkey=uqw1205_1553869664317",
                method: "GET",
                success: function(data){
                    var list = JSON.parse(data).data;
                    console.log(list);
                    self.size = list.length;
                    self.randerDom(list);
                    self.dataList = list; //将获取到的数据赋给变量
                    self.getSexData(list);
                    self.getAreaData(list);
                },
                beforeSend:function(){ //数据成功获取回来后的状态
                    $("tbody").html("<p>正在加载......</p>")
                },
                error: function(){
                    console.log("error")
                }
            })
        },
        getAreaData: function(data){
            var myAreaChart = echarts.init($("#echarts-area")[0]);
            var option = {
                title : {
                    text: '性别比例',
                    subtext: '纯属虚构',
                    x:'center'
                },
                tooltip : {
                    trigger: 'item',
                    formatter: "{a} <br/>{b} : {c} ({d}%)"
                },
                legend: {
                    orient: 'vertical',
                    left: 'left',
                    data:[]
                },
                series : [
                    {
                        name: '地区来源',
                        type: 'pie',
                        radius : '55%',
                        center: ['50%', '60%'],
                        data:[],
                        itemStyle: {
                            emphasis: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }
                    }
                ]
            };
            var legendArr = [];
            var seriesArr = [];
            var numObj = {};

            data.forEach(function(ele, index){
                if(legendArr.indexOf(ele.address) == -1){
                    legendArr.push(ele.address);
                    numObj[ele.address] = 1;
                }else{
                    numObj[ele.address] ++;
                }
            })
            for( var prop in numObj){
                var obj = {};
                obj.name = prop;
                obj.value = numObj[prop];
                // console.log(obj);
                seriesArr.push(obj);
            }
            console.log(legendArr, seriesArr);

            option.legend.data = legendArr;
            option.series[0].data = seriesArr;
            
            myAreaChart.setOption(option);
        },
        getSexData: function(data){
            
        },
        randerDom: function(data){
            var self = this;
            var len = data.length;
            var str;
            if(len > 0 ){
                data.forEach(function(ele, index){
                    // console.log(ele, index);
                    str += '<tr><td>'+ ele.sNo + '</td>\
                        <td>'+ ele.name +'</td>\
                        <td>' + (ele.sex?'女':'男') + '</td>\
                        <td>'+ ele.email +'</td>\
                        <td>'+ (new Date().getFullYear()-ele.birth) +'</td>\
                        <td>'+ ele.phone +'</td>\
                        <td>'+ ele.address +'</td>\
                        <td>\
                            <button class="btn edit" data-index='+ index +'>编辑</button>\
                            <button class="btn del" data-index='+ index +'>删除</button>\
                        </td>\
                    </tr>';
                    $("#tbody").html(str);
                    self.pop(); //表格渲染完成后才能触发事件
                })
            }
        },
        pop: function(){
            // 弹出框事件 (编辑框 删除框)
            var self = this;
            $(".edit").on('click',function(){
                $(".dialog").show();
                var i = $(this).attr("data-index");
                var data = self.dataList[i];
                var form = $(".editstudent-form")[0];
                for(var prop in data){
                    // console.log(prop); 属性名
                    //判断是否有form[prop]属性   如果有form[prop].value = data[prop]
                    form[prop]? form[prop].value = data[prop]: '';
                }
                $(".edit-student-btn").on("click", function(){
                    var data = self.getFormData($(".editstudent-form"));
                    console.log(data);
                    $.ajax({
                        url: 'http://api.duyiedu.com/api/student/updateStudent?appkey=uqw1205_1553869664317',
                        data: data, //修改需要上传表单数据
                        success: function(){  //成功后提示修改成功
                            alert("修改成功");
                            $(".dialog").hide(); //遮罩层消失
                            $(".student_list").trigger('click');  //列表刷新  相当于点击了左侧list按钮
                        },
                        error: function(){
                            alert("error"); //错误提示错误框
                        }
                    })
                    return false;
                })
            })
            $(".del").on("click", function(){
                $(".del-dialog").show();
                var i = $(this).attr("data-index");
                var num = self.dataList[i].sNo;
                console.log(num);
                $(".del-btn-sure").on("click", function(){
                    $.ajax({
                        url: 'http://api.duyiedu.com/api/student/delBySno?appkey=uqw1205_1553869664317',
                        data: {sNo: num},
                        success: function(){
                            $(".del-dialog").hide();
                            alert("删除成功");
                            $(".student_list").trigger("click")
                        },
                        error: function(){
                            alert("error");
                        }
                    })
                })
            })
        },
        getFormData: function(form){
            var data = form.serializeArray(); //数组
            var obj = {}; //将数组转化为对象的形式
            data.forEach(function(ele, index){
                obj[ele.name] = ele.value;
            })
            // console.log(obj);
            return obj;  //返回数据
        }
    }
    obj.init();
})(window.jQuery)


