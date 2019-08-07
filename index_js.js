
function init(){
    bindEvent();
}

var renderList = document.getElementsByClassName("render-list")[0];
var tbody = document.getElementById("tbody");
var dialog = document.getElementsByClassName("dialog")[0];
var tableData;
var editFormData = document.getElementsByClassName("editstudent-form")[0];
var dialogMask = document.getElementsByClassName("mask")[0];
var page = document.getElementById("page");
var pageDataLength; //总的数据
var pageDataEvery = 4;
var pageDataNum ;
var changeNum;



function bindEvent(){
    // 切换
    var sideMenu = document.getElementsByClassName("left-side-menu")[0];
    addEvent(sideMenu, "click", changeSide);

    // 添加学生信息
    var addStudent = document.getElementsByClassName("add-student-btn")[0];
    addEvent(addStudent, "click", addStudentData);

    //遮罩层展示
    addEvent(tbody, "click", changeDialog);

    // 遮罩层消失
    addEvent(dialogMask, "click", function () {
        dialog.classList.remove("show");
    })
    
    //点击删除
    var editStudentBtn = document.getElementsByClassName("edit-student-btn")[0];
    addEvent(editStudentBtn, "click", editData)

    // 改变页码
    addEvent(page, "click", changePage);
}

//改变页码函数
function changePage(e){
    var e = e || window.event;
    var target = e.target || e.srcElement;
    e.preventDefault();
    var num = e.target.innerHTML;
    if(e.target.tagName == "A"){
        var result = saveData("http://api.duyiedu.com/api/student/findByPage", {page: num, size: pageDataEvery, appkey:"uqw1205_1553869664317"});
        //num  当前页  1为第一页  2为第二页
        //changeNum   为了辅助分页后data-id数字不对的情况
        changeNum = num == 1 ? 0 : pageDataEvery*(num-1)
        renderPageData(result.data.findByPage);
        changeLinkColor(e.target);
    }
}

// 点击页码 当前页码背景色变化
function changeLinkColor(dom){
    var linkShow = document.getElementsByClassName("link-show");
    for(i = 0; i < linkShow.length; i++){
        linkShow[i].classList.remove("link-show");
    }
    dom.classList.add("link-show");
}

//默认第一页
function changeDefaultPage(e){
    var e = e || window.event;
    var target = e.target || e.srcElement;
    var firstLink = page.getElementsByTagName("a")[0];
    e.preventDefault();
    var result = saveData("http://api.duyiedu.com/api/student/findByPage", {page: 1, size: pageDataEvery, appkey:"uqw1205_1553869664317"});
    changeNum = 0;
    renderPageData(result.data.findByPage);
    firstLink.classList.add("link-show");
}

// 渲染页数编号
function renderPageNum(index){
    var htmlStr = "";
    for(var i = 1; i <= index; i++){
        htmlStr += "<a href=''>" + i + "</a>"
    }
    page.innerHTML = htmlStr;
}

// 渲染每页数据
function renderPageData(data){
    var htmlStr = ""
    data.forEach(function (ele, index) {
        htmlStr += '\
        <tr>\
            <td>' + ele.sNo + '</td>\
            <td>' + ele.name + '</td>\
            <td>' + (ele.sex ? "女" : "男") + '</td>\
            <td>' + ele.email + '</td>\
            <td>' + (new Date().getFullYear() - ele.birth) + '</td>\
            <td>' + ele.phone + '</td>\
            <td>' + ele.address + '</td>\
            <td>\
                <button class="btn edit" data-index = ' + (changeNum + index) + '>编辑</button>\
                <button class="btn del" data-index = '  + (changeNum + index) + '>删除</button>\
            </td>\
        </tr>'
    })
    tbody.innerHTML = htmlStr;
}

// 修改数据
function editData (e){
    e.preventDefault();
    var data = getData(editFormData);
    var isTrue = window.confirm("是否修改当前数据？");
    if(isTrue){
        transforData("/api/student/updateStudent", data, function(){
            dialogMask.click();
            renderList.click();
        })
    }
}

// 显示dialog
function changeDialog(e){
    var e = e || window.event;
    var target = e.target || e.srcElement;

    var indexEdit = e.target.className.indexOf("edit") > -1;
    var indexDel = e.target.className.indexOf("del") > -1;
    var index = e.target.getAttribute("data-index");
    // var reg = /\d+$/g;
    // index = index.match(reg);
    console.log(index);
    if(indexEdit){
        dialog.classList.add("show");
        randerForm(tableData[index]);
    }else if(indexDel){
        delData(tableData[index]);
    }
}

//删除数据
function delData(data){
    var isTrue= window.confirm("是否删除该数据？");
    if(isTrue){
        transforData("/api/student/delBySno", {sNo: data.sNo}, function (){
                alert("已删除");
                renderList.click();
            }
        )
    }
}

// 回填学生数据
function randerForm(data){
    for(var prop in data){
        if(editFormData[prop]){
            editFormData[prop].value = data[prop];
        }
    }
}

// 添加学生数据
function addStudentData(e){
    e.preventDefault();
    var addForm = document.getElementById("add-student-form");
    var data = getData(addForm);
    // var result = saveData("http://api.duyiedu.com/api/student/addStudent",Object.assign(data,{
    //     appkey: "uqw1205_1553869664317"
    // }));
    // if(result.status == "success"){
    //     comfir("添加成功！是否跳转学生列表页面?")
    // }
    transforData("/api/student/addStudent", data, function () {
        alert("添加成功");
        renderList.click();
        addForm.reset();
    })
}

