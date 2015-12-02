$(document).ready(function() {
	getItem();
});

function getItem() {
	var api_url = "https://script.google.com/macros/s/AKfycby41CZbvhT0jO1Z0ya_u5a5hM1J01uiaF0v4UFkG6cnnFoJH5o/exec";

	$.get(api_url, "get", function(ret) {
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
			card.find('.image img').attr("src", obj.picture);
			card.find('.cardPerson').html(obj.name);
			if (obj.github != "")
				card.find(".githubHref").attr("href", obj.github);
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
		formHandle(formData).done(function(response){
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
			var temp_dimmer = dimmer;
			loader.hide(function() { 
				$(this).remove();
				var successMsg = genSuccessMsg("認證成功", "即將跳轉編輯頁面");
				successMsg.appendTo(dimmer);
				setTimeout(function() {
					successMsg.hide(function() {
						second_formBox.css(css_obj).show();
						handleEditPanel(formData["姓名"], formData["信箱"]);
					}); 
				}, 1200);
			});   
			formBox.remove();
		});
	});
}

function handleEditPanel(name, email) {
	$(".cancelEdit2").click(function(e) {
		var eventClass = e.target;
		var parentCard = $(eventClass).parents(".ui.card");
		var dimmer = parentCard.find(".ui.dimmer");
		parentCard.dimmer('hide');  
		dimmer.html("");
	});
	$("#submitInfo").click(function(e) {
		var eventClass = e.target;
		var parentCard = $(eventClass).parents(".ui.card");
		var dimmer = parentCard.find(".ui.dimmer");
		var formBox = $(eventClass).parents(".reportBox-second");
		var form = $(eventClass).parents(".reportForm");
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
		formHandle(formData).done(function(response){
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
			})		
		});
	});
}

function formHandle(data) {
	var api_url = "https://script.google.com/macros/s/AKfycby41CZbvhT0jO1Z0ya_u5a5hM1J01uiaF0v4UFkG6cnnFoJH5o/exec";
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
	return "";
}

function noLinkHandler() {
	alert("這個使用者還沒更新資料!");
}

function scrollToCardTop(card) {
	var containerHeight = $("body").height();
	var cardHeight = card.height();
	var offset = 0;
	if (containerHeight >= cardHeight)
		offset = (containerHeight - cardHeight) / 2;
	else
		offset = ((cardHeight - containerHeight) / 2) * (-1);
	$("body").animate({scrollTop: card.offset().top - offset}, 400);
}

function modifyProfile(card, obj) {
	card.find('.image img').attr("src", obj.Avatar);
	card.find('.cardPerson').html(obj.name);
	if (obj.Github != "") card.find(".githubHref").attr("href", obj.Github);
	card.find('.linkSpan').click(function() { 
		window.open(obj.Demopage); 
	});
	card.find('.description .ui.segment').html(obj.Info);
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