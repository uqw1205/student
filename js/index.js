// ajax
(function($){
    var obj = {
        init: function(){
            this.bindEvent();
            this.dataList = [];
            this.size = null;
            this.option = {
                title : {
                    text: '',
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
                        name: '',
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
        },
        bindEvent:function(){
            var self = this;
            //hashchange事件 当hash值发生改变
            $(window).on('hashchange', function(){
                $(".content-active").removeClass("content-active"); //去除内容区显示类名
                var hash = location.hash;  //取当前的hash值
                $(hash).addClass("content-active");   //当前hash值为内容区的对应id值  添加显示类名
            });
            // 学生列表加载
            $(".student_list").on("click", function(){
                //闭包 这里的this指向的是$("#student-list") 而这里需要调用 getAllData() 
                self.getAllData();
            });
            // 添加学生
            $(".add-student-btn").on("click", function(){
                self.addData();
                return false;
            })
            // 按条件搜索
            $(".search-btn").on("click", function(){
                self.searchData();
            })
        },
        // 搜索
        searchData: function(){
            var self = this;
            var sex = $("input:radio:checked").val(); //选中的input值
            var search = $("#inp").val(); //输入框填写的值
            var page = 1;  //页数
            var size = this.size;  //每页显示数量
            if(!search){
                alert("请输入搜索内容！");  //如果没有输入搜索内容 则弹出框
            }
            sex = sex || 0; // 如果没选性别 默认是男的
            $.ajax({
                url:"http://api.duyiedu.com/api/student/searchStudent?appkey=uqw1205_1553869664317", 
                data: {sex:sex, search: search, page: page, size: size},
                success: function(data){
                    var list = JSON.parse(data).data.searchList;   //转化成JSON格式
                    console.log(list);
                    self.randerDom(list);  //将获取到的数据 渲染到表格
                },
                error: function(){
                    alert("查询失败")
                }
            })
        },
        //添加数据
        addData:function(){
            //学号需要4-16位数字
            var data = this.getFormData($(".addstudent-form"));  //获取到添加表单里的数据
            console.log(data);
            $.ajax({
                url:"http://api.duyiedu.com/api/student/addStudent?appkey=uqw1205_1553869664317",
                data: data, //
                success: function(data){
                    alert("添加成功");
                    $(".student_list").trigger("click") //添加成功后跳转到学生列表页
                },
                error: function(){
                    alert("error");
                }
            })
            
        },
        // 获取所有数据
        getAllData: function(){
            var self = this;
            $.ajax({
                url: "http://api.duyiedu.com/api/student/findAll?appkey=uqw1205_1553869664317",
                method: "GET",
                success: function(data){
                    var list = JSON.parse(data).data;  //转化成JSON格式
                    console.log(list);
                    self.size = list.length;  //size值用于搜索数据
                    self.randerDom(list);  //渲染数据到表格
                    self.dataList = list; //将获取到的数据赋给dataList  用于点击编辑删除按钮时 获取数据
                    self.getSexData(list); //echarts 用
                    self.getAreaData(list); //echarts 用
                },
                beforeSend:function(){ //数据成功获取回来后的状态
                    $("tbody").html("<p>正在加载......</p>")
                },
                error: function(){
                    console.log("error")
                }
            })
        },
        // 地区echarts
        getAreaData: function(data){
            var myAreaChart = echarts.init($("#echarts-area")[0]); //echarts需要获取到容器
            var legendArr = [];
            var seriesArr = [];
            var numObj = {};
            data.forEach(function(ele, index){    //遍历所有数据
                if(legendArr.indexOf(ele.address) == -1){   //新数组中是否有ele.address
                    legendArr.push(ele.address);   //如果没有 则push到新数组
                    numObj[ele.address] = 1;    //新对象的属性值 = 1
                }else{
                    numObj[ele.address] ++;   //如果有 新对象的属性值则++
                }
            })
            for( var prop in numObj){  //新对象遍历
                var obj = {};  //目标对象有两个属性 name value
                obj.name = prop;  //obj.name = 新对象的属性名
                obj.value = numObj[prop];  //obj.value = 新对象的属性值
                // console.log(obj);
                seriesArr.push(obj);  //将目标对象push到目标数组中
            }
            console.log(legendArr, seriesArr);
            this.option.title.text = '地区分布'
            this.option.legend.data = legendArr;
            this.option.series[0].name = "地区分布"
            this.option.series[0].data = seriesArr;  //将目标数组赋值到对应位置
            var option = this.option;
            myAreaChart.setOption(option);  //使用上面的配置和数据显示图标
        },
        // 性别 echarts
        getSexData: function(data){
            var mySexChart = echarts.init($("#echarts-sex")[0]);
            var obj = {};
            data.forEach(function(ele, index){
                if(!obj[ele.sex]){
                    obj[ele.sex] = 1;
                }else{
                    obj[ele.sex] ++;
                }
            })
            console.log(obj);
            var seriesArr = [{name: '男', value: obj[0]}, {name: '女',value:obj[1]}]
            this.option.title.text = '性别比例'
            this.option.legend.data = ['男', '女'];
            this.option.series[0].name ="性别";
            this.option.series[0].data = seriesArr;
            var option = this.option;
            mySexChart.setOption(option);
        },
        // 渲染数据到页面
        randerDom: function(data){
            var self = this;
            var len = data.length; //限制条件
            var str;
            if(len > 0 ){  //如果有数据 渲染
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
                    //button 上的data-index用于操作编辑 删除 
                    $("#tbody").html(str);  //插入数据
                    self.pop(); //表格渲染完成后才能触发编辑删除事件
                })
            }
        },
        // 编辑删除数据
        pop: function(){
            // 弹出框事件 (编辑框 删除框)
            var self = this;
            // 点击编辑
            $(".edit").on('click',function(){
                $(".dialog").show();  //遮罩层显示
                var i = $(this).attr("data-index"); //获取到所点击数据的index值
                var data = self.dataList[i]; // 获取点击的数据  对象格式
                // console.log("点击获取的数据", data);
                var form = $(".editstudent-form")[0];  // 获取编辑框
                for(var prop in data){  // 遍历对象
                    // console.log(prop); 属性名
                    //判断是否有form[prop]属性   如果有form[prop].value = data[prop]
                    form[prop]? form[prop].value = data[prop]: '';
                }
                // 编辑提交按钮
                $(".edit-student-btn").on("click", function(){
                    // 获取到编辑表单里的数据
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
            //删除数据
            $(".del").on("click", function(){
                $(".del-dialog").show(); //显示删除弹出框
                var i = $(this).attr("data-index"); //获取到需要删除数据的index
                var num = self.dataList[i].sNo; //删除对象需要获取到sNo值
                console.log(num);
                //点击确认删除
                $(".del-btn-sure").on("click", function(){
                    $.ajax({
                        url: 'http://api.duyiedu.com/api/student/delBySno?appkey=uqw1205_1553869664317',
                        data: {sNo: num},
                        success: function(){
                            $(".del-dialog").hide(); //弹出框消失
                            alert("删除成功"); //弹出删除成功
                            $(".student_list").trigger("click") //跳转到学生列表
                        },
                        error: function(){
                            alert("error");
                        }
                    })
                })
            })
        },
        // 获取添加的数据
        getFormData: function(form){
            var data = form.serializeArray(); //数组 获取到表单里的数据
            console.log("serializeArray", data);
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


