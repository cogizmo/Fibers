"use strict";

/*
 * Will need to add progress indicators.
 * Loop = very fast (< 2s)
 * Circle = fast (< 10s)
 * Bar = Medium to Slow (10s+)
 */
const Namespace = require('../class/Namespace');
const CoGizmo = new Namespace();

CoGizmo.addClass(require('../class/Base'));
CoGizmo.addClass(Namespace);

module.exports = CoGizmo;