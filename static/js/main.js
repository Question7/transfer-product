var config = {
    baseUrl: window.location.href + "api/user"
};

var userMap = new Map();
var folderMap = new Map();
var sendFolder = new Map();

details();

listUsers().then(function () {
    listSrcTransfers();
    listDstTransfers();
});

listDstFolder();
listSrcFolder();

function details() {
    $.ajax({
        type: "GET",
        url: config.baseUrl + "/user/details",
        success: function (res) {
            if (res === "10001") {
                $("#menu").append("<button onclick='managerPanel()'>管理</button>")
            }
        }
    })
}

// 我发送的
function listSrcTransfers() {
    $.ajax(
        {
            type: "GET",
            url: config.baseUrl + "/transfer/src",
            success: function (res) {
                setSrcTransfer(res);
            },
            error: function (e) {
                errorHandler(e);
            }
        }
    )
}

// 我接收的
function listDstTransfers() {
    $.ajax(
        {
            type: "GET",
            url: config.baseUrl + "/transfer/dst",
            success: function (res) {
                setDstTransfer(res);
            },
            error: function (e) {
                errorHandler(e);
            }
        }
    )
}
// 我发送的
function listSrcFolder() {
    $.ajax(
        {
            type: "GET",
            url: config.baseUrl + "/folder/src",
            success: function (res) {
                console.log(res);
                for (var i = 0; i < res.length; i ++) {
                    var item = res[i];
                    var date = convertDate(item.createTime);
                    $("#s-folder").append("<p style='border: solid 1px #000;' id='" + item.id + "'><a href='javascript:void(0);' onclick='folderDetails(\"" + item.id + "\", \"src\")'>" + item.name + " </a>&nbsp;&nbsp;" + item.comment + " &nbsp;&nbsp;" + date + " " + "<a href=\"javascript:void(0);\" onclick='folderUser(\"" + item.id + "\")'>U</a> <a href=\"javascript:void(0);\" onclick='delFolder(\"" + item.id + "\")'>D</a></p>");
                    folderMap.set(item.id, item.name);
                    sendFolder.set(item.id, item.name);
                }
            },
            error: function (e) {
                console.log(e);
            }
        }
    )
}
// 我接收的
function listDstFolder() {
    $.ajax(
        {
            type: "GET",
            url: config.baseUrl + "/folder/dst",
            success: function (res) {
                console.log(res);
                for (var i = 0; i < res.length; i ++) {
                    var item = res[i];
                    var date = convertDate(item.createTime);
                    $("#r-folder").append("<p style='border: solid 1px #000;' id='" + item.id + "'><a href='javascript:void(0);' onclick='folderDetails(\"" + item.id + "\", \"dst\")'>" + item.name + "</a>&nbsp;&nbsp;" + item.comment + " &nbsp;&nbsp;" + date + " " + "</p>");
                    folderMap.set(item.id, item.name);
                }
            },
            error: function (e) {
                console.log(e);
            }
        }
    )
}
function listUsers() {
    return new Promise(function (resolve, reject) {
        $.ajax(
            {
                type: "GET",
                url: config.baseUrl + "/user",
                success: function (res) {
                    console.log(res);
                    for (var i = 0; i < res.length; i ++) {
                        userMap.set(res[i].id, res[i].nick);
                    }
                    resolve();
                    setUserSelector();
                },
                error: function (e) {
                    console.log(e);
                    reject();
                }
            }
        )
    });
}
function addTransfer() {
    var type = $("#type")[0].value;
    var target = $("#selector")[0].value;
    var file = $("#file")[0].files[0];
    var fd = new FormData();
    fd.append("type", type);
    fd.append("target", target);
    fd.append("file", file);
    $.ajax(
        {
            type: "POST",
            url: config.baseUrl + "/transfer",
            data: fd,
            processData: false,
            contentType: false,
            dataType: "text",
            success: function (res) {
                alert("发送成功");
                window.location.reload();
            },
            error: function (e) {
                alert("发送失败");
                console.log(e);
            }
        }
    )
}

function addFolder() {
    var name = $("#create-name")[0].value;
    var comment = $("#create-comment")[0].value;
    var usernameElements = $("#username input");
    var username = [];
    for (var i = 0; i < usernameElements.length; i ++) {
        if (usernameElements[i].checked) {
            username.push(usernameElements[i].value);
        }
    }
    var d = {
        "name" : name,
        "comment" : comment,
        "uid" : username
    };
    $.ajax(
        {
            type: "POST",
            url: config.baseUrl + "/folder",
            data: JSON.stringify(d),
            processData: false,
            contentType: "application/json",
            dataType: "text",
            success: function (res) {
                alert("创建成功");
                window.location.reload();
            },
            error: function (e) {
                alert("创建失败");
                console.log(e);
            }
        }
    )
}

function folderUser(id) {
    $.ajax({
        type: "GET",
        url: config.baseUrl + "/user/folder?folderId=" + id,
        success: function (res) {
            $("#folder-user").text("");
            res.forEach(function (item) {
                $("#folder-user").append("&nbsp;" + item.nick + " &nbsp;");
            })
            $("#folderPanel")[0].style.display = "block";
        },
        error: function (e) {
            errorHandler(e);
        }
    });
}
function closeFolderUser() {
    $("#folderPanel")[0].style.display = "none";
}
function delFolder(id) {
    $.ajax({
        type: "DELETE",
        url: config.baseUrl + "/folder?id=" + id,
        dataType: "text",
        success: function (res) {
            alert("删除成功");
            window.location.reload();
        },
        error: function (e) {
            errorHandler(e);
        }
    });
}

