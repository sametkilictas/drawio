/**
 * Class: mxMondrianBasicShape
 * Extends <mxMondrianShape> to implement Shapes that behave similar to mxMondrianShape, with a few exceptions
 */

function mxMondrianBasicShape(bounds, fill, stroke, strokewidth)
{
	mxMondrianShape.call(this, bounds, fill, stroke, strokewidth);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
};

/**
 * Extends mxShape.
 */
mxUtils.extend(mxMondrianBasicShape, mxMondrianShape);

mxMondrianBasicShape.prototype.cst = {
	MONDRIAN_BASIC_SHAPE : 'mxgraph.mondrian.basicShape'
}

/**
 * Function: init
 *
 * Initializes the shape and the <indicator>.
 */
mxMondrianBasicShape.prototype.init = function(container)
{
	mxMondrianShape.prototype.init.apply(this, arguments);
};

mxCellRenderer.registerShape(mxMondrianBasicShape.prototype.cst.MONDRIAN_BASIC_SHAPE, mxMondrianBasicShape);