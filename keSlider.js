;(function ($, window, document) {
    "use strict";

    function keSlider(container, options) {
        var _this = this;

        this.container = $(container);
        this.items = this.container.find('.keSlider__item');
        this.containerWidth = this.container.width();

        this.init();

        $(window).resize(function() {
            _this.containerWidth = _this.container.width();

            _this.setItemsWidth();
            _this.setWrapperWidth();
            _this.setHeights();
        });
    }

    keSlider.prototype.init = function() {
        var _this = this;
        var sliderImages = this.items.find('img');
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
        this.wrapItems();
        this.setItemsWidth();
        this.setWrapperWidth();
        this.setHeights();
        
        this.activeSlide = 0;
        
        this.container.on('moveTo', this.moveTo.bind(this));
        this.container.on('nextSlide', this.nextSlide.bind(this));
        this.container.on('prevSlide', this.prevSlide.bind(this));
    };

    keSlider.prototype.wrapItems = function() {
        this.items.wrapAll('<div class="keSlider__wrapper" />');
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

        this.wrapper.width(wrapperWidth);
    };
    
    keSlider.prototype.getMaxHeight = function() {
        var maxHeight = 0;

        this.items.each(function() {
            var item = $(this);

            maxHeight = Math.max(maxHeight, item.height());
        });

        this.maxHeight = maxHeight;
    };

    keSlider.prototype.setHeights = function() {
        this.getMaxHeight();

        this.container.height(this.maxHeight);
        this.wrapper.height(this.maxHeight);
        this.items.height(this.maxHeight);
    };

    keSlider.prototype.moveTo = function(event, index) {
        var _this = this;
        var position = index * this.containerWidth;

        if (index >= 0 && index < this.items.length) {
            if (index > this.activeSlide) {
                position = position * -1;
            }

            this.wrapper.animate({
                left: position
            }, function () {
                _this.activeSlide = index;
            });
        }
    };

    keSlider.prototype.nextSlide = function() {
        this.moveTo(null, this.activeSlide + 1);
    };

    keSlider.prototype.prevSlide = function() {
        this.moveTo(null, this.activeSlide - 1);
    };

    $.fn.keSlider = function (options) {
        return this.each(function () {
            new keSlider(this, options);
        });
    };

})(jQuery, window, document);