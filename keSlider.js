;(function ($, window, document) {
    "use strict";

    function keSlider(container, options) {
        var _this = this;

        this.container = $(container);
        this.originalItems = this.container.find('.keSlider__item');
        this.containerWidth = this.container.width();
        this.options = {};
        $.extend(this.options, this.defaults, options);

        this.init();

        $(window).resize(function() {
            _this.containerWidth = _this.container.width();

            _this.setItemsWidth();
            _this.setWrapperWidth();
            _this.setHeights();
            _this.moveTo(null, _this.activeSlide, true);
        });
    }

    keSlider.prototype.defaults = {
        carousel: false,
        arrows: true,
        navigation: true,
        perSlide: 1,
        perMove: 1,
        animationTime: 400
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
                        _this.initSlider();
                    }
                };
            });
        } else {
            this.initSlider();
        }
    };

    keSlider.prototype.initSlider = function() {
        this.activeSlide = 0;

        if (this.options.arrows) {
            this.arrows();
        }
        if (this.options.navigation) {
            this.navigations();
        }

        this.wrapItems();
        if (this.options.carousel) {
            this.cloneItems();
        } else {
            this.items = this.originalItems;
        }
        this.setItemsWidth();
        this.setWrapperWidth();
        this.setHeights();

        this.container.on('keSlider.moveTo', this.moveTo.bind(this));
        this.container.on('keSlider.nextSlide', this.nextSlide.bind(this));
        this.container.on('keSlider.prevSlide', this.prevSlide.bind(this));
    };
    
    keSlider.prototype.cloneItems = function() {
        for(var i = 0; i < this.options.perSlide; i++) {
            this.cloneItem(i, false);
        }
        for(var j = this.originalItems.length - 1; j > this.originalItems.length - 1 - this.options.perSlide; j--) {
            this.cloneItem(j, true);
        }

        this.items = this.itemsWrapper.find('.keSlider__item');

        this.moveTo(null, this.options.perSlide, true);
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
        var slideWidth = this.containerWidth / this.options.perSlide;

        this.items.each(function() {
            var item = $(this);

            item.width(slideWidth);
        });
    };

    keSlider.prototype.setWrapperWidth = function() {
        var wrapperWidth = (this.containerWidth / this.options.perSlide) * this.items.length;

        this.itemsWrapper.width(wrapperWidth);
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

    keSlider.prototype.moveTo = function(event, index, instant) {
        var _this = this;
        if (index > this.originalItems.length + this.options.perMove + (this.options.perSlide - this.options.perMove)) {
            index = this.originalItems.length + this.options.perMove + (this.options.perSlide - this.options.perMove);
        } else if (this.activeSlide > index && index < this.options.perSlide && this.activeSlide > this.options.perSlide) {
            index = this.options.perSlide;
        }
        var position = index * (this.containerWidth / this.options.perSlide) * -1;

        if (index >= 0 && index < this.items.length) {
            if (instant) {
                this.animateSlide(this.itemsWrapper, position, true);
                this.activeSlide = index;
                if (this.options.navigation) {
                    this.setCurrentNavigation();
                }
            } else {
                this.animateSlide(this.itemsWrapper, position, false, function () {
                    _this.activeSlide = index;
                    _this.setCurrentNavigation();

                    if (_this.items.eq(index).hasClass('keSlider__item--clone')) {
                        if (index - _this.originalItems.length >= _this.options.perSlide) {
                            _this.moveTo(null, index - _this.originalItems.length, true);
                        } else {
                            _this.moveTo(null, index + _this.originalItems.length, true);
                        }
                    }
                });
            }
        }
    };

    keSlider.prototype.animateSlide = function(element, position, instant, cb) {
        var currentPosition = parseFloat(this._getTransform(element)[0]);
        var distance = position - currentPosition;
        this.animationStartTime = null;

        if (instant) {
            element.css('transform', 'translate3d(' + position + 'px, 0, 0)');

            if (typeof cb !== 'undefined') {
                cb.call(this);
            }
        } else {
            requestAnimationFrame(this.renderAnimation.bind(this, element, currentPosition, distance, cb));
        }
    };

    keSlider.prototype.renderAnimation = function(element, originalPosition, distance, cb, time) {
        if (!this.animationStartTime) {
            this.animationStartTime = time;
        }

        var progressTime = time - this.animationStartTime;
        var timePassed = progressTime / this.options.animationTime;
        if (timePassed > 1) {
            timePassed = 1;
        }

        var newPosition = (distance * timePassed) + originalPosition;

        element.css('transform', 'translate3d(' + newPosition + 'px, 0, 0)');

        if (timePassed < 1) {
            requestAnimationFrame(this.renderAnimation.bind(this, element, originalPosition, distance, cb));
        } else {
            this.animationStartTime = null;

            if (typeof cb !== 'undefined') {
                cb.call(this);
            }
        }
    };

    keSlider.prototype.nextSlide = function() {
        this.moveTo(null, this.activeSlide +  this.options.perMove);
    };

    keSlider.prototype.prevSlide = function() {
        this.moveTo(null, this.activeSlide -  this.options.perMove);
    };

    keSlider.prototype.createControlsWrapper = function() {
        if (typeof this.controlsWrapper === 'undefined') {
            this.controlsWrapper = $('<div class="keSlider__controls" />');

            this.container.append(this.controlsWrapper);
        }
    };

    keSlider.prototype.arrows = function() {
        this.createArrows();
        this.activeArrows();
    };

    keSlider.prototype.createArrows = function() {
        this.createControlsWrapper();

        this.arrowLeft = $('<button class="keSlider__arrow keSlider__arrow--left">Prev</button>');
        this.arrowRight = $('<button class="keSlider__arrow keSlider__arrow--right">Next</button>');

        var arrowsContrainer = $('<div class="keSlider__arrows-contrainer" />');
        arrowsContrainer.append(this.arrowLeft).append(this.arrowRight);

        this.controlsWrapper.append(arrowsContrainer);
    };

    keSlider.prototype.activeArrows = function() {
        this.arrowLeft.on('click', function(event) {
            event.preventDefault();

            this.prevSlide();
        }.bind(this));


        this.arrowRight.on('click', function(event) {
            event.preventDefault();

            this.nextSlide();
        }.bind(this));
    };

    keSlider.prototype.navigations = function() {
        this.createNavigation();
        this.activeNavigation();
        if (!this.options.carousel) {
            this.setCurrentNavigation();
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

    keSlider.prototype.activeNavigation = function() {
        var _this = this;
        this.controlsWrapper.find('.keSlider__navigation-link').click(function(event) {
            event.preventDefault();

            var link = $(this);
            var navigationIndex = link.parent().index() * _this.options.perMove;
            if (_this.options.carousel) {
                navigationIndex = navigationIndex + _this.options.perSlide;
            }

            if (navigationIndex !== _this.activeSlide) {
                _this.moveTo(null, navigationIndex);
            }
        });
    };

    keSlider.prototype.setCurrentNavigation = function() {
        var activeSlide = Math.ceil(this.activeSlide / this.options.perMove);
        if (this.options.carousel) {
            activeSlide = (this.activeSlide - this.options.perSlide) / this.options.perMove;
        }

        this.navigation.find('a').removeClass('keSlider__navigation-link--active');
        this.navigation.find('li').eq(activeSlide).find('a').addClass('keSlider__navigation-link--active');
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