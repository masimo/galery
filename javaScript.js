"use strict";

function imGaleryView() {
	var _this = this;

	this.clickFlag = true;
	this.fullScreenMode = false;
	this.dragMode = false;
	this.dragEl = "";
	this.preloader = 0;
	this.ofsetX = 0;
	this.ofsetY = 0;
	this.globalMarg = 0;
	this.activeSlide = 0;
	this.arryOfImage = [];
	this.arryOfImageB = [];
	this.ImagesWidth = [];
	this.ImagesWidthCurArr = [];
	this.xmlPath = "";
	this.galeryWrapID = "";
	this.imageWidth = 0;
	this.zoomValue = 1;

	/***
	 *  Events
	 */

	document.addEventListener("click", function(event) {
		var target = event.target.className;
		if (target === "turnLeft") _this.moveSlide(-1);
		if (target === "turnRight") _this.moveSlide(1);
		if (target === "imageWrap") _this.getImage(event.target);
		if (target === "closeBut") _this.closeFullScreen();
		if (target === "zoomBut") _this.zoomPic(0.25);
		if (target === "zoomOutBut") _this.zoomPic(-0.25)
	});
	window.onmousedown = function(event) {
		var e = event.target.className;
		if (e.search(/infoScreenView/) != -1) {
			_this.dragMode = true;
			_this.dragEl = event.target;
			_this.offsetX = event.clientX - event.target.offsetLeft;
			_this.offsetY = event.clientY - event.target.offsetTop
		}
	};
	window.onmouseup = function() {
		_this.dragMode = false
	};
	window.onkeydown = function(e) {
		var a = e.keyCode ? e.keyCode : e.charCode;
		if (a == 37) _this.moveSlide(-1);
		if (a == 39) _this.moveSlide(1);
		if (a == 27) _this.closeFullScreen()
	};
	window.onscroll = function() {
		_this.infoScreen()
	};
	window.onmousemove = function(event) {
		var e = event.clientY - (window.innerHeight / 2);
		_this.mouseMove(e);
		if (_this.dragMode) _this.infoScreenMove(event.clientX, event.clientY)
	};

	/***
	 *  Events
	 */
}