// 回调函数  
function transforData(url, data, callback){
    var result = saveData("http://api.duyiedu.com" + url, Object.assign(data, {
        appkey: "uqw1205_1553869664317"
    }));
    if(result.status == "success"){
        callback();
    }
}



// 获取表格数据
function getData(dom){
    var sNo = dom.sNo.value;
    var name = dom.name.value;
    var sex = dom.sex.value;
    var birth = dom.birth.value;
    var phone = dom.phone.value;
    var address = dom.address.value;
    var email = dom.email.value;

    if(!name && !sNo && !birth && !phone && !address && !email){
        return false;
    }
    var nameReg = /^[\w\u4E00-\u9FA5\uf900-\ufa2d]{2,8}$/g;
    var sNoReg = /\d{4,6}/g;
    var birthReg = /(19|20)\d{2}/g;
    var emailReg = /[\w\d]*@([\w]+)\.\w{2,5}/g;
    var addressReg = /[\u4E00-\u9FA5\uf900-\ufa2d\d/-]/g;
    var phoneReg = /[^0]*\d{11}$/g;

    if(!nameReg.test(name)){
        alert("请输入4-16位有效用户名字符(中文、英文、数字、下划线)！")
        return false;    
    }
    if(!sNoReg.test(sNo)){
        alert("学号请输入4-6位有效数字！");
        return false;
    }
    if(!emailReg.test(email)){
        alert("请输入正确的邮箱格式！")
        return false;
    }
    if(!birthReg.test(birth)){
        alert("请输入正确的出生年！");
        return false;
    }
    if(!addressReg.test(address)){
        alert("请正确输入您的详细地址！");
        return false;
    }
    if(!phoneReg.test(phone)){
        alert("手机号请输入11位有效数字");
        return false;
    }


    return {
        name: name,
        sex: sex,
        birth: birth,
        phone: phone,
        address: address,
        email: email,
        sNo: sNo
    }

}



// 切换
function changeSide(e){
    var e = e || window.event;
    var target = e.target || e.srcElement;
    var tagName = e.target.tagName;
    if(tagName == "DD"){  
        //切换左侧side
        changeLeftMenu(e.target);

        // 根据data-id 找到对应右侧内容区
        var leftDataId = e.target.getAttribute("data-id");
        var contentMenuId = document.getElementById(leftDataId);
        //切换右侧内容区
        changeRightContent(contentMenuId);

        //如果切换到的标签名是学生列表  则渲染数据
        if(leftDataId == "student-list"){
            renderData();
            pageDataNum = Math.ceil(pageDataLength/pageDataEvery)
            renderPageNum(pageDataNum);
            changeDefaultPage();
        }
    }
}

// 渲染数据
function renderData(){
    var result = saveData("http://api.duyiedu.com/api/student/findAll",{appkey: "uqw1205_1553869664317"});
    var data = result.data;
    pageDataLength = data.length;
    tableData = data;
    // var htmlStr = "";
    // data.forEach(function (ele, index) {
    //     htmlStr += '\
    //     <tr>\
    //         <td>' + ele.sNo + '</td>\
    //         <td>' + ele.name + '</td>\
    //         <td>' + (ele.sex ? "女" : "男") + '</td>\
    //         <td>' + ele.email + '</td>\
    //         <td>' + (new Date().getFullYear() - ele.birth) + '</td>\
    //         <td>' + ele.phone + '</td>\
    //         <td>' + ele.address + '</td>\
    //         <td>\
    //             <button class="btn edit" data-index = ' + index + '>编辑</button>\
    //             <button class="btn del" data-index = ' + index + '>删除</button>\
    //         </td>\
    //     </tr>'
    // })
    // tbody.innerHTML = htmlStr;
}











// 向后端存储数据  参数 （url, 数据（name,sNo,sex...））
function saveData(url, param) {
    var result = null;
    var xhr = null;
    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else {
        xhr = new ActiveXObject('Microsoft.XMLHTTP');
    }
    if (typeof param == 'string') {
        xhr.open('GET', url + '?' + param, false);
    } else if (typeof param == 'object'){
        var str = "";
        for (var prop in param) {
            str += prop + '=' + param[prop] + '&';
        }
        xhr.open('GET', url + '?' + str, false);
    } else {
        xhr.open('GET', url + '?' + param.toString(), false);
    }
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                result = JSON.parse(xhr.responseText);
            }
        }
    }
    xhr.send();
    return result;
}

// 左侧
// 去掉所有包含side-active的标签名
function changeLeftMenu(dom){
    var active = document.getElementsByClassName("side-active");
    for(var i = 0; i < active.length; i ++){
        active[i].classList.remove("side-active");
    }
    dom.classList.add("side-active");
}

// 右侧
// 查找出所有包含content-active的标签名
// 去除这些标签名
// 给点击到的标签添加content-active表签名
function changeRightContent(dom){
    var active = document.getElementsByClassName("content-active");
    for(var i = 0; i < active.length; i++){
        active[i].classList.remove("content-active");
    }
    dom.classList.add("content-active");
}



// 封装点击事件
function addEvent(ele, type, handle){
    if(addEventListener){
        ele.addEventListener(type, handle);
    }else if(ele.attachEvent){
        ele.attachEvent("on" + type,function () {
            handle.call(ele);
        })
    }else{
        ele["on" + type] = handle;
    }
}


init();
