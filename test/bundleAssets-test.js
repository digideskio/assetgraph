var vows = require('vows'),
    assert = require('assert'),
    AssetGraph = require('../lib/AssetGraph'),
    transforms = require('../lib/transforms');

vows.describe('Bundle stylesheets').addBatch({
    'After loading a test case with 1 HTML, 2 stylesheets, and 3 images': {
        topic: function () {
            new AssetGraph({root: __dirname + '/bundleAssets/singleHtml'}).transform(
                transforms.loadAssets('index.html'),
                transforms.populate(),
                this.callback
            );
        },
        'the graph contains 6 assets': function (assetGraph) {
            assert.equal(assetGraph.assets.length, 6);
        },
        'the graph contains 1 HTML asset': function (assetGraph) {
            assert.equal(assetGraph.findAssets({type: 'HTML'}).length, 1);
        },
        'the graph contains 3 PNG assets': function (assetGraph) {
            assert.equal(assetGraph.findAssets({type: 'PNG'}).length, 3);
        },
        'the graph contains 2 CSS assets': function (assetGraph) {
            assert.equal(assetGraph.findAssets({type: 'CSS'}).length, 2);
        },
        'the graph contains 2 HTMLStyle relations': function (assetGraph) {
            assert.equal(assetGraph.findRelations({type: 'HTMLStyle'}).length, 2);
        },
        'the graph contains 4 CSSBackgroundImage relations': function (assetGraph) {
            assert.equal(assetGraph.findRelations({type: 'CSSBackgroundImage'}).length, 4);
        },
        'then bundling the HTMLStyles': {
            topic: function (assetGraph) {
                assetGraph.transform(
                    transforms.bundleAssets({type: 'CSS'}),
                    this.callback
                );
            },
            'the number of HTMLStyles should be down to one': function (assetGraph) {
                assert.equal(assetGraph.findRelations({type: 'HTMLStyle'}).length, 1);
            },
            'there should be a single CSS': function (assetGraph) {
                assert.equal(assetGraph.findAssets({type: 'CSS'}).length, 1);
            },
            'all CSSBackgroundImage relations should be attached to the bundle': function (assetGraph) {
                var cssBackgroundImages = assetGraph.findRelations({type: 'CSSBackgroundImage'}),
                    bundle = assetGraph.findAssets({type: 'CSS'})[0];
                assert.equal(cssBackgroundImages.length, 4);
                cssBackgroundImages.forEach(function (cssBackgroundImage) {
                    assert.equal(cssBackgroundImage.from, bundle);
                });
            }
        }
    },
    'After loading a test case with two HTML assets that relate to some of the same CSS assets': {
        topic: function () {
            new AssetGraph({root: __dirname + '/bundleAssets/twoHtmls'}).transform(
                transforms.loadAssets('1.html', '2.html'),
                transforms.populate(),
                this.callback
            );
        },
        'the graph should contain 2 HTML assets': function (assetGraph) {
            assert.equal(assetGraph.findAssets({type: 'HTML'}).length, 2);
        },
        'the graph should contain 4 CSS assets': function (assetGraph) {
            assert.equal(assetGraph.findAssets({type: 'CSS'}).length, 4);
        },
        'then bundling the CSS assets': {
            topic: function (assetGraph) {
                assetGraph.transform(
                    transforms.bundleAssets({type: 'CSS'}),
                    this.callback
                );
            },
            'the graph should contain 3 CSS assets': function (assetGraph) {
                assert.equal(assetGraph.findAssets({type: 'CSS'}).length, 3);
            },
            'the CSS assets with a single relation pointing at them should remain unbundled': function (assetGraph) {
                assert.equal(assetGraph.findAssets({url: /\/a\.css$/}).length, 1);
                assert.equal(assetGraph.findAssets({url: /\/d\.css$/}).length, 1);
            },
            'the last CSS asset in the graph should contain the rules from b.css and c.css': function (assetGraph) {
                var cssAssets = assetGraph.findAssets({type: 'CSS'}),
                    cssRules = cssAssets[cssAssets.length - 1].parseTree.cssRules;
                assert.equal(cssRules.length, 2);
                assert.equal(cssRules[0].style.color, 'beige');
                assert.equal(cssRules[1].style.color, 'crimson');
            }
        }
    }
})['export'](module);