function setDstTransfer(res) {
    console.log(res);
    $("#r-data p").remove();
    for (var i = 0; i < res.length; i ++) {
        var item = res[i];
        var size = convertSize(item.size);
        var date = convertDate(item.createTime);
        var username = userMap.get(item.uid);
        username = username === undefined ? " " : username;
        var folder;
        if (item.targetFolder == null || item.targetFolder === undefined) {
            folder = "";
        } else {
            folder = folderMap.get(item.targetFolder);
        }
        $("#r-data").append("<p style='border: solid 1px #000;' id='" + item.id + "' onclick='download(\"" + item.id + "\")'><span style=\"border: solid 1px #000; font-weight: 600\">" + folder + "</span>&nbsp;&nbsp;&nbsp;" + username + " &nbsp;&nbsp;<a href='javascript:void(0);'>" + item.filename + "</a>&nbsp;&nbsp;" + item.extension + " &nbsp;&nbsp;" + size
            + " &nbsp;&nbsp;" + date + " " + "</p>");
    }
}

function setSrcTransfer(res) {
    console.log(res);
    $("#s-data p").remove();
    for (var i = 0; i < res.length; i ++) {
        var item = res[i];
        var size = convertSize(item.size);
        var date = convertDate(item.createTime);
        var username = userMap.get(item.uid);
        username = username === undefined ? " " : username;
        var folder;
        if (item.targetFolder == null || item.targetFolder === undefined) {
            folder = "";
        } else {
            folder = folderMap.get(item.targetFolder);
        }
        $("#s-data").append("<p style='border: solid 1px #000;' id='" + item.id + "' onclick='download(\"" + item.id + "\")'><span style=\"border: solid 1px #000; font-weight: 600\">" + folder + "</span>&nbsp;&nbsp;&nbsp;" + username + " &nbsp;&nbsp;<a href='javascript:void(0);'>" + item.filename + "</a>&nbsp;&nbsp;" + item.extension + " &nbsp;&nbsp;" + size
            + " &nbsp;&nbsp;" + date + " " + "</p>");
    }
}

function errorHandler(e) {
    console.log(e);
}

function download(id) {
    window.location.href=config.baseUrl + "/transfer/download?id=" + id;
}

function folderDetails (id, type) {
    $.ajax(
        {
            type: "GET",
            url: config.baseUrl + "/transfer/folder?folderId=" + id,
            success: function (res) {
                if (type === "dst") {
                    setDstTransfer(res);
                } else {
                    setSrcTransfer(res);
                }
            },
            error: function (e) {
                console.log(e);
            }
        }
    )
}

function setSelector() {
    if ($("#type")[0].value === "FOLDER") {
        setFolderSelector();
    } else {
        setUserSelector();
    }
}

function setUserSelector() {
    $("#selector option").remove();
    userMap.forEach(function (value, key) {
        $("#selector").append("<option value='" + key + "'>" + value + "</option>")
    });
}
function setFolderSelector() {
    $("#selector option").remove();
    sendFolder.forEach(function (value, key) {
        $("#selector").append("<option value='" + key + "'>" + value + "</option>")
    });
}

function showCreateFolderPanel() {
    $("#createFolder")[0].style.display = "block";
    $("#username").text("");
    var i = 0;
    userMap.forEach(function (value, key) {
        if (i%6 === 0) {
            $("#username").append("<br>");
        }
        $("#username").append("<input type=\"checkbox\" value=\"" + key + "\">" + value + "&nbsp;&nbsp;");
        i++;
    })
}

function cancelAndClose() {
    $("#createFolder")[0].style.display = "none";
}

function passwordPanel() {
    $("#password")[0].style.display = "block";
}

function closePassword() {
    $("#password")[0].style.display = "none";
}

function updatePassword() {
    var fd = new FormData();
    fd.append("opd", $("#opd")[0].value);
    fd.append("npd", $("#npd")[0].value);
    $.ajax(
        {
            type: "PUT",
            url: config.baseUrl + "/user",
            data: fd,
            processData: false,
            contentType: false,
            dataType: "text",
            success: function (res) {
                if (res === "success") {
                    alert("修改成功");
                    window.location.reload();
                }else {
                    alert("修改失败");
                }
            },
            error: function (e) {
                alert("修改失败");
                console.log(e);
            }
        }
    )

}

function managerPanel() {
    $.ajax("/api/admin/period").success(function (res) {
        $("#period")[0].value = res;
    });
    $("#admin")[0].style.display = "block";
}

function closeManager() {
    $("#admin")[0].style.display = "none";
}

function addUser() {
    var name = $("#name")[0].value;
    var nick = $("#nick")[0].value;
    var password = $("#pwd")[0].value;
    var d = {
        "username": name,
        "nick": nick,
        "password": password
    };
    $.ajax(
        {
            type: "POST",
            url: "/api/admin/user",
            data: JSON.stringify(d),
            processData: false,
            contentType: "application/json",
            dataType: "text",
            success: function (res) {
                alert("添加成功");
                window.location.reload();
            },
            error: function (e) {
                alert("添加失败");
                console.log(e);
            }
        }
    )
}

function setPeriod() {
    $.ajax({
        type:"PUT",
        url: "/api/admin/period?time=" + $("#period")[0].value,
        dataType: "text",
        success: function () {
            alert("设置成功");
            window.location.reload();
        },
        error: function (e) {
            alert("设置失败");
            console.log(e);
        }
    })
}

function convertSize(size) {
    var dan = ["B", "KB", "MB", "G", "T"]
    var i = 0;
    while (size >= 1024) {
        size = size/1024;
        i ++;
    }
    return size.toFixed(3) + " " + dan[i];
}

function convertDate(time) {
    var date = new Date(time);
    var mins = date.getMinutes();
    if (mins < 10) {
        mins = "0" + mins;
    }
    return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + mins;
}