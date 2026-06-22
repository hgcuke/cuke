(function() {
    'use strict';

    function CustomScrollbar(element, options) {
        this.element = element;
        this.options = options || {};
        this.isVertical = this.options.vertical || false;
        this.isDragging = false;
        this.startPos = 0;
        this.startScroll = 0;
        this.init();
    }

    CustomScrollbar.prototype.init = function() {
        if (this.isVertical) {
            this.initVertical();
        } else {
            this.initHorizontal();
        }
    };

    CustomScrollbar.prototype.initHorizontal = function() {
        this.element.style.overflowX = 'auto';
        this.element.style.scrollbarWidth = 'none';
        this.element.style.msOverflowStyle = 'none';

        this.wrapper = document.createElement('div');
        this.wrapper.className = 'custom-scrollbar-wrapper';
        this.wrapper.style.cssText = 'position:relative;display:block;';

        this.element.parentNode.insertBefore(this.wrapper, this.element);
        this.wrapper.appendChild(this.element);

        this.track = document.createElement('div');
        this.track.className = 'custom-scrollbar-track';
        this.track.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 6px;
            cursor: default;
            opacity: 0;
            transition: opacity 0.2s;
        `;

        this.thumb = document.createElement('div');
        this.thumb.className = 'custom-scrollbar-thumb';
        this.thumb.style.cssText = `
            position: absolute;
            height: 100%;
            cursor: default;
            min-width: 30px;
        `;

        this.track.appendChild(this.thumb);
        this.wrapper.appendChild(this.track);

        this.bindEvents();
        this.updateThumb();
        this.checkScrollable();
    };

    CustomScrollbar.prototype.initVertical = function() {
        this.track = document.createElement('div');
        this.track.className = 'page-scrollbar-track';
        this.track.id = 'page-scrollbar-track';

        this.thumb = document.createElement('div');
        this.thumb.className = 'page-scrollbar-thumb';
        this.thumb.id = 'page-scrollbar-thumb';

        this.track.appendChild(this.thumb);
        document.body.appendChild(this.track);

        var self = this;
        setTimeout(function() {
            self.updateVerticalThumb();
        }, 0);

        this.bindVerticalEvents();
    };

    CustomScrollbar.prototype.bindEvents = function() {
        var self = this;
        var isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        this.element.addEventListener('scroll', function() {
            self.updateThumb();
        }, { passive: true });

        if (!isTouch) {
            this.wrapper.addEventListener('mouseenter', function() {
                if (self.element.scrollWidth > self.element.clientWidth) {
                    self.track.style.opacity = '1';
                }
            });

            this.wrapper.addEventListener('mouseleave', function() {
                if (!self.isDragging) {
                    self.track.style.opacity = '0';
                }
            });
        } else {
            this.track.style.height = '6px';
            this.thumb.style.minWidth = '40px';
            this.track.style.opacity = '1';
        }

        this.thumb.addEventListener('mousedown', function(e) {
            self.startDrag(e.clientX);
            e.preventDefault();
        });

        this.track.addEventListener('mousedown', function(e) {
            if (e.target === self.thumb) return;
            var rect = self.track.getBoundingClientRect();
            var ratio = (e.clientX - rect.left) / rect.width;
            self.element.scrollLeft = ratio * (self.element.scrollWidth - self.element.clientWidth);
        });

        this.thumb.addEventListener('touchstart', function(e) {
            self.startDrag(e.touches[0].clientX);
            e.preventDefault();
        }, { passive: false });

        this.track.addEventListener('touchstart', function(e) {
            if (e.target === self.thumb) return;
            var rect = self.track.getBoundingClientRect();
            var ratio = (e.touches[0].clientX - rect.left) / rect.width;
            self.element.scrollLeft = ratio * (self.element.scrollWidth - self.element.clientWidth);
        });

        document.addEventListener('mousemove', function(e) {
            if (!self.isDragging) return;
            self.onDrag(e.clientX);
        });

        document.addEventListener('touchmove', function(e) {
            if (!self.isDragging) return;
            self.onDrag(e.touches[0].clientX);
            e.preventDefault();
        }, { passive: false });

        document.addEventListener('mouseup', function() {
            self.endDrag();
        });

        document.addEventListener('touchend', function() {
            self.endDrag();
        });

        window.addEventListener('resize', function() {
            self.updateThumb();
            self.checkScrollable();
        });
    };

    CustomScrollbar.prototype.startDrag = function(clientPos) {
        this.isDragging = true;
        this.startPos = clientPos;
        this.startScroll = this.isVertical ? (window.scrollY || window.pageYOffset || document.documentElement.scrollTop) : this.element.scrollLeft;
        this.thumb.style.cursor = 'default';
    };

    CustomScrollbar.prototype.onDrag = function(clientPos) {
        if (this.isVertical) {
            var deltaY = clientPos - this.startPos;
            var trackHeight = window.innerHeight;
            var thumbHeight = parseInt(this.thumb.style.height) || 30;
            var maxThumbPos = trackHeight - thumbHeight;
            var ratio = deltaY / maxThumbPos;
            var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            window.scrollTo(0, this.startScroll + ratio * maxScroll);
        } else {
            var deltaX = clientPos - this.startPos;
            var ratio = deltaX / this.track.clientWidth;
            this.element.scrollLeft = this.startScroll + ratio * this.element.scrollWidth;
        }
    };

    CustomScrollbar.prototype.endDrag = function() {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.thumb.style.cursor = 'default';
        var isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (!isTouch && this.wrapper && !this.wrapper.matches(':hover')) {
            this.track.style.opacity = '0';
        }
    };

    CustomScrollbar.prototype.updateThumb = function() {
        if (this.isVertical) {
            this.updateVerticalThumb();
        } else {
            this.updateHorizontalThumb();
        }
    };

    CustomScrollbar.prototype.updateHorizontalThumb = function() {
        var scrollWidth = this.element.scrollWidth;
        var clientWidth = this.element.clientWidth;
        var scrollLeft = this.element.scrollLeft;

        if (scrollWidth <= clientWidth) {
            this.thumb.style.width = '0';
            return;
        }

        var ratio = clientWidth / scrollWidth;
        var thumbWidth = Math.max(ratio * this.track.clientWidth, 30);
        this.thumb.style.width = thumbWidth + 'px';

        var maxScroll = scrollWidth - clientWidth;
        var scrollRatio = maxScroll > 0 ? scrollLeft / maxScroll : 0;
        var maxThumbPos = this.track.clientWidth - thumbWidth;
        this.thumb.style.left = (scrollRatio * maxThumbPos) + 'px';
    };

    CustomScrollbar.prototype.updateVerticalThumb = function() {
        var scrollHeight = document.documentElement.scrollHeight;
        var clientHeight = window.innerHeight;
        var scrollTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;

        if (scrollHeight <= clientHeight) {
            this.thumb.style.height = '0';
            this.track.style.opacity = '0';
            return;
        }

        this.track.style.opacity = '1';
        var ratio = clientHeight / scrollHeight;
        var trackHeight = window.innerHeight;
        var thumbHeight = Math.max(ratio * trackHeight, 30);
        this.thumb.style.height = thumbHeight + 'px';

        var maxScroll = scrollHeight - clientHeight;
        var scrollRatio = maxScroll > 0 ? scrollTop / maxScroll : 0;
        var maxThumbPos = trackHeight - thumbHeight;
        this.thumb.style.top = (scrollRatio * maxThumbPos) + 'px';
    };

    CustomScrollbar.prototype.checkScrollable = function() {
        if (this.isVertical) return;
        if (this.element.scrollWidth <= this.element.clientWidth) {
            this.track.style.display = 'none';
        } else {
            this.track.style.display = 'block';
        }
    };

    CustomScrollbar.prototype.bindVerticalEvents = function() {
        var self = this;
        var isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        window.addEventListener('scroll', function() {
            self.updateVerticalThumb();
        }, { passive: true });

        this.thumb.addEventListener('mousedown', function(e) {
            self.startDrag(e.clientY);
            e.preventDefault();
        });

        this.track.addEventListener('mousedown', function(e) {
            if (e.target === self.thumb) return;
            var rect = self.track.getBoundingClientRect();
            var ratio = (e.clientY - rect.top) / rect.height;
            var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            window.scrollTo(0, ratio * maxScroll);
        });

        this.thumb.addEventListener('touchstart', function(e) {
            self.startDrag(e.touches[0].clientY);
            e.preventDefault();
        }, { passive: false });

        this.track.addEventListener('touchstart', function(e) {
            if (e.target === self.thumb) return;
            var rect = self.track.getBoundingClientRect();
            var ratio = (e.touches[0].clientY - rect.top) / rect.height;
            var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            window.scrollTo(0, ratio * maxScroll);
        });

        document.addEventListener('mousemove', function(e) {
            if (!self.isDragging) return;
            self.onDrag(e.clientY);
        });

        document.addEventListener('touchmove', function(e) {
            if (!self.isDragging) return;
            self.onDrag(e.touches[0].clientY);
            e.preventDefault();
        }, { passive: false });

        document.addEventListener('mouseup', function() {
            self.endDrag();
        });

        document.addEventListener('touchend', function() {
            self.endDrag();
        });

        window.addEventListener('resize', function() {
            self.updateVerticalThumb();
        });
    };

    function initCustomScrollbars() {
        var codeBlocks = document.querySelectorAll('.content pre');

        codeBlocks.forEach(function(pre) {
            if (pre._customScrollbar) return;
            pre._customScrollbar = new CustomScrollbar(pre);
        });

        if (!window._pageScrollbar) {
            window._pageScrollbar = new CustomScrollbar(document.documentElement, { vertical: true });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCustomScrollbars);
    } else {
        initCustomScrollbars();
    }
})();