imGaleryView.prototype.createNewElement = function(element, apTo, id, className) {
	var el = document.createElement(element);
	if (id) el.id = id;
	if (className) el.className = className;
	apTo.appendChild(el);
	return el
};
imGaleryView.prototype.config = function(a) {
	this.xmlPath = a.xmlPath;
	this.galeryWrapID = a.galeryWrapID;
	this.loadImage()
};
imGaleryView.prototype.loadImage = function() {
	var _this = this;
	var newImage = "";
	$.ajax({
		url: this.xmlPath,
		type: 'GET',
		dataType: 'xml',
		error: function() {
			console.log("not Loaded!")
		},
		success: function(xml) {
			_this.showLoading();
			var percent = 0,
				preloader = 0,
				p = 0,
				newImage = document.createElement("img");
			newImage.src = "images/bg.png";
			$(xml).find("itemBlock").each(function() {
				var imagePath = $(this).find("imagePathSmall").text(),
					imagePathB = $(this).find("imagePathBig").text();
				newImage = document.createElement("img");
				newImage.src = imagePath;
				newImage.className = "imageWrap";
				_this.arryOfImage.push(newImage);
				_this.arryOfImageB.push(imagePathB);
				p++;

				newImage.onload = function() {
					preloader++;
					percent = parseInt(preloader * 100 / p);
					$("#preloader").html(percent + '%');
					if (percent === 100) {
						_this.showGalery();
						$("#overlayLadingPanel").fadeOut()
					}
				}
			})
		}
	})

};
imGaleryView.prototype.loadBigIm = function(overlay) {

	var _this = this,
		newImage = document.createElement("img");
	this.showLoading();
	newImage.src = this.arryOfImageB[this.activeSlide];
	newImage.className = "bigImage";
	overlay.innerHTML = "";
	overlay.appendChild(newImage);

	this.infoScreen();

	newImage.onload = function() {
		$("#overlayLadingPanel").fadeOut();
		_this.imageWidth = newImage.offsetWidth;
		_this.zoomValue = 1
	}
};
imGaleryView.prototype.showLoading = function() {
	var overlay = document.getElementById('overlayLadingPanel'),
		body = document.getElementsByTagName('body')[0];
	if (!overlay) overlay = this.createNewElement("div", body, "overlayLadingPanel");
	overlay.innerHTML = "<div id='preloader'></div>";
	$(overlay).show()
};
imGaleryView.prototype.getImage = function(el) {
	var imageSmall = el.attributes[0].nodeValue,
		overlay = document.getElementById('wholePic'),
		body = document.getElementsByTagName('body')[0];
	this.activeSlide = $(el).index();
	if (!overlay) overlay = this.createNewElement("div", body, "wholePic");
	$(".closeBut").show();
	overlay.innerHTML = "";
	this.loadBigIm(overlay);
	$("#wholePic").fadeIn();
	if (!_this.fullScreenMode) this.moveSlide();
	this.fullScreenMode = true;
	$("#toolsContainer").fadeIn();
	this.arrowsPos()
};
imGaleryView.prototype.changeWidth = function() {
	for (var i = 0, len = this.arryOfImage.length; i < len; i++) {
		$(this.arryOfImage[i]).animate({
			width: this.ImagesWidthCurArr.shift()
		}, 300);
	}
};
imGaleryView.prototype.moveSlide = function(a) {
	var _this = this;
	if (!this.clickFlag) return;
	a = a || 0;
	var b = this.activeSlide + a,
		_width = 0;
	if (this.arryOfImage.length <= b || 0 > b) return;
	this.clickFlag = false;
	this.activeSlide = b;
	this.imagesPos();
	this.mouseMove();

	if (this.fullScreenMode) this.getImage(this.arryOfImage[b]);
	var i = 0;
	do {
		_width += this.ImagesWidthCurArr[i] - 8;
		i++
	} while (i <= b) $(".imageLineWrap").animate({
		"margin-left": this.globalMarg + -_width
	}, 500)

	this.changeWidth();

	setTimeout(function() {
		_this.clickFlag = true;
	}, 350)
};
imGaleryView.prototype.arrowsPos = function() {
	var leftAr = document.getElementsByClassName('turnLeft')[0],
		rightAr = document.getElementsByClassName('turnRight')[0],
		el = this.arryOfImage[this.activeSlide],
		_timeout = 400;
	if (!this.fullScreenMode) {
		var L = (window.innerWidth / 2) - (el.offsetWidth / 2) + 10,
			R = (window.innerWidth / 2) + (el.offsetWidth / 2) - leftAr.offsetWidth - 10;
		$(leftAr).animate({
			"left": L
		}, _timeout);
		$(rightAr).animate({
			"left": R
		}, _timeout)
	} else {
		$(leftAr).animate({
			"left": 50
		}, _timeout);
		$(rightAr).animate({
			"left": window.innerWidth - 85
		}, _timeout)
	}
};
imGaleryView.prototype.showGalery = function() {
	var _width = 0,
		_this = this,
		body = document.getElementsByTagName('body')[0],
		galery = document.getElementById("imageGalery"),
		el = this.arryOfImage[0],
		overlay = document.createElement("div");
	overlay.className = "imageLineWrap";
	galery.appendChild(overlay);
	setTimeout(function() {
		for (var i = 0, len = _this.arryOfImage.length; i < len; i++) {
			var image = overlay.appendChild(_this.arryOfImage[i]);
			_width += image.offsetWidth;
			_this.ImagesWidth.push(image.offsetWidth - 22)
		}
		_this.createNewElement("div", body, false, "turnLeft");
		_this.createNewElement("div", body, false, "turnRight");
		_this.createNewElement("div", body, false, "closeBut");
		_this.createNewElement("div", body, "infoScreen");
		var infoScreen = document.getElementById('infoScreen');
		_this.createNewElement("div", infoScreen, false, "infoScreenOverlay");
		_this.createNewElement("div", infoScreen, false, "infoScreenView");
		var tools = _this.createNewElement("div", body, "toolsContainer");
		_this.createNewElement("div", tools, false, "zoomBut");
		_this.createNewElement("div", tools, false, "zoomOutBut");
		_this.globalMarg = (window.innerWidth / 2) - (el.offsetWidth / 2);
		overlay.style.width = _width < 100 ? 5000 : _width + "px";
		overlay.style.marginLeft = _this.globalMarg + 30 + "px";
		_this.globalMarg = (window.innerWidth / 2) + (el.offsetWidth / 2);
		_this.imagesPos();
		_this.changeWidth();
		_this.arrowsPos()
	}, 200)
};
imGaleryView.prototype.infoScreen = function() {
	var _this = this;
	setTimeout(function() {
		var image = _this.arryOfImage[_this.activeSlide],
			bigImage = document.getElementById("wholePic").getElementsByTagName("img")[0],
			scr = document.getElementById("infoScreen"),
			scrollSection = document.getElementById("wholePic"),
			scrollL = window.pageXOffset,
			scrollT = window.pageYOffset,
			_scrinW = window.innerWidth,
			_scrinH = window.innerHeight,
			_widthB = bigImage.offsetWidth,
			_heightB = bigImage.offsetHeight,
			_width = image.offsetWidth - 22,
			_height = image.offsetHeight - 22,
			imgSrc = _this.arryOfImage[_this.activeSlide].attributes[0].nodeValue,
			_left = _this.ratio(_widthB, _width, scrollL),
			_top = _this.ratio(_heightB, _height, scrollT),
			v = _scrinW > _widthB && _scrinH > _heightB ? true : false;
		if (v) {
			$("#infoScreen").fadeOut();
			bigImage.style.margin = "auto"
		} else {
			$("#infoScreen").fadeIn();
			bigImage.style.marginLeft = 0;
			bigImage.style.marginTop = 0
		};
		$("#infoScreen").css({
			display: v,
			width: _width,
			height: _height,
			"background-image": "url(" + imgSrc + ")"
		});
		$(".infoScreenView").css({
			"background-position": "-" + _left + "px -" + _top + "px",
			left: _left,
			top: _top,
			width: _this.ratio(_widthB, _width, _scrinW) - 2,
			height: _this.ratio(_heightB, _height, _scrinH) - 2,
			"background-image": "url(" + imgSrc + ")"
		})
	}, 250)
};
imGaleryView.prototype.ratio = function(wIB, wIS, value) {
	var m = ((value * 100) / wIB) * wIS / 100;
	return m
};
imGaleryView.prototype.dragPos = function(pos, _prop, prop) {
	return pos + prop > _prop ? _prop - prop : pos < 0 ? 0 : pos
};
imGaleryView.prototype.infoScreenMove = function(x, y) {
	var bigImage = document.getElementById("wholePic").getElementsByTagName("img")[0],
		wrap = this.dragEl.parentNode,
		_widthB = bigImage.offsetWidth,
		_heightB = bigImage.offsetHeight,
		_scrinW = window.innerWidth,
		_scrinH = window.innerHeight,
		_wW = wrap.offsetWidth - 2,
		_hW = wrap.offsetHeight - 2,
		w = this.dragEl.offsetWidth,
		h = this.dragEl.offsetHeight;
	x = this.dragPos(x - this.offsetX, _wW, w);
	y = this.dragPos(y - this.offsetY, _hW, h);
	var _left = this.ratio(w, _scrinW, x),
		_top = this.ratio(h, _scrinH, y);
	$(bigImage).css({
		"margin-left": -_left,
		"margin-top": -_top
	});
	$(this.dragEl).css({
		left: x,
		top: y,
		"background-position": "-" + x + "px -" + y + "px"
	})
};
imGaleryView.prototype.zoomPic = function(x) {
	var _this = this;
	if (this.zoomValue === 0.5 && x < 0 || this.zoomValue === 3 && x > 0) return;
	this.zoomValue += x;
	setTimeout(function() {
		var bigImage = document.getElementById("wholePic").getElementsByTagName("img")[0],
			_widthB = _this.imageWidth * _this.zoomValue;
		$(bigImage).animate({
			width: _widthB
		}, 150);
		_this.infoScreen()
	}, 100)
};
imGaleryView.prototype.mouseMove = function(y) {
	y = y - 250 || -window.innerHeight / 2 + 200;
	var f = true,
		j = this.activeSlide;
	y = y < 0 ? -y : -y;
	for (var i = 0, len = this.arryOfImage.length; i < len; i++) {
		var h = this.arryOfImage[i].offsetHeight;
		if (j === 0) f = false;
		var m = j * 0.025 * y;
		this.arryOfImage[i].style.marginTop = m + "px";
		if (f) j--;
		else j++
	}
};
imGaleryView.prototype._WidthImage = function(k, j, w) {
	return k < 6 && k > 0 || k < 0 && k > -6 ? w - j * 2 * 10 : w;

};
imGaleryView.prototype.imagesPos = function() {
	var f = true,
		_width = 0,
		width = 0,
		k = 0,
		j = this.activeSlide;
	for (var i = 0, len = this.arryOfImage.length; i < len; i++) {
		var z = 100,
			el = this.arryOfImage[i];
		if (j === 0) f = false;
		z = z - j;
		k = i - this.activeSlide;

		width = this._WidthImage(k, j, this.ImagesWidth[i]);

		_width += width;

		this.ImagesWidthCurArr.push(width);

		el.style.zIndex = z;
		if (f) j--;
		else j++
	}

};
imGaleryView.prototype.closeFullScreen = function(el) {
	$(".closeBut").fadeOut();
	$("#wholePic").fadeOut();
	$("#infoScreen").fadeOut();
	$("#toolsContainer").fadeOut();
	this.fullScreenMode = false;
	this.moveSlide();
	this.arrowsPos()
}