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
        });
    }

    keSlider.prototype.defaults = {
        carousel: false,
        arrows: true,
        navigation: true
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
        this.cloneItem(0, false);
        this.cloneItem(this.originalItems.length - 1, true);

        this.items = this.itemsWrapper.find('.keSlider__item');

        this.moveTo(null, 1, true);
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

        this.items.each(function() {
            var item = $(this);

            item.width(_this.containerWidth);
        });
    };

    keSlider.prototype.setWrapperWidth = function() {
        var wrapperWidth = this.containerWidth * this.items.length;

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
        var position = index * this.containerWidth * -1;

        if (index >= 0 && index < this.items.length) {
            if (instant) {
                this.itemsWrapper.css('left', position);
                this.activeSlide = index;
                if (this.options.navigation) {
                    this.setCurrentNavigation();
                }
            } else {
                this.itemsWrapper.animate({
                    left: position
                }, function () {
                    _this.activeSlide = index;
                    _this.setCurrentNavigation();

                    if (index > _this.originalItems.length) {
                        _this.moveTo(null, 1, true);
                    } else if (index < 1) {
                        _this.moveTo(null, _this.originalItems.length, true);
                    }
                });
            }
        }
    };

    keSlider.prototype.nextSlide = function() {
        this.moveTo(null, this.activeSlide + 1);
    };

    keSlider.prototype.prevSlide = function() {
        this.moveTo(null, this.activeSlide - 1);
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
        this.setCurrentNavigation();
    };

    keSlider.prototype.createNavigation = function() {
        this.createControlsWrapper();

        var navigationsWrapper = $('<div class="keSlider__navigations-wrapper" />');
        this.navigation = $('<ul class="keSlider__navigations" />');

        for(var i = 0; i < this.originalItems.length; i++) {
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
            var navigationIndex = link.parent().index();
            if (_this.options.carousel) {
                navigationIndex++;
            }

            if (navigationIndex !== _this.activeSlide) {
                _this.moveTo(null, navigationIndex);
            }
        });
    };

    keSlider.prototype.setCurrentNavigation = function() {
        var activeSlide = this.activeSlide;
        if (this.options.carousel) {
            activeSlide = this.activeSlide - 1;
        }
        this.navigation.find('a').removeClass('keSlider__navigation-link--active');
        this.navigation.find('li').eq(activeSlide).find('a').addClass('keSlider__navigation-link--active');
    };

    $.fn.keSlider = function (options) {
        return this.each(function () {
            new keSlider(this, options);
        });
    };

})(jQuery, window, document);