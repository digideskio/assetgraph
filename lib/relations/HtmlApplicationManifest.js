var util = require('util'),
    extendWithGettersAndSetters = require('../util/extendWithGettersAndSetters'),
    HtmlRelation = require('./HtmlRelation');

/* Models application manifests.
 *
 * See following resources for further details
 *
 * - https://developers.google.com/web/updates/2014/11/Support-for-installable-web-apps-with-webapp-manifest-in-chrome-38-for-Android
 * - https://developer.chrome.com/multidevice/android/installtohomescreen
 */

function HtmlApplicationManifest(config) {
    HtmlRelation.call(this, config);
}

util.inherits(HtmlApplicationManifest, HtmlRelation);

extendWithGettersAndSetters(HtmlApplicationManifest.prototype, {
    get href() {
        return this.node.getAttribute('href');
    },

    set href(href) {
        this.node.setAttribute('href', href);
    },

    attach: function (asset, position, adjacentRelation) {
        this.node = asset.parseTree.createElement('link');
        this.node.setAttribute('rel', 'manifest');
        this.attachNodeBeforeOrAfter(position, adjacentRelation);
        return HtmlRelation.prototype.attach.call(this, asset, position, adjacentRelation);
    }
});

module.exports = HtmlApplicationManifest;
