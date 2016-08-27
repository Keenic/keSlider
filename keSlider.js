;(function ($, window, document) {
    "use strict";

    function keSlider(container, options) {
        var _this = this;

        this.container = $(container);
        this.originalItems = this.container.find('.keSlider__item');
        this.containerWidth = this.container.width();
        this.options = {};
        $.extend(this.options, this.defaults, options);

        this.windowWidth = window.innerWidth || window.document.documentElement.clientWidth;

        this.init();

        $(window).resize(function() {
            _this.windowWidth = window.innerWidth || window.document.documentElement.clientWidth;
            _this.containerWidth = _this.container.width();

            _this.initSlider(false);

            _this.moveTo(null, _this.activeSlide, 0);
        });
    }

    keSlider.prototype.defaults = {
        carousel: false,
        arrows: true,
        navigation: true,
        perSlide: 1,
        perMove: 1,
        animationTime: 400,
        touch: true,
        changeSlidePosition: 20,
        responsive: false,
        autoPlay: false,
        autoDelay: 5000
    };

    keSlider.prototype.init = function() {
        var _this = this;
        var sliderImages = this.originalItems.find('img');
        var imagesNo = sliderImages.length;
        var imagesLoaded = 0;

        if (imagesNo) {
            sliderImages.each(function() {
                var image = new Image();
                image.src = this.src;
                image.onload = function() {
                    imagesLoaded++;

                    if (imagesLoaded === imagesNo) {
                        _this.initSlider(true);
                    }
                };
            });
        } else {
            this.initSlider(true);
        }
    };

    keSlider.prototype.initSlider = function(firstTime) {
        if (firstTime) {
            this.activeSlide = 0;
        }

        this.checkResponsiveOptions();

        if (this.options.arrows) {
            this.arrows();
        } else {
            this.deleteArrows();
        }
        if (this.options.navigation) {
            this.navigations();
        } else {
            this.deleteNavigation();
        }

        if (firstTime) {
            this.wrapItems();
        }
        if (this.options.carousel) {
            this.cloneItems();
        } else {
            this.deleteClonedItems();
            this.items = this.originalItems;
        }
        this.setItemsWidth();
        this.setWrapperWidth();
        this.setHeights();

        if (this.options.touch) {
            this.initTouch();
        } else {
            this.deleteTouch();
        }

        if (this.options.autoPlay) {
            this.startAutoMove();
        } else {
            this.stopAutoMove();
        }
        
        if (firstTime) {
            this.container.on('keSlider.moveTo', this.moveTo.bind(this));
            this.container.on('keSlider.nextSlide', this.nextSlide.bind(this));
            this.container.on('keSlider.prevSlide', this.prevSlide.bind(this));
        }
    };

    keSlider.prototype.checkResponsiveOptions = function() {
        var _this = this;
        var responsiveOptions = this.options.responsive;

        if (typeof responsiveOptions === 'object') {
            Object.keys(responsiveOptions).forEach(function(key, index) {
                if (key < _this.windowWidth) {
                    $.extend(_this.options, _this.options, responsiveOptions[key]);
                }
            });
        }
    };
    
    keSlider.prototype.cloneItems = function() {
        this.deleteClonedItems();

        for(var i = 0; i < this.options.perSlide; i++) {
            this.cloneItem(i, false);
        }
        for(var j = this.originalItems.length - 1; j > this.originalItems.length - 1 - this.options.perSlide; j--) {
            this.cloneItem(j, true);
        }

        this.items = this.itemsWrapper.find('.keSlider__item');

        var moveToSlide = this.options.perSlide;
        if (this.activeSlide >= moveToSlide) {
            moveToSlide = this.activeSlide;
        }
        this.moveTo(null, moveToSlide, 0);
    };

    keSlider.prototype.deleteClonedItems = function() {
        if (typeof this.items !== 'undefined') {
            this.items.filter('.keSlider__item--clone').remove();
        }
    };

    keSlider.prototype.cloneItem = function(index, before) {
        var clonedItem = this.originalItems.eq(index).clone();
        clonedItem.addClass('keSlider__item--clone');
        if (before) {
            this.itemsWrapper.prepend(clonedItem);
        } else {
            this.itemsWrapper.append(clonedItem);
        }
    };

    keSlider.prototype.wrapItems = function() {
        this.originalItems.wrapAll('<div class="keSlider__items-wrapper" />');
        this.itemsWrapper = this.container.find('.keSlider__items-wrapper');

        this.itemsWrapper.wrap('<div class="keSlider__wrapper" />');
        this.wrapper = this.container.find('.keSlider__wrapper');
    };

    keSlider.prototype.setItemsWidth = function() {
        var _this = this;
        this.slideWidth = this.containerWidth / this.options.perSlide;

        this.items.each(function() {
            var item = $(this);

            item.css('width', _this.slideWidth);
        });
    };

    keSlider.prototype.setWrapperWidth = function() {
        this.wrapperWidth = (this.containerWidth / this.options.perSlide) * this.items.length;

        this.itemsWrapper.css('width', this.wrapperWidth);
    };
    
    keSlider.prototype.getMaxHeight = function() {
        this.resetHeights();
        var maxHeight = 0;

        this.items.each(function() {
            var item = $(this);

            maxHeight = Math.max(maxHeight, item.height());
        });

        this.maxHeight = maxHeight;
    };

    keSlider.prototype.resetHeights = function() {
        this.wrapper.height('');
        this.itemsWrapper.height('');
        this.items.height('');
    };

    keSlider.prototype.setHeights = function() {
        this.getMaxHeight();

        this.wrapper.height(this.maxHeight);
        this.itemsWrapper.height(this.maxHeight);
        this.items.height(this.maxHeight);
    };

    keSlider.prototype.moveTo = function(event, index, moveTime) {
        var _this = this;
        if (this.options.arrows) {
            this.disableArrows();
        }
        if (this.options.navigation) {
            this.disableNavigation();
        }
        if (this.options.autoPlay) {
            this.stopAutoMove();
        }
        if (index > this.originalItems.length + this.options.perMove + (this.options.perSlide - this.options.perMove)) {
            index = this.originalItems.length + this.options.perMove + (this.options.perSlide - this.options.perMove);
        } else if (this.activeSlide > index && index < this.options.perSlide && this.activeSlide > this.options.perSlide) {
            index = this.options.perSlide;
        }
        var position = index * (this.containerWidth / this.options.perSlide) * -1;

        if (index >= 0 && index < this.items.length) {
            if (moveTime === 0) {
                this.animateSlide(this.itemsWrapper, position, true);
                this.activeSlide = index;
                if (this.options.arrows) {
                    this.activeArrows();
                }
                if (this.options.navigation) {
                    this.setCurrentNavigation();
                    this.activeNavigation();
                }
                if (this.options.autoPlay) {
                    this.startAutoMove();
                }
            } else {
                this.animateSlide(this.itemsWrapper, position, false, moveTime, function () {
                    _this.activeSlide = index;
                    if (_this.options.arrows) {
                        _this.activeArrows();
                    }
                    if (_this.options.navigation) {
                        _this.setCurrentNavigation();
                        _this.activeNavigation();
                    }
                    if (_this.options.autoPlay) {
                        _this.startAutoMove();
                    }

                    if (_this.items.eq(index).hasClass('keSlider__item--clone')) {
                        if (index - _this.originalItems.length >= _this.options.perSlide) {
                            _this.moveTo(null, index - _this.originalItems.length, 0);
                        } else {
                            _this.moveTo(null, index + _this.originalItems.length, 0);
                        }
                    }
                });
            }
        }
    };

    keSlider.prototype.animateSlide = function(element, position, instant, timespeed, cb) {
        var currentPosition = parseFloat(this._getTransform(element)[0]);
        var distance = position - currentPosition;
        this.animationStartTime = null;

        if (instant) {
            element.css('transform', 'translate3d(' + position + 'px, 0, 0)');

            if (typeof cb !== 'undefined') {
                cb.call(this);
            }
        } else {
            if (typeof timespeed === 'undefined' || timespeed === null) {
                timespeed = this.options.animationTime;
            }
            requestAnimationFrame(this.renderAnimation.bind(this, element, currentPosition, distance, timespeed, cb));
        }
    };

    keSlider.prototype.renderAnimation = function(element, originalPosition, distance, timespeed, cb, time) {
        if (!this.animationStartTime) {
            this.animationStartTime = time;
        }

        var progressTime = time - this.animationStartTime;
        var timePassed = progressTime / timespeed;
        if (timePassed > 1) {
            timePassed = 1;
        }

        var newPosition = (distance * timePassed) + originalPosition;

        element.css('transform', 'translate3d(' + newPosition + 'px, 0, 0)');

        if (timePassed < 1) {
            requestAnimationFrame(this.renderAnimation.bind(this, element, originalPosition, distance, timespeed, cb));
        } else {
            this.animationStartTime = null;

            if (typeof cb !== 'undefined') {
                cb.call(this);
            }
        }
    };

    keSlider.prototype.nextSlide = function() {
        this.moveTo(null, this.activeSlide +  this.options.perMove, this.options.animationStartTime);
    };

    keSlider.prototype.prevSlide = function() {
        this.moveTo(null, this.activeSlide -  this.options.perMove, this.options.animationStartTime);
    };

    keSlider.prototype.createControlsWrapper = function() {
        if (typeof this.controlsWrapper === 'undefined') {
            this.controlsWrapper = $('<div class="keSlider__controls" />');

            this.container.append(this.controlsWrapper);
        }
    };

    keSlider.prototype.arrows = function() {
        if (typeof this.arrowLeft === 'undefined' || this.arrowLeft === null) {
            this.clickPrevSlide = function (event) {
                event.preventDefault();

                this.prevSlide();
            }.bind(this);
            this.clickNextSlide = function (event) {
                event.preventDefault();

                this.nextSlide();
            }.bind(this);

            this.createArrows();
            this.activeArrows();
        }
    };

    keSlider.prototype.createArrows = function() {
        this.createControlsWrapper();

        this.arrowLeft = $('<button class="keSlider__arrow keSlider__arrow--left">Prev</button>');
        this.arrowRight = $('<button class="keSlider__arrow keSlider__arrow--right">Next</button>');

        var arrowsContrainer = $('<div class="keSlider__arrows-container" />');
        arrowsContrainer.append(this.arrowLeft).append(this.arrowRight);

        this.controlsWrapper.append(arrowsContrainer);
    };

    keSlider.prototype.deleteArrows = function() {
        if (typeof this.arrowLeft !== 'undefined' && this.arrowLeft !== null) {
            this.disableArrows();

            this.arrowLeft = null;
            this.arrowRight = null;
            this.controlsWrapper.find('.keSlider__arrows-container').remove();
        }
    };

    keSlider.prototype.activeArrows = function() {
        this.arrowLeft.on('click', this.clickPrevSlide);
        this.arrowRight.on('click', this.clickNextSlide);
    };

    keSlider.prototype.disableArrows = function() {
        this.arrowLeft.off('click', this.clickPrevSlide);
        this.arrowRight.off('click', this.clickNextSlide);
    };

    keSlider.prototype.navigations = function() {
        if (typeof this.navigation === 'undefined' || this.navigation === null) {
            var _this = this;
            this.activeNavigationClick = function (event) {
                event.preventDefault();

                var link = $(this);
                var navigationIndex = link.parent().index() * _this.options.perMove;
                if (_this.options.carousel) {
                    navigationIndex = navigationIndex + _this.options.perSlide;
                }

                if (navigationIndex !== _this.activeSlide) {
                    _this.moveTo(null, navigationIndex, _this.options.animationStartTime);
                }
            };

            this.createNavigation();
            this.activeNavigation();
            if (!this.options.carousel) {
                this.setCurrentNavigation();
            }
        }
    };

    keSlider.prototype.createNavigation = function() {
        this.createControlsWrapper();

        var navigationsWrapper = $('<div class="keSlider__navigations-wrapper" />');
        this.navigation = $('<ul class="keSlider__navigations" />');

        for(var i = 0; i < this.originalItems.length / this.options.perMove; i++) {
            var navItem = $('<li class="keSlider__navigation-item"><a href="#" class="keSlider__navigation-link" /></li>');
            this.navigation.append(navItem);
        }

        navigationsWrapper.append(this.navigation);
        this.controlsWrapper.append(navigationsWrapper);
    };

    keSlider.prototype.deleteNavigation = function() {
        if (typeof this.navigation !== 'undefined' && this.navigation !== null) {
            this.disableNavigation();

            this.navigation.remove();
            this.navigation = null;
        }
    };

    keSlider.prototype.activeNavigation = function() {
        this.controlsWrapper.find('.keSlider__navigation-link').on('click', this.activeNavigationClick);
    };

    keSlider.prototype.disableNavigation = function() {
        this.controlsWrapper.find('.keSlider__navigation-link').off('click', this.activeNavigationClick);
    };

    keSlider.prototype.setCurrentNavigation = function() {
        var activeSlide = Math.ceil(this.activeSlide / this.options.perMove);
        if (this.options.carousel) {
            activeSlide = (this.activeSlide - this.options.perSlide) / this.options.perMove;
        }
        activeSlide = parseInt(activeSlide);

        this.navigation.find('a').removeClass('keSlider__navigation-link--active');
        this.navigation.find('li').eq(activeSlide).find('a').addClass('keSlider__navigation-link--active');
    };

    keSlider.prototype.initTouch = function() {
        if (typeof this.onMouseDown === 'undefined' || this.onMouseDown === null) {
            this.touchX = null;
            this.originalTouchX = null;
            this.onMouseDown = this._onMouseDown.bind(this);
            this.onMouseMove = this._onMouseMove.bind(this);
            this.onMouseUp = this._onMouseUp.bind(this);

            this.wrapper.on('mousedown touchstart', this.onMouseDown);
        }
    };

    keSlider.prototype.deleteTouch = function() {
        if (typeof this.onMouseDown !== 'undefined' && this.onMouseDown !== null) {
            this.wrapper.off('mousedown touchstart', this.onMouseDown);

            this.onMouseDown = null;
            this.onMouseMove = null;
            this.onMouseUp = null;
        }
    };

    keSlider.prototype._onMouseDown = function(event) {
        event.preventDefault();

        this.activeSlidePosition = this.items[this.activeSlide].getBoundingClientRect().left;

        this.wrapper
            .on('mousemove touchmove', this.onMouseMove)
            .on('mouseup mouseleave touchend', this.onMouseUp);

        if (event.type === 'touchstart') {
            this.originalTouchX = event.originalEvent.targetTouches[0].clientX;
            this.touchX = this.originalTouchX;
        } else {
            this.originalTouchX = event.clientX;
            this.touchX = this.originalTouchX;
        }

        this.currentSliderPosition = parseFloat(this._getTransform(this.itemsWrapper)[0]);
    };

    keSlider.prototype._onMouseMove = function(event) {
        event.preventDefault();

        if (event.type === 'touchmove') {
            this.touchX = event.originalEvent.targetTouches[0].clientX;
        } else {
            this.touchX = event.clientX;
        }

        this.touchSliderMove(false);
    };

    keSlider.prototype._onMouseUp = function(event) {
        event.preventDefault();

        if (event.type != 'touchend') {
            this.touchX = event.clientX;
        }

        this.wrapper
            .off('mousemove touchmove', this.onMouseMove)
            .off('mouseup mouseleave touchend', this.onMouseUp);

        this.touchSliderMove(true);
    };

    keSlider.prototype.touchSliderMove = function(autoAlign) {
        this.touchMoveX = this.originalTouchX - this.touchX;
        var newPosition = this.currentSliderPosition - this.touchMoveX;

        if (newPosition < 0 && Math.abs(newPosition) < (this.wrapperWidth - this.windowWidth)) {
            this.itemsWrapper.css('transform', 'translate3d(' + newPosition + 'px, 0, 0)');
        }

        if (autoAlign) {
            var activeSlideCurrentPosition = this.items[this.activeSlide].getBoundingClientRect().left;
            var slideMoved = this.activeSlidePosition - activeSlideCurrentPosition;
            var changeSlideMove = (this.slideWidth * this.options.changeSlidePosition) / 100;

            if (slideMoved > changeSlideMove) {
                this.nextSlide();
            } else if (slideMoved < (changeSlideMove * -1)) {
                this.prevSlide();
            } else {
                this.moveTo(null, this.activeSlide, 100);
            }
        }
    };

    keSlider.prototype.startAutoMove = function() {
        clearInterval(this.autoChange);
        this.autoChange = setInterval(this.nextSlide.bind(this), this.options.autoDelay);
    };

    keSlider.prototype.stopAutoMove = function() {
        clearInterval(this.autoChange);
    };

    keSlider.prototype._getTransform = function(element) {
        var results = element.css('transform').match(/matrix(?:(3d)\(-{0,1}\d+\.?\d*(?:, -{0,1}\d+\.?\d*)*(?:, (-{0,1}\d+\.?\d*))(?:, (-{0,1}\d+\.?\d*))(?:, (-{0,1}\d+\.?\d*)), -{0,1}\d+\.?\d*\)|\(-{0,1}\d+\.?\d*(?:, -{0,1}\d+\.?\d*)*(?:, (-{0,1}\d+\.?\d*))(?:, (-{0,1}\d+\.?\d*))\))/);

        if(!results) return [0, 0, 0];
        if(results[1] == '3d') return results.slice(2,5);

        results.push(0);
        return results.slice(5, 8);
    };

    $.fn.keSlider = function (options) {
        return this.each(function () {
            new keSlider(this, options);
        });
    };

})(jQuery, window, document);