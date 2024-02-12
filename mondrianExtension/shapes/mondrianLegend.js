/**
 * Class: mxMondrianLegend
 * Extends <mxShape> to implement shapes that provide a legend that is compliant with the Mondrian Design Method
 */
function mxMondrianLegend(bounds, fill, stroke, strokewidth)
{
	mxShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
};

mxUtils.extend(mxMondrianLegend, mxShape);

mxMondrianLegend.legendPadding = 8;
mxMondrianLegend.legendItemHeight = 16;
mxMondrianLegend.legendTitelbar = 32;

mxMondrianLegend.prototype.cst = 
{
		MONDRIAN_LEGEND_SHAPE : 'mxgraph.mondrian.legend',
		MONDRIAN_LEGEND_STYLE : 'Material',
		LEGEND_COLOR : 'legendColor',
		LEGEND_COLOR_DEFAULT : 'gray:white:white'	
};

mxMondrianLegend.prototype.customProperties = [
	{name: 'legendColor', dispName: 'Color (Background)', type: 'enum', defVal: 'gray:white:white',
	enumList:[
		{val:'gray:white:white', dispName: 'Text: Gray'},
		{val:'black:white:white', dispName: 'Text: Black'},
		{val:'gray:gray:white', dispName: 'Text & Line: Gray'},
		{val:'black:black:white', dispName: 'Text & Line: Black'},
	]},
	{name: 'legendLayout', dispName: 'Layout', type: 'enum', defVal: 'horizontal',
		enumList: [
			{val: 'horizontal', dispName: 'Horizontal'}, {val: 'vertical', dispName: 'Vertical'}, 
			{val: 'horizontalTB', dispName: 'Horizontal (with Title)'}, {val: 'verticalTB', dispName: 'Vertical (with Title)'}],
		onChange: function(graph, newValue)
		{
			let isHorizontal = (newValue == 'horizontal' || newValue == 'horizontalTB');
			let showTitle = (newValue == 'verticalTB' || newValue == 'horizontalTB');;
			let graphScale = graph.view.scale;
			let marginTop = (showTitle) ? mxMondrianLegend.legendTitelbar : mxMondrianLegend.legendPadding;

			let selectedCells = graph.getSelectionCells();

			//determine geometry
			for (let i = 0; i < selectedCells.length; i++)
			{
				let geo = graph.getCellGeometry(selectedCells[i]);
				let minParentWidth = 2 * mxMondrianLegend.legendPadding;
				let minParentHeight = marginTop;

				let childCells = graph.getChildCells(selectedCells[i], true, false);
				for (let j = 0; j < childCells.length; j++)
				{
					minParentWidth = Math.max(minParentWidth, graph.getCellBounds(childCells[j],true,false).width / graphScale + mxMondrianLegend.legendPadding + marginTop);
					minParentHeight = Math.max(minParentHeight, graph.getCellBounds(childCells[j],true,false).height / graphScale + mxMondrianLegend.legendPadding + marginTop);
				}
				geo.width = minParentWidth;
				geo.height = minParentHeight;
				graph.getModel().setGeometry(selectedCells[i], geo);
			}
			
			//set the styles
			graph.setCellStyles('stackFill', isHorizontal ? 0 : 1, selectedCells);
			graph.setCellStyles('horizontalStack', isHorizontal ? 1 : 0, selectedCells);
			graph.setCellStyles('noLabel', showTitle ? 0 : 1, selectedCells);
			graph.setCellStyles('marginTop', marginTop, selectedCells);
		}
	}
];

mxMondrianLegend.prototype.init = function(container)
{
	let mondrianAttributes = ['Legend-Title'];
	for (attributeIndex = 0; attributeIndex < mondrianAttributes.length; attributeIndex++ ) {
		if(!this.state.cell.hasAttribute(mondrianAttributes[attributeIndex]))
		{
			this.state.cell.setAttribute(mondrianAttributes[attributeIndex],'')
		}
	}
	mxShape.prototype.init.apply(this, arguments); 
};

/**
 * Function: redraw
 *
 * Reconfigures this shape. This will update the attributees of the Shape.
 */
 mxMondrianLegend.prototype.redraw = function()
 {
	let childCells = this.state.cell.children;
	let legendDimensions = mxMondrianLegend.prototype.getDimensions(childCells, mxUtils.getValue(this.style, 'legendLayout', 'verticalTB'));
	let geo = this.state.cell.geometry;
	geo.width = legendDimensions.width;
	geo.height = legendDimensions.height;
	this.state.view.graph.model.setGeometry(this.state.cell, geo);

	mxShape.prototype.redraw.apply(this, arguments);
 };

mxMondrianLegend.prototype.paintVertexShape = function(c, x, y, w, h)
{	
	const CORE = window.MONDRIAN_CORE;
	const INTENSITY = CORE.CONFIG.COLOR.INTENSITY;

	let legendColor = mxUtils.getValue(this.style, 
		mxMondrianLegend.prototype.cst.LEGEND_COLOR, mxMondrianLegend.prototype.cst.LEGEND_COLOR_DEFAULT).split(':');

	let textColor = CORE.getColor(legendColor[0], INTENSITY.MEDIUM);
	let strokeColor = CORE.getColor(legendColor[1], INTENSITY.MEDIUM);
	let fillColor = CORE.getColor(legendColor[2], INTENSITY.MEDIUM);

	c.translate(x, y);
	c.setFillColor(fillColor);
	c.setStrokeColor(strokeColor);
	c.rect(0, 0, w, h);
	c.fillAndStroke();

	const standardBlack = CORE.getColor('black', INTENSITY.MEDIUM);
	const standardGray = CORE.getColor('gray', INTENSITY.MEDIUM);

	fontColor = this.style.fontColor;
	if(fontColor != textColor && (fontColor === standardBlack || fontColor === standardGray || fontColor === 'undefined'))
	{
		this.style.fontColor = textColor;
		styleCurrent = this.state.view.graph.model.getStyle(this.state.cell);
		newStyle = mxUtils.setStyle(styleCurrent, 'fontColor', this.style.fontColor);
		this.state.view.graph.model.setStyle(this.state.cell, newStyle);
	}
};

mxMondrianLegend.prototype.getDimensions = function(childCells, legendLayout)
{
	let isHorizontal = (legendLayout == 'horizontal' || legendLayout == 'horizontalTB');
	let showTitle = (legendLayout == 'verticalTB' || legendLayout == 'horizontalTB');;
	let marginTop = (showTitle) ? mxMondrianLegend.legendTitelbar : mxMondrianLegend.legendPadding;

	const minWidth = 64;
	const minHeight = (showTitle) ? mxMondrianLegend.legendTitelbar + mxMondrianLegend.legendItemHeight + 2 * mxMondrianLegend.legendPadding : mxMondrianLegend.legendItemHeight + 2 * mxMondrianLegend.legendPadding; 

	let width = 2 * mxMondrianLegend.legendPadding;
	let height = marginTop;

	if(childCells != null)
	{
		for (let j = 0; j < childCells.length; j++)
		{
			if(isHorizontal)
			{
				width = width + childCells[j].geometry.width + mxMondrianLegend.legendPadding;
				height = minHeight;//Math.max(height, childCells[j].geometry.height + marginTop + mxMondrianLegend.legendPadding);	
			}
			else
			{
				width = Math.max(width, childCells[j].geometry.width + 2 * mxMondrianLegend.legendPadding);
				height = height + childCells[j].geometry.height + mxMondrianLegend.legendPadding;	
			}
		}	
	}

	width = Math.max(width, minWidth);
	height = Math.max(height, minHeight);

	return {width, height};
};

mxMondrianLegend.prototype.getLabelBounds = function(rect)
{
	const legendPadding = 8;
	const legendTitleHeight = 16;
	return new mxRectangle(
					rect.x + legendPadding * this.scale, 
					rect.y + legendPadding * this.scale,
					rect.width -  (2* legendPadding * this.scale),
					legendTitleHeight * this.scale);
};

/**
 * Mondrian Design Method shape registration
 */
mxCellRenderer.registerShape(mxMondrianLegend.prototype.cst.MONDRIAN_LEGEND_SHAPE, mxMondrianLegend);