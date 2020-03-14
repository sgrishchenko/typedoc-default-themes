/// <reference types='backbone' />
/// <reference types='underscore' />
/// <reference path='../Application.ts' />
/// <reference path='../services/Viewport.ts' />

namespace typedoc
{
    /**
     * Stored element and position data of a single anchor.
     */
    interface IAnchorInfo
    {
        /**
         * jQuery instance of the anchor tag.
         */
        anchor?: HTMLElement;

        /**
         * jQuery instance of the link in the navigation representing this anchor.
         */
        link?: HTMLElement;

        /**
         * The vertical offset of the anchor on the page.
         */
        position: number;
    }


    /**
     * Manages the sticky state of the navigation and moves the highlight
     * to the current navigation item.
     */
    export class MenuHighlight extends Backbone.View<any>
    {
        /**
         * List of all discovered anchors.
         */
        private anchors:IAnchorInfo[] = [];

        /**
         * Index of the currently highlighted anchor.
         */
        private index:number = 0;


        /**
         * Create a new MenuHighlight instance.
         *
         * @param options  Backbone view constructor options.
         */
        constructor(options:Backbone.ViewOptions<any>) {
            super(options);

            this.listenTo(viewport, 'resize', this.onResize);
            this.listenTo(viewport, 'scroll', this.onScroll);

            this.createAnchors();
        }


        /**
         * Find all anchors on the current page.
         */
        private createAnchors() {
            this.index = 0;
            this.anchors = [{
                position: 0
            }];

            var base = window.location.href;
            if (base.indexOf('#') != -1) {
                base = base.substr(0, base.indexOf('#'));
            }

            const el: HTMLElement = this.el;
            el.querySelectorAll('a').forEach(el => {
                var href = el.href;
                if (href.indexOf('#') == -1) return;
                if (href.substr(0, base.length) != base) return;

                var hash = href.substr(href.indexOf('#') + 1);
                var anchor = document.querySelector<HTMLElement>('a.tsd-anchor[name=' + hash + ']');
                var link = el.parentNode;
                if (!anchor || !link) return;

                this.anchors.push({
                    link:    link as HTMLElement,
                    anchor:  anchor,
                    position: 0
                });
            });

            this.onResize();
        }


        /**
         * Triggered after the viewport was resized.
         */
        private onResize() {
            var anchor: IAnchorInfo;
            for (var index = 1, count = this.anchors.length; index < count; index++) {
                anchor = this.anchors[index];
                const rect = anchor.anchor!.getBoundingClientRect();
                anchor.position = Math.max(0, rect.top + document.body.scrollTop);
            }

            this.anchors.sort((a, b) => {
                return a.position - b.position;
            });

            this.onScroll(viewport.scrollTop);
        }


        /**
         * Triggered after the viewport was scrolled.
         *
         * @param scrollTop  The current vertical scroll position.
         */
        private onScroll(scrollTop:number) {
            var anchors  = this.anchors;
            var index    = this.index;
            var count    = anchors.length - 1;

            scrollTop += 5;
            while (index > 0 && anchors[index].position > scrollTop) {
                index -= 1;
            }

            while (index < count && anchors[index + 1].position < scrollTop) {
                index += 1;
            }

            if (this.index != index) {
                if (this.index > 0) this.anchors[this.index].link!.classList.remove('focus');
                this.index = index;
                if (this.index > 0) this.anchors[this.index].link!.classList.add('focus');
            }
        }
    }


    /**
     * Register this component.
     */
    registerComponent(MenuHighlight, '.menu-highlight');
}
