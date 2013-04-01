function imGaleryView() {
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
	this.createNewElement = function(element, apTo, id, className) {
		var el = document.createElement(element);
		if (id) el.id = id;
		if (className) el.className = className;
		apTo.appendChild(el);
		return el
	};
	this.config = function(a) {
		this.xmlPath = a.xmlPath;
		this.galeryWrapID = a.galeryWrapID;
		this.loadImage()
	};
	this.loadImage = function() {
		var self = this;
		var newImage = "";
		$.ajax({
			url: this.xmlPath,
			type: 'GET',
			dataType: 'xml',
			error: function() {
				console.log("not Loaded!")
			},
			success: function(xml) {
				self.showLoading();
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
					self.arryOfImage.push(newImage);
					self.arryOfImageB.push(imagePathB);
					p++;

					newImage.onload = function() {
						preloader++;
						percent = parseInt(preloader * 100 / p);
						$("#preloader").html(percent + '%');
						if (percent === 100) {
							self.showGalery();
							$("#overlayLadingPanel").fadeOut()
						}
					}
				})
			}
		})

	};
	this.loadBigIm = function(overlay) {

		var self = this,
			newImage = document.createElement("img");
		this.showLoading();
		newImage.src = this.arryOfImageB[this.activeSlide];
		newImage.className = "bigImage";
		overlay.innerHTML = "";
		overlay.appendChild(newImage);

		this.infoScreen();

		newImage.onload = function() {
			$("#overlayLadingPanel").fadeOut();
			self.imageWidth = newImage.offsetWidth;
			self.zoomValue = 1
		}
	};
	this.showLoading = function() {
		var overlay = document.getElementById('overlayLadingPanel'),
			body = document.getElementsByTagName('body')[0];
		if (!overlay) overlay = this.createNewElement("div", body, "overlayLadingPanel");
		overlay.innerHTML = "<div id='preloader'></div>";
		$(overlay).show()
	};
	this.getImage = function(el) {
		var imageSmall = el.attributes[0].nodeValue,
			overlay = document.getElementById('wholePic'),
			body = document.getElementsByTagName('body')[0];
		this.activeSlide = $(el).index();
		if (!overlay) overlay = this.createNewElement("div", body, "wholePic");
		$(".closeBut").show();
		overlay.innerHTML = "";
		this.loadBigIm(overlay);
		$("#wholePic").fadeIn();
		if (!self.fullScreenMode) this.moveSlide();
		this.fullScreenMode = true;
		$("#toolsContainer").fadeIn();
		this.arrowsPos()
	};
	this.changeWidth = function() {
		for (var i = 0, len = this.arryOfImage.length; i < len; i++) {
			$(this.arryOfImage[i]).animate({
				width: this.ImagesWidthCurArr.shift()
			}, 300);
		}
	};
	this.moveSlide = function(a) {
		var self = this;
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
			self.clickFlag = true;
		}, 350)
	};
	this.arrowsPos = function() {
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
	this.showGalery = function() {
		var _width = 0,
			self = this,
			body = document.getElementsByTagName('body')[0],
			galery = document.getElementById("imageGalery"),
			el = this.arryOfImage[0],
			overlay = document.createElement("div");
		overlay.className = "imageLineWrap";
		galery.appendChild(overlay);
		setTimeout(function() {
			for (var i = 0, len = self.arryOfImage.length; i < len; i++) {
				var image = overlay.appendChild(self.arryOfImage[i]);
				_width += image.offsetWidth;
				self.ImagesWidth.push(image.offsetWidth - 22)
			}
			self.createNewElement("div", body, false, "turnLeft");
			self.createNewElement("div", body, false, "turnRight");
			self.createNewElement("div", body, false, "closeBut");
			self.createNewElement("div", body, "infoScreen");
			var infoScreen = document.getElementById('infoScreen');
			self.createNewElement("div", infoScreen, false, "infoScreenOverlay");
			self.createNewElement("div", infoScreen, false, "infoScreenView");
			var tools = self.createNewElement("div", body, "toolsContainer");
			self.createNewElement("div", tools, false, "zoomBut");
			self.createNewElement("div", tools, false, "zoomOutBut");
			self.globalMarg = (window.innerWidth / 2) - (el.offsetWidth / 2);
			overlay.style.width = _width < 100 ? 5000 : _width + "px";
			overlay.style.marginLeft = self.globalMarg + 30 + "px";
			self.globalMarg = (window.innerWidth / 2) + (el.offsetWidth / 2);
			self.imagesPos();
			self.changeWidth();
			self.arrowsPos()
		}, 200)
	};
	this.infoScreen = function() {
		var self = this;
		setTimeout(function() {
			var image = self.arryOfImage[self.activeSlide],
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
				imgSrc = self.arryOfImage[self.activeSlide].attributes[0].nodeValue,
				_left = self.ratio(_widthB, _width, scrollL),
				_top = self.ratio(_heightB, _height, scrollT),
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
				width: self.ratio(_widthB, _width, _scrinW) - 2,
				height: self.ratio(_heightB, _height, _scrinH) - 2,
				"background-image": "url(" + imgSrc + ")"
			})
		}, 250)
	};
	this.ratio = function(wIB, wIS, value) {
		var m = ((value * 100) / wIB) * wIS / 100;
		return m
	};
	this.dragPos = function(pos, _prop, prop) {
		return pos + prop > _prop ? _prop - prop : pos < 0 ? 0 : pos
	};
	this.infoScreenMove = function(x, y) {
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
	this.zoomPic = function(x) {
		var self = this;
		if (this.zoomValue === 0.5 && x < 0 || this.zoomValue === 3 && x > 0) return;
		this.zoomValue += x;
		setTimeout(function() {
			var bigImage = document.getElementById("wholePic").getElementsByTagName("img")[0],
				_widthB = self.imageWidth * self.zoomValue;
			$(bigImage).animate({
				width: _widthB
			}, 150);
			self.infoScreen()
		}, 100)
	};
	this.mouseMove = function(y) {
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
	this._WidthImage = function(k, j, w) {
		return k < 6 && k > 0 || k < 0 && k > -6 ? w - j * 2 * 10 : w;

	};
	this.imagesPos = function() {
		var f = true,
			k = width = _width = 0,
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
	this.closeFullScreen = function(el) {
		$(".closeBut").fadeOut();
		$("#wholePic").fadeOut();
		$("#infoScreen").fadeOut();
		$("#toolsContainer").fadeOut();
		this.fullScreenMode = false;
		this.moveSlide();
		this.arrowsPos()
	}
};
var viewFunc = new imGaleryView();
document.addEventListener("click", function(event) {
	var target = event.target.className;
	if (target === "turnLeft") viewFunc.moveSlide(-1);
	if (target === "turnRight") viewFunc.moveSlide(1);
	if (target === "imageWrap") viewFunc.getImage(event.target);
	if (target === "closeBut") viewFunc.closeFullScreen();
	if (target === "zoomBut") viewFunc.zoomPic(0.25);
	if (target === "zoomOutBut") viewFunc.zoomPic(-0.25)
});
window.onmousedown = function(event) {
	var e = event.target.className;
	if (e.search(/infoScreenView/) != -1) {
		viewFunc.dragMode = true;
		viewFunc.dragEl = event.target;
		viewFunc.offsetX = event.clientX - event.target.offsetLeft;
		viewFunc.offsetY = event.clientY - event.target.offsetTop
	}
};
window.onmouseup = function() {
	viewFunc.dragMode = false
};
window.onkeydown = function(e) {
	var a = e.keyCode ? e.keyCode : e.charCode;
	if (a == 37) viewFunc.moveSlide(-1);
	if (a == 39) viewFunc.moveSlide(1);
	if (a == 27) viewFunc.closeFullScreen()
};
window.onscroll = function() {
	viewFunc.infoScreen()
};
window.onmousemove = function(event) {
	var e = event.clientY - (window.innerHeight / 2);
	viewFunc.mouseMove(e);
	if (viewFunc.dragMode) viewFunc.infoScreenMove(event.clientX, event.clientY)
};