$(document).ready(function() {
	var loading_height = $("body").height() - $(".mynav").height();
	$("#loadingBox").css({
		height: loading_height, 
		background: "-webkit-linear-gradient(68deg, rgb(87, 23, 235) 0%, rgb(0, 208, 173) 97%)"
	});
	getItem();
});

var api_url = "https://script.google.com/macros/s/AKfycbwO3ui5gANjzYvzjZTYlLT_wxjHXl5K8YrUHuCmJTYPJHkFP9cq/exec";

function getItem() {
	var tobj = {
		姓名: "崔家華",
		信箱: "st880221@gmail.com"
	};
	$.get(api_url, "get", function(ret) {
		console.log("-get-");
		console.log(ret);
		var data = ret.output;
		var i = 0, columns = 4;
		var row = $('<div class="row"></div>');
		data.forEach(function(ele, index) {
			var obj = {
				name: ele["姓名"],
				github: ele["Github"],
				demopage: ele["Demopage"],
				picture: ele["Avatar"],
				info: ele["Info"]
			};
			var id = "name" + (index + 1);
			var column = $('<div class="column"></div>');
			if (index % columns == 0) {
				$("#myCards").append(row);
			}
			row.append(column);
			var card = $("#card-template").clone().attr("id", id).css('display', 'block');
			card.find('.image img').attr("src", obj.picture).click(function() { card.transition('bounce'); });
			card.find('.cardPerson').html(obj.name).mouseenter(function() { $(this).transition('tada'); });
			if (obj.github != "") card.find(".githubHref").attr("href", obj.github);
			card.find('.linkSpan').click(function() { 
				if (obj.demopage != "")
					window.open(obj.demopage); 
				else
					noLinkHandler();
			});
			card.find('.description .ui.segment').html(obj.info);
			column.append(card);
			if (index % columns == (columns - 1))
				row = $('<div class="row"></div>');
		})	
		$("#loadingBox").fadeOut('250', function() {
			$("#main").fadeIn(250);
			handleEdit();
		});
	});
}

function handleEdit() {
	$(".editIcon").click(function(e) {
		var eventClass = e.target;
		var name = $(eventClass).siblings(".cardPerson").html();
		var parentCard = $(eventClass).parents(".ui.card");
		var dimmer = parentCard.find(".ui.dimmer");
		dimmer.html("");
		var css_obj = {
			display: "flex",
			alignItems: "center",
			justifyContent: "center"
		};
		var formBox = $("#tmp-reportBox-first").clone().removeAttr("id").appendTo(dimmer);
		formBox.find(".reportForm").find(".assignName").val(name);
		parentCard.dimmer('show');  
		formBox.css(css_obj).show();
		checkInfo();
		scrollToCardTop(parentCard);
	});
}

function checkInfo() {
	$(".cancelEdit1").click(function(e) {
		var eventClass = e.target;
		var parentCard = $(eventClass).parents(".ui.card");
		var dimmer = parentCard.find(".ui.dimmer");
		parentCard.dimmer('hide');  
		dimmer.html("");
	});
	$(".checkEmail").click(function(e) {
		var eventClass = e.target;
		var parentCard = $(eventClass).parents(".ui.card");
		var dimmer = parentCard.find(".ui.dimmer");
		var formBox = $(eventClass).parents(".reportBox-first");
		var form = $(eventClass).parents(".reportForm");
		var formData = {
			姓名: getFieldValue(form, 'assignName'),
			信箱: getFieldValue(form, 'email')
		};
		var loader = $('<div class="ui text loader">身分驗證中</div>');
		formBox.hide(function() { dimmer.append(loader); });
		var css_obj = {
			display: "flex",
			alignItems: "center",
			justifyContent: "center"
		};
		submitForm(formData).done(function(response){
			var output_obj = response.output;
			if (response.result == "error") {	// fail
				console.log("error");
				loader.hide(function() {
					$(this).remove();				
					var errorMsg = genErrorMsg("Email錯誤", "認證失敗<br>3秒後返回前一頁").appendTo(dimmer);
					setTimeout(function() {
						errorMsg.hide(function() { formBox.show(); }); 
					}, 3000);
				});
				return;
			}
			var second_formBox = $("#tmp-reportBox-second").clone().removeAttr("id").appendTo(dimmer);
			var second_form = second_formBox.find(".reportForm");
			var temp_dimmer = dimmer;
			loader.hide(function() { 
				$(this).remove();
				var successMsg = genSuccessMsg("認證成功", "即將跳轉編輯頁面");
				successMsg.appendTo(dimmer);
				setTimeout(function() {
					successMsg.hide(function() {								
						second_formBox.css(css_obj).show();
						handleEditPanel(second_form, output_obj, formData["姓名"], formData["信箱"]);
					}); 
				}, 1200);
			});   
			formBox.remove();
		});
	});
}

function handleEditPanel(form, preData, name, email) {
	setFieldValue(form, 'avatar', preData['Avatar']);
	setFieldValue(form, 'github', preData['Github']);
	setFieldValue(form, 'demoUrl', preData['Demopage']);
	setFieldValue(form, 'introduce', preData['Info']);
	var mySubmit = function(e) {
		var eventClass = $(e.target);
		var parentCard = $(eventClass).parents(".ui.card");
		var dimmer = parentCard.find(".ui.dimmer");
		var formBox = $(eventClass).parents(".reportBox-second");
		var form = $(eventClass);
		var formData = {
			姓名: name,
			信箱: email,
			Avatar: getFieldValue(form, 'avatar'),
			Github: getFieldValue(form, 'github'),
			Demopage: getFieldValue(form, 'demoUrl'),
			Info: getFieldValue(form, 'introduce')
		};
		
		var loader = $('<div class="ui text loader">資料傳送中</div>');
		formBox.hide(function() { dimmer.append(loader); });
		submitForm(formData).done(function(response){
			if(response == "error") {
				$(this).remove();				
				var errorMsg = genErrorMsg("傳送失敗", "請稍後再試").appendTo(dimmer);
				setTimeout(function() {
					errorMsg.hide(); 
					parentCard.dimmer("hide");
				}, 3000);
				return;
			}
			formBox.remove();
			modifyProfile(parentCard, formData);
			loader.hide(function() {
				var successMsg = genSuccessMsg("修改成功", "即將回到主頁面");
				successMsg.appendTo(dimmer);
				setTimeout(function() {
					successMsg.hide(function() {
						$(this).remove();
						parentCard.dimmer('hide');  
						dimmer.html("");
					}); 
				}, 1200);		
			});	
		});
	};

	form.form({
    on: 'blur',
    fields: {
      avatar: {
        identifier : 'avatar',
        rules: [
          {
            type   : 'regExp[/(?:https?\:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\\b(?:\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?\.(?:jpe?g|png|gif|gifv)/]',
            prompt : '請輸入正確圖源網址'
          }
        ]
      },
      github: {
        identifier : 'github',
        rules: [
          {
            type   : 'regExp[/((?:https\:\/\/)?(?:github\.com\/))\\w+/]',
            prompt : '請輸入正確Github個人主頁網址'
          }
        ]
      },
      demoUrl: {
        identifier : 'demoUrl',
        rules: [
          {
            type   : 'regExp[/(?:https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\\b(?:\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/]',
            prompt : '請輸入正確網址'
          }
        ]
      }
    },
    onSuccess: mySubmit
	});
	$(".cancelEdit2").click(function(e) {
		var eventClass = e.target;
		var parentCard = $(eventClass).parents(".ui.card");
		var dimmer = parentCard.find(".ui.dimmer");
		parentCard.dimmer('hide');  
		dimmer.html("");
	});
}

function submitForm(data) {
	console.log("-post-");
	return $.ajax({
		url: api_url,
		type: 'POST',
		dataType: 'json',
		data: data,
		success: function(ret){
			console.log(ret); // this is currently returning FALSE
		}
	});
}

function getFieldValue(myform, fieldName) {
	var text = myform.form('get value', fieldName);
	if (text != "")
		return text;
}

function setFieldValue(myform, fieldName, value) {
	myform.form('set value', fieldName, value);
}

function noLinkHandler() {
	alert("連結有誤或不存在!");
}

function handleFormData(form, data) {

}

function modifyProfile(card, obj) {
	card.find('.image img').attr("src", obj.Avatar);
	card.find('.cardPerson').html(obj.name);
	if (obj.Github != "") card.find(".githubHref").attr("href", obj.Github);
	card.find('.linkSpan').off("click").click(function() { 
		window.open(obj.Demopage); 
	});
	card.find('.description .ui.segment').html(obj.Info);
}

function scrollToCardTop(card) {
	var containerHeight = $("body").height();
	var cardHeight = card.height();
	var offset = 0;
	if (containerHeight >= cardHeight)
		offset = (containerHeight - cardHeight) / 2;
	else
		offset = ((cardHeight - containerHeight) / 2) * (-1);
	card.animatescroll({padding: offset});
}

function genSuccessMsg(header, content) {
	var css_obj = {
		display: "flex",
		alignItems: "center",
		justifyContent: "center"
	};
	var msg = $("#successMsg").clone().remove("id").css(css_obj);
	msg.find(".header").html(header);
	msg.find(".content").html(content);
	return msg;
}

function genErrorMsg(header, content) {
	var css_obj = {
		display: "flex",
		alignItems: "center",
		justifyContent: "center"
	};
	var msg = $("#errorMsg").clone().remove("id").css(css_obj);
	msg.find(".header").html(header);
	msg.find(".content").html(content);
	return msg;
}