/**
 * Copyright (c) 2020, Merijn Weiss
 **/

/**
 * Class: mxMondrianBase
 *
 * Extends <mxShape> to implement shapes that are compliant with the Mondrian Design Method
 * 
 * Constructor: mxMondrianBase
 * 
 * Parameters:
 * 
 * bounds - <mxRectangle> that defines the bounds. This is stored in
 * <mxShape.bounds>.
 * fill - String that defines the fill color. This is stored in <fill>.
 * stroke - String that defines the stroke color. This is stored in <stroke>.
 * strokewidth - Optional integer that defines the stroke width. Default is 1
**/
function mxMondrianBase(bounds, fill, stroke, strokewidth)
{
	mxShape.call(this, bounds, fill, stroke, strokewidth);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
};

/**
 * Extends mxShape.
 */
mxUtils.extend(mxMondrianBase, mxShape);

mxMondrianBase.prototype.cst = {
	MONDRIAN_BASE_SHAPE : 'mxgraph.mondrian.base',
	MONDRIAN_BASE_STYLE : 'Material',
	MONDRIAN_BASE_STENCIL_REGISTRY : 'mondrianbase.',
	MONDRIAN_ICONS_STENCIL_REGISTRY : 'mondrianicons.',

	SHAPE_TYPE : 'shapeType',
	SHAPE_TYPE_DEFAULT : 'pn',
	SHAPE_LAYOUT : 'shapeLayout',
	SHAPE_LAYOUT_DEFAULT : 'expanded',
	SHAPE_STYLE : 'shapeStyle',
	SHAPE_STYLE_DEFAULT : 'solid',

	SHAPE_MULTIPLICITY : 'shapeMultiplicity',
	SHAPE_MULTIPLICITY_DEFAULT : false,

	ICON_IMAGE : 'iconImage',
	ICON_IMAGE_DEFAULT : 'stencilIcon',

	COLOR_FAMILY : 'colorFamily',
	COLOR_FAMILY_DEFAULT : 'blue',
	COLOR_FILL_ICON : 'colorFillIcon', 
	COLOR_FILL_ICON_DEFAULT : 'medium', 
	COLOR_FILL_BACKGROUND : 'colorBackground',
	COLOR_FILL_BACKGROUND_DEFAULT : 'noColor:noColor',
	
	POSITION_TEXT : 'positionText', 
	POSITION_TEXT_DEFAULT : 'bottom',

	FORMAT_TEXT : 'formatText', 
	ATTRIBUTES_TEXT : 'attributesText', 

	TAG : 'tag',
	TAG_DEFAULT : 'noTag',
	TAG_TEXT : 'tagText',
	TAG_TEXT_DEFAULT : 'Tag-Text',
	TAG_COLOR_FAMILY : 'tagColorFamily',
	TAG_COLOR_FAMILY_DEFAULT : 'black',
	TAG_COLOR_FILL : 'tagColorFill', 
	TAG_COLOR_FILL_DEFAULT : 'medium', 
};

mxMondrianBase.prototype.getColor = function(colorPalette, colorFamily, colorIntensity) {
	switch(colorFamily)
	{
		case 'noColor':
			return 'none';
		case 'white':
			return '#ffffff';
	}

	switch(colorIntensity) 
	{
		case mxMondrianBase.prototype.colorIntensity.NO_COLOR:
			return 'none';
		case mxMondrianBase.prototype.colorIntensity.WHITE:
			return '#ffffff';
		case mxMondrianBase.prototype.colorIntensity.VERY_LIGHT:
		case mxMondrianBase.prototype.colorIntensity.LIGHT:
			return this.getSelectedColorSpecification(colorPalette, colorFamily)[mxMondrianBase.prototype.colorIntensity.LIGHT];
		case mxMondrianBase.prototype.colorIntensity.MEDIUM:
			return this.getSelectedColorSpecification(colorPalette, colorFamily)[mxMondrianBase.prototype.colorIntensity.MEDIUM];
		case mxMondrianBase.prototype.colorIntensity.DARK:
			return this.getSelectedColorSpecification(colorPalette, colorFamily)[mxMondrianBase.prototype.colorIntensity.DARK];
	}
}

mxMondrianBase.prototype.CONFIG = {
	STYLE: 'Mondrian',
	TAG_FONT : 'Roboto Mono',
	// Material Design Definitions https://material.io/design/color/the-color-system.html#tools-for-picking-colors
	COLOR_PALETTE: {
		red: {light: '#FFEBEE', medium: '#E53935', dark: '#B71C1C'},        //50, 600, 900
		magenta: {light: '#FCE4EC', medium: '#D81B60', dark: '#880E4F'},	//Pink
		purple: {light: '#F3E5F5', medium: '#8E24AA', dark: '#4A148C'},
		cyan: {light: '#E0F7FA', medium: '#00ACC1', dark: '#006064'},
		blue: {light: '#E3F2FD', medium: '#1E88E5', dark: '#0D47A1'},
		teal: {light: '#E0F2F1', medium: '#00897B', dark: '#004D40'},
		green: {light: '#E8F5E9', medium: '#43A047', dark: '#1B5E20'},
		yellow: {light: '#FFFDE7', medium: '#FDD835', dark: '#F57F17'},
		orange: {light: '#FFF3E0', medium: '#FB8C00', dark: '#E65100'},
		gray: {light: '#ECEFF1', medium: '#546E7A', dark: '#263238'},       //Blue Gray
		black: {light: '#ECEFF1', medium: '#000000', dark: '#000000'}
	}
}

mxMondrianBase.prototype.getSelectedColorSpecification = function(colorPalette, colorFamily) {
	if(colorPalette.hasOwnProperty(colorFamily))
		return colorPalette[colorFamily];
	else
		return {light: '#f2f4f8', medium: '#000000', dark: '#000000'}
}

mxMondrianBase.prototype.isDarkColor = function(color,colorIntensity)
{
	if(color === '#000000') // black
		return true;
	else if(color === '#ffffff') // white
		return false;
	else
		return (colorIntensity === mxMondrianBase.prototype.colorIntensity.MEDIUM || colorIntensity === mxMondrianBase.prototype.colorIntensity.DARK);
}

mxMondrianBase.prototype.colorIntensity = {
	NO_COLOR: 'noColor',
	WHITE: 'white',
	VERY_LIGHT: 'veryLight',
	LIGHT: 'light',
	MEDIUM: 'medium',
	DARK: 'dark'
}

mxMondrianBase.prototype.getTagText = function(thisShape)
{
	let tagTextAttribute = mxUtils.getValue(thisShape.style, mxMondrianBase.prototype.cst.TAG_TEXT, mxMondrianBase.prototype.cst.TAG_TEXT_DEFAULT);

	return (tagTextAttribute === 'noText') ? null : thisShape.state.cell.getAttribute(tagTextAttribute,null)
}

mxMondrianBase.prototype.getColorIntensity = function(colorIntensity, shapePart, shapeType)
{
	if((shapeType === 'pg' || shapeType === 'lg') && shapePart === 'corner')
	{
		return mxMondrianBase.prototype.colorIntensity.NO_COLOR;
	}
	else if(shapePart === 'outerLine' || shapePart === 'tagLine')
	{
		switch(colorIntensity) 
		{
			case mxMondrianBase.prototype.colorIntensity.DARK:
				return mxMondrianBase.prototype.colorIntensity.DARK;
			default:
				return mxMondrianBase.prototype.colorIntensity.MEDIUM;
		}
	}
	else if(colorIntensity == mxMondrianBase.prototype.colorIntensity.VERY_LIGHT)
	{
		return mxMondrianBase.prototype.colorIntensity.LIGHT
	}
	else
	{
		return colorIntensity;
	}
}

mxMondrianBase.prototype.getShapeDimensions = function (shapeType, shapeLayout, shapeSubLayout, width, height)
{
		let minRectWidth = 0;
		let minRectHeight = 0;

		let titleBarHeight = 0;
		let lableBoundOffsetLeft = 0;
		
		let shapeWidth = width;
		let shapeHeight = height;
		let shapeRadius = (shapeType === 'ts' || shapeType === 'actor') ? 24 : 8;
		let shapeLeftOffSet = (shapeType === 'ts' && shapeLayout === 'legend') ? -2 : 0;
		
		let decoratorComponentWidth = 8;
		let decoratorComponentHeight = 4;
		let decoratorComponentOffset = -4;

		let multiplicitySpacing = 4;
		let secondLineOffSet = 3;

		let iconSize = 20;
		let iconSpacing = 14;

		let cornerWidth = 0;
		let barWidth = 0;
		let barHeight = 0;

		if(shapeLayout === 'collapsed')
		{
			minRectWidth = (shapeType === 'ts') ? 64 : 48;
			minRectHeight = 48;

			titleBarHeight = 16;
			lableBoundOffsetLeft = 0;

			cornerWidth = minRectWidth;
		}
		else if(shapeLayout === 'expanded')
		{
			minRectWidth = (shapeType === 'actor') ? 48 : 96;
			minRectHeight = 48;//(shapeType === 'lg' || shapeType === 'pg') ? 64 : 48;
			
			titleBarHeight = 48;
			lableBoundOffsetLeft = null; // depends on other settings
			
			if(shapeType === 'lg' || shapeType === 'pg')
				cornerWidth = 1*iconSpacing + iconSize
			else if (shapeType === 'ts')
				cornerWidth = 1*iconSpacing + iconSize - 4;
			else
				cornerWidth = 2*iconSpacing + iconSize;


			barWidth = 4;
			barHeight = 48;
		}
		else if(shapeLayout === 'legend')
		{
			minRectWidth = 64;
			minRectHeight = 16;

			if(shapeType === 'legendBaseItem')
			{
				shapeWidth = 32;
				lableBoundOffsetLeft = 40;
			}
			else if(shapeType === 'ts')
			{
				shapeWidth = 20;
				lableBoundOffsetLeft = 24;
			}
			else
			{
				shapeWidth = 16;
				lableBoundOffsetLeft = 24;
			}
				
			titleBarHeight = 16;
			shapeHeight = 16;
			shapeRadius = (shapeType === 'ts' || shapeType === 'actor') ? 8 : 4;

			cornerWidth = shapeWidth;

			barWidth = 2;
			barHeight = 12;

			decoratorComponentWidth = 4;
			decoratorComponentHeight = 2;
			decoratorComponentOffset = -2;

			multiplicitySpacing = 2;
			secondLineOffSet = 2;

			iconSize = 16;
			iconSpacing = 0;
		}

		return {
			minRectWidth, minRectHeight, 
			shapeWidth, shapeHeight, shapeRadius, shapeLeftOffSet,
			cornerWidth, barWidth, barHeight,
			titleBarHeight, lableBoundOffsetLeft,
			decoratorComponentWidth, decoratorComponentHeight, decoratorComponentOffset,
			multiplicitySpacing, secondLineOffSet,
			iconSize, iconSpacing
		};
	}

// The ShapeVisualDefinition contains all properties that define color of various parts of the Shape
mxMondrianBase.prototype.getShapeVisualDefinition = function (
							thisShape,
							shapeType, shapeLayout, shapeSubLayout, shapeStyle, shapeMultiplicity, width, height,
							colorFamily, colorFillIcon, colorFillText, colorFillContainer,
							iconImage) {	
	// basic colors
	const WHITE = '#ffffff';
	const BLACK = '#000000';

	// VD properties
	let shapeVD = {
		config: thisShape.CONFIG,
		shape: {visible:false, type: shapeType, layout: shapeLayout, width: null, height: null, radius: null, leftOffSet: null},
		style: {type: shapeStyle, color: null},
		multiplicity: {visible: shapeMultiplicity, spacing: null},
		outerLine: {color: null, colorIntensity: null, dashed: (shapeStyle === 'dashed'), secondLine: (shapeStyle === 'double'), secondLineOffSet: null},
		bar: {visible: false, color: null, colorIntensity: null, width: null, height: null},
		corner: {visible: false, color: null, colorIntensity: null, width: null, height: null},
		icon: {visible: false, color: null, size: null, spacing: null, rotate: 0, flipH: false, flipV: false},
		titleBar: {visible: false, color: null,colorIntensity: null},
		text: {color: null, labelBoundsHeight: null, labelBoundsOffSetLeft: null},
		dividerLine: {visible: false, color: null, colorIntensity: null},
		container: {visible: false, color: null, colorIntensity: null},
		decorator: {component: {color: WHITE, width: null, height: null, offSet: null}},
		tag: {visible: false, shape: 'circle', fill: {color: null, colorIntensity: null}, line: {color: null, colorIntensity: null}, text: null, textColor: null},
	};

	// if the shape is set to legend some of the style properties get overridden
	shapeVD.shape.type = (shapeVD.shape.layout == 'legend' && (shapeSubLayout != 'shape' && shapeSubLayout != 'shapeAndStyle') && shapeSubLayout != 'icon') ? 'legendBaseItem': shapeVD.shape.type;
	
	if(shapeVD.shape.type === 'legendBaseItem' || shapeSubLayout === 'shape')
	{
		if(shapeSubLayout === 'color' || shapeSubLayout === 'shape')
		{
			shapeVD.style.type = 'solid';
			shapeVD.outerLine.dashed = false;
			shapeVD.outerLine.secondLine = false;
			shapeVD.multiplicity.visible = false;
		}

		if(shapeSubLayout === 'color')
		{
			colorFillIcon = (colorFillIcon === 'medium' || colorFillIcon === 'dark') ? colorFillIcon : 'medium';
		}
		else if(shapeSubLayout === 'shape' || shapeSubLayout === 'style')
		{
			colorFamily = 'gray';
			colorFillIcon = 'noColor';
		}		
	}
	
	//shape
	shapeVD.shape.visible = (shapeLayout === 'expanded' || shapeLayout === 'collapsed' || (shapeLayout === 'legend' && (shapeSubLayout != 'tag' && shapeSubLayout != 'icon')));

	//shape dimensions
	let dimensions = mxMondrianBase.prototype.getShapeDimensions(shapeVD.shape.type, shapeLayout, shapeSubLayout, width, height);
	shapeVD.shape.width = dimensions.shapeWidth;
	shapeVD.shape.height = dimensions.shapeHeight;
	shapeVD.shape.radius = dimensions.shapeRadius;
	shapeVD.shape.leftOffSet = dimensions.shapeLeftOffSet;

	//outerLine
	shapeVD.outerLine.colorIntensity = this.getColorIntensity(colorFillIcon, 'outerLine', shapeVD.shape.type);
	shapeVD.outerLine.secondLineOffSet = dimensions.secondLineOffSet;

	shapeVD.multiplicity.spacing = dimensions.multiplicitySpacing;

	//titleBar
	shapeVD.titleBar.visible = (shapeVD.shape.visible && shapeLayout === 'expanded' && colorFillText != 'noColor');
	if(shapeVD.shape.type === 'ts')
		shapeVD.titleBar.colorIntensity = this.getColorIntensity(colorFillIcon, 'corner', shapeVD.shape.type);
	else
		shapeVD.titleBar.colorIntensity = this.getColorIntensity(colorFillText, 'titleBar', shapeVD.shape.type);

	// icon
	shapeVD.icon.visible = (shapeLayout === 'expanded' || shapeLayout === 'collapsed' || (shapeLayout === 'legend' && shapeSubLayout === 'icon')) && (iconImage != 'noIcon');
	shapeVD.icon.size = dimensions.iconSize;
	shapeVD.icon.spacing = dimensions.iconSpacing;

	switch(iconImage)
	{
		case 'stencilIcon_Rotate90':
			shapeVD.icon.rotate = 90;
			break;
		case 'stencilIcon_Rotate180':
			shapeVD.icon.rotate = 180;
			break;
		case 'stencilIcon_Rotate270':
			shapeVD.icon.rotate = 270;
			break;
		case 'stencilIcon_FlipH':
			shapeVD.icon.flipH = true;
			break;
		case 'stencilIcon_FlipV':
			shapeVD.icon.flipV = true;
			break;				
		}

	//bar & corner
	shapeVD.corner.colorIntensity = this.getColorIntensity(colorFillIcon, 'corner', shapeVD.shape.type);;
	shapeVD.corner.visible = shapeVD.shape.visible && (shapeVD.icon.visible || shapeVD.corner.colorIntensity != 'noColor');
	shapeVD.corner.width = (shapeVD.corner.visible) ? dimensions.cornerWidth : 0;
	shapeVD.corner.height = dimensions.minRectHeight;

	shapeVD.bar.colorIntensity = shapeVD.outerLine.colorIntensity; 
	shapeVD.bar.visible = (shapeVD.shape.type === 'pg' || shapeVD.shape.type === 'lg') && ((colorFillIcon != 'noColor') || (shapeVD.shape.layout == 'legend' && shapeSubLayout === 'shape')); // color fill is a workaround to enable hiding the bar
	shapeVD.bar.width = (shapeVD.bar.visible) ? dimensions.barWidth : 0;
	shapeVD.bar.height = dimensions.barHeight;

	//container
	shapeVD.container.visible = shapeVD.shape.visible && (shapeVD.shape.layout === 'expanded') && (shapeVD.shape.height - dimensions.titleBarHeight > 0);
	shapeVD.container.colorIntensity = this.getColorIntensity(colorFillContainer, 'container', shapeVD.shape.type);

	//dividerLine
	shapeVD.dividerLine.visible = false;//shapeVD.container.visible && (shapeVD.shape.type !== 'pg' && shapeVD.shape.type != 'lg');
	shapeVD.dividerLine.colorIntensity = 'undefined';

	// Get the HEX values for each Shape part
	shapeVD.outerLine.color = this.getColor(shapeVD.config.COLOR_PALETTE, colorFamily, shapeVD.outerLine.colorIntensity);
	shapeVD.bar.color = this.getColor(shapeVD.config.COLOR_PALETTE, colorFamily, shapeVD.bar.colorIntensity);
	shapeVD.corner.color = this.getColor(shapeVD.config.COLOR_PALETTE, colorFamily, shapeVD.corner.colorIntensity);
	shapeVD.titleBar.color = this.getColor(shapeVD.config.COLOR_PALETTE, colorFamily, shapeVD.titleBar.colorIntensity);
	shapeVD.dividerLine.color = this.getColor(shapeVD.config.COLOR_PALETTE, colorFamily, shapeVD.dividerLine.colorIntensity);
	shapeVD.container.color = this.getColor(shapeVD.config.COLOR_PALETTE, colorFamily, shapeVD.container.colorIntensity);

	shapeVD.icon.color = (this.isDarkColor(shapeVD.corner.color, shapeVD.corner.colorIntensity)) && shapeVD.corner.visible ?  WHITE : BLACK;

	if(shapeLayout === 'collapsed' || shapeLayout === 'legend')
	{
		shapeVD.text.color = BLACK;
		shapeVD.text.labelBoundsOffSetLeft = dimensions.lableBoundOffsetLeft;
		shapeVD.style.color = (this.isDarkColor(shapeVD.corner.color, shapeVD.corner.colorIntensity)) ?  WHITE : shapeVD.outerLine.color;

		if(shapeVD.outerLine.dashed)
			shapeVD.outerLine.secondLine = (this.isDarkColor(shapeVD.corner.color, shapeVD.corner.colorIntensity));
	}
	else if (shapeLayout === 'expanded')
	{
		shapeVD.text.color = (this.isDarkColor(shapeVD.titleBar.color, shapeVD.titleBar.colorIntensity)) ?  WHITE : BLACK;
		shapeVD.text.labelBoundsOffSetLeft = shapeVD.corner.width;
		shapeVD.style.color = shapeVD.outerLine.color;

		if(shapeVD.shape.type === 'ts')
		{
			if(shapeVD.style.type === 'strikethrough')
				shapeVD.style.color = (this.isDarkColor(shapeVD.corner.color, shapeVD.corner.colorIntensity)) ?  WHITE : shapeVD.outerLine.color;
			else if(shapeVD.outerLine.dashed)
				shapeVD.outerLine.secondLine = (this.isDarkColor(shapeVD.corner.color, shapeVD.corner.colorIntensity));

			shapeVD.text.labelBoundsOffSetLeft = (shapeVD.icon.visible) ? shapeVD.text.labelBoundsOffSetLeft : 0;
		}
	}

	shapeVD.text.labelBoundsHeight = dimensions.titleBarHeight;

	shapeVD.decorator.component.color = WHITE;
	shapeVD.decorator.component.width = dimensions.decoratorComponentWidth;
	shapeVD.decorator.component.height = dimensions.decoratorComponentHeight;
	shapeVD.decorator.component.offSet = dimensions.decoratorComponentOffset;

	//  tag
	shapeVD.tag.shape = mxUtils.getValue(thisShape.style, mxMondrianBase.prototype.cst.TAG, mxMondrianBase.prototype.cst.TAG_DEFAULT);
	shapeVD.tag.visible = (shapeLayout === 'expanded' || shapeLayout === 'collapsed' || (shapeLayout === 'legend' && shapeSubLayout === 'tag')) && (shapeVD.tag.shape != 'noTag');
	if(shapeVD.tag.visible)
	{
		let tagColorFamily = mxUtils.getValue(thisShape.style, mxMondrianBase.prototype.cst.TAG_COLOR_FAMILY, mxMondrianBase.prototype.cst.TAG_COLOR_FAMILY_DEFAULT);
		let tagColorFill = mxUtils.getValue(thisShape.style, mxMondrianBase.prototype.cst.TAG_COLOR_FILL, mxMondrianBase.prototype.cst.TAG_COLOR_FILL_DEFAULT);
		let tagColorLine = (tagColorFill == mxMondrianBase.prototype.colorIntensity.DARK || tagColorFill == mxMondrianBase.prototype.colorIntensity.MEDIUM) ? tagColorFill : colorFillIcon;

		shapeVD.tag.fill.colorIntensity = this.getColorIntensity(tagColorFill, 'tag', shapeVD.shape.type);
		shapeVD.tag.fill.color = this.getColor(shapeVD.config.COLOR_PALETTE, tagColorFamily, shapeVD.tag.fill.colorIntensity);

		shapeVD.tag.line.colorIntensity = this.getColorIntensity(tagColorLine, 'tagLine', shapeVD.shape.type);
		shapeVD.tag.line.color = this.getColor(shapeVD.config.COLOR_PALETTE, tagColorFamily, shapeVD.tag.line.colorIntensity);

		//shapeVD.tag.text = thisShape.state.cell.getAttribute('Tag-Text',null);
		shapeVD.tag.text = this.getTagText(thisShape);
		shapeVD.tag.textColor = (this.isDarkColor(shapeVD.tag.fill.color, shapeVD.tag.fill.colorIntensity)) ?  WHITE : BLACK;
	}

	return shapeVD;
};

mxMondrianBase.prototype.customProperties = [
	{name:'shapeType', dispName:'Shape', type:'enum', defVal:'pn',
		enumList:[{val:'actor', dispName: 'Actor'}, {val:'ts', dispName: 'Target System'}, {val:'ln', dispName: 'Logical Node'}, {val:'lc', dispName: 'Logical Component'}, {val:'lg', dispName: 'Logical Group'}, {val:'pn', dispName: 'Prescribed Node'}, {val:'pc', dispName: 'Prescribed Component'}, {val:'pg', dispName: 'Prescribed Group'}]},
	{name:'shapeLayout', dispName:'Shape (Layout)', type:'enum', defVal:'expanded',
		enumList:[
			{val:'collapsed', dispName: 'Collapsed'},{val:'expanded', dispName: 'Expanded'},
			{val:'expanded:stackLayout', dispName: 'Expanded (Stack Layout)'},
			{val:'legend:color', dispName: 'Legend (Color)'}, {val:'legend:shape', dispName: 'Legend (Shape)'}, {val:'legend:style', dispName: 'Legend (Style)'},
			{val:'legend:icon', dispName: 'Legend (Icon)'}, {val:'legend:tag', dispName: 'Legend (Tag)'},
			{val:'legend:shapeAndStyle', dispName: 'Legend (Shape, Style & Color)'}],
			onChange: function(graph, newValue)
			{
				let selectedCells = graph.getSelectionCells();

				if(newValue == 'expanded:stackLayout')
				{
					graph.setCellStyles('container', 1, selectedCells);

					graph.setCellStyles('childLayout', 'stackLayout', selectedCells);
					graph.setCellStyles('stackFill', 1, selectedCells);
					graph.setCellStyles('horizontalStack', 0, selectedCells);
					graph.setCellStyles('marginTop', 64, selectedCells);
					graph.setCellStyles('marginLeft', 16, selectedCells);
					graph.setCellStyles('marginRight', 8, selectedCells);
					graph.setCellStyles('marginBottom', 8, selectedCells);
		
				}
				else
				{
					graph.setCellStyles('childLayout', null, selectedCells);
					graph.setCellStyles('stackFill', null, selectedCells);
					graph.setCellStyles('horizontalStack', null, selectedCells);
					graph.setCellStyles('marginTop', null, selectedCells);
					graph.setCellStyles('marginLeft', null, selectedCells);
					graph.setCellStyles('marginRight', null, selectedCells);
					graph.setCellStyles('marginBottom', null, selectedCells);
				}
			}
	},
	{name:'shapeStyle', dispName:'Shape (Style)', type:'enum', defVal:'solid',
		enumList:[{val:'solid', dispName: 'Solid'},{val:'strikethrough', dispName: 'Strikethrough'},{val:'double', dispName: 'Double'}, {val:'dashed', dispName: 'Dashed'}
	]},
	{name:'shapeMultiplicity', dispName: 'Multiplicity', type: 'bool', defVal: false},
	{name:'colorFamily', dispName:'Color', type:'enum', defVal:'blue',
		enumList:[{val:'blue', dispName: 'Blue'}, {val:'black', dispName: 'Black'}, {val:'cyan', dispName: 'Cyan'}, {val:'green', dispName: 'Green'}, {val:'gray', dispName: 'Gray'}, {val:'magenta', dispName: 'Magenta'}, {val:'purple', dispName: 'Purple'}, {val:'red', dispName: 'Red'}, {val:'teal', dispName: 'Teal'}, {val:'yellow', dispName: 'Yellow'}, {val:'orange', dispName: 'Orange'}]},
	{name:'colorFillIcon', dispName:'Color (Outline)', type:'enum', defVal:'medium',
		enumList:[{val:'noColor', dispName: 'None'}, {val:'light', dispName: 'Light'}, {val:'medium', dispName: 'Medium'}, {val:'dark', dispName: 'Dark'}]},
	
	{name:'colorBackground', dispName:'Color (Fill)', type:'enum', defVal:'noColor:noColor',
		enumList:[
		{val:'noColor:noColor', dispName: 'None'}, {val:'white:white', dispName: 'White'}, {val:'veryLight:veryLight', dispName: 'Very Light'},
		{val:'white:noColor', dispName: 'Bar: White, Body: None'},
		{val:'veryLight:noColor', dispName: 'Bar: Very Light, Body: None'},
		{val:'veryLight:white', dispName: 'Bar: Very Light, Body: White'}
	]},

	{name:'iconImage', dispName:'Icon', type:'enum', defVal:'stencilIcon',
		enumList:[{val:'noIcon', dispName: 'No'}, {val:'stencilIcon', dispName: 'Yes'}, 
		{val:'stencilIcon_Rotate90', dispName: 'Yes (Rotate 90)'}, {val:'stencilIcon_Rotate180', dispName: 'Yes (Rotate 180)'}, {val:'stencilIcon_Rotate270', dispName: 'Yes (Rotate 270)'},
		{val:'stencilIcon_FlipH', dispName: 'Yes (Flip Horizontal)'}, {val:'stencilIcon_FlipV', dispName: 'Yes (Flip Vertical)'},
		]},
	
	// Label
	{name:'formatText', dispName:'Label (Format)', type:'enum', defVal:'default:1,2',
		enumList:[
		{val:'nolabel', dispName: 'None'},
		{val:'default:1', dispName: 'Default: Attribute 1'},
		{val:'default:1,2', dispName: 'Default: Attribute 1 <> Attribute 2'},
		{val:'default:1,2,3', dispName: 'Default: Attribute 1 <> Attribute 2: Attribute 3'},
		{val:'custom', dispName: 'Custom'},
		],
		onChange: function(graph, newValue)
		{
			let selectedCells = graph.getSelectionCells();
			
			for (let i = 0; i < selectedCells.length; i++)
			{	
				let attributesText = mxMondrianBase.prototype.getStyleValue(selectedCells[i].style, mxMondrianBase.prototype.cst.ATTRIBUTES_TEXT);
				selectedCells[i].setAttribute('label', mxMondrianBase.prototype.defineLabel(newValue,attributesText,selectedCells[i]));
			}
		}
	},
	{name: 'attributesText', dispName: 'Label (Attributes)', type: 'staticArr', subType: 'dynamicEnum', size: '3', subDefVal: 'default',
		enumList:[{val:'noText', dispName: 'None'}, {val:'default', dispName: 'Default'}],
		onChange: function(graph, newValue)
		{
			let selectedCells = graph.getSelectionCells();
			
			for (let i = 0; i < selectedCells.length; i++)
			{			
				let formatText = mxMondrianBase.prototype.getStyleValue(selectedCells[i].style, mxMondrianBase.prototype.cst.FORMAT_TEXT);
				selectedCells[i].setAttribute('label', mxMondrianBase.prototype.defineLabel(formatText,newValue,selectedCells[i]));
			}
		}
	},
	{name:'positionText', dispName:'Label (Position)', type:'enum', defVal:'bottom',
		enumList:[{val:'bottom', dispName: 'Bottom'}, {val:'top', dispName: 'Top'}, {val:'left', dispName: 'Left'}, {val:'right', dispName: 'Right'}]},

	// Tag
	{name:'tag', dispName:'Tag', type:'enum', defVal:'noTag',
		enumList:[
		{val:'noTag', dispName: 'None'}, {val:'circle', dispName: 'Circle'}, {val:'diamond', dispName: 'Diamond'}, 
		{val:'square', dispName: 'Square'}, {val:'triangle', dispName: 'Triangle'}, {val:'hexagon', dispName: 'Hexagon'}, {val:'octagon', dispName: 'Octagon'}]},
	{name:'tagText', dispName:'Tag (Text)', type:'dynamicEnum', defVal:'Tag-Text',
		enumList:[{val:'noText', dispName: 'None'}]
	},
	{name:'tagColorFamily', dispName:'Tag (Color)', type:'enum', defVal:'black',
		enumList:[{val:'blue', dispName: 'Blue'}, {val:'black', dispName: 'Black'}, {val:'cyan', dispName: 'Cyan'}, {val:'green', dispName: 'Green'}, {val:'gray', dispName: 'Gray'}, {val:'magenta', dispName: 'Magenta'}, {val:'purple', dispName: 'Purple'}, {val:'red', dispName: 'Red'}, {val:'teal', dispName: 'Teal'}, {val:'yellow', dispName: 'Yellow'}, {val:'orange', dispName: 'Orange'}]},
	{name:'tagColorFill', dispName:'Tag (Fill)', type:'enum', defVal:'medium',
		enumList:[{val:'white', dispName: 'White'}, {val:'light', dispName: 'Light'}, {val:'medium', dispName: 'Medium'}, {val:'dark', dispName: 'Dark'}]},		
	];

/**
 * Variable: textSpacing
 *
 * Default value for text spacing. Default is 4.
 */
mxMondrianBase.prototype.textSpacing = 4;

/**
 * Variable: textSpacingLeft
 *
 * Default value for text spacing. Default is 16.
 */
 mxMondrianBase.prototype.textSpacingLeft = 16;

/**
 * Function: init
 *
 * Initializes the shape and the <indicator>.
 */
mxMondrianBase.prototype.init = function(container)
{
	if (!mxUtils.isNode(this.state.cell.value)) {
		let obj = mxUtils.createXmlDocument().createElement('UserObject');
		obj.setAttribute('label', this.state.cell.value);
		
		this.state.cell.value = obj;
	}

	let mondrianAttributes = ['Element-ID', 'Element-Name','Icon-Name','Tag-Text'];
	for (attributeIndex = 0; attributeIndex < mondrianAttributes.length; attributeIndex++ ) {
		if(!this.state.cell.hasAttribute(mondrianAttributes[attributeIndex]))
		{
			this.state.cell.setAttribute(mondrianAttributes[attributeIndex],'')
		}
	}

	mxMondrianBase.prototype.setAttributesFromRepo(this.state.cell);
	this.state.cell.setAttribute('label',
		mxMondrianBase.prototype.defineLabel(
			mxMondrianBase.prototype.getStyleValue(this.state.cell.style, mxMondrianBase.prototype.cst.FORMAT_TEXT),
			mxMondrianBase.prototype.getStyleValue(this.state.cell.style, mxMondrianBase.prototype.cst.ATTRIBUTES_TEXT),
			this.state.cell));

	mxShape.prototype.init.apply(this, arguments);

	this.templateConversion();

	this.cellID = this.state.cell.id;
	this.installListeners();
};

mxMondrianBase.prototype.defineLabel = function(formatText, attributesText, currentCell)
{
	let currentLabelValue = currentCell.getAttribute('label');
	currentCell.style = mxUtils.setStyle(currentCell.style, 'noLabel', (formatText === 'nolabel' ) ? 1 : 0);

	let elementDefaultSettings = Sidebar.prototype.mondrianRepo.getElement('defaultSettings');
	let labelFormats = elementDefaultSettings.labelFormats;
	let labelDefaults = elementDefaultSettings.labelDefaultAttributes;

	let attributes = (attributesText == 'undefined' || attributesText == undefined) ? labelDefaults : attributesText.split(',');
				
	let labelFormatFilter = (formatText == 'undefined' || formatText == undefined) ? elementDefaultSettings.labelDefaultFormat : formatText;
	let labelAttributes = [];

	for(let textAttributeIDX in attributes)
	{
		let textAttribute = attributes[textAttributeIDX];
		
		if(textAttribute == 'default')
			labelAttributes.push(labelDefaults[textAttributeIDX]);
		else if(textAttribute == 'noText')
			labelAttributes.push('');
		else
			labelAttributes.push(textAttribute);
	}

	let labelValue = (labelFormats[labelFormatFilter] != undefined) ? labelFormats[labelFormatFilter] : labelFormats['default'];

	for (let i = 0; i < labelAttributes.length; i++)
	{
		labelValue = labelValue.replace('@'+i,labelAttributes[i]);
		labelValue = labelValue.replace('%%','');
	}

	return (labelValue === 'CUSTOM') ? currentLabelValue : labelValue;
}

mxMondrianBase.prototype.setAttributesFromRepo = function(thisCell)
{
	let elementID = thisCell.getAttribute('Element-ID');
	if(Sidebar.prototype.mondrianRepo.hasElement(elementID))
	{
		let element = Sidebar.prototype.mondrianRepo.getElement(elementID);

		for (let attributeInRepo in element)
		{
			thisCell.setAttribute(attributeInRepo, element[attributeInRepo]);
		}
	}
}

/* temporary function to support coversion of old diagrams  */
mxMondrianBase.prototype.colorBackgroundConversion = function(colorFillText, colorFillContainer)
{
	colorFillText = (colorFillText == 'undefined') ? 'noColor' : colorFillText;
	colorFillContainer = (colorFillContainer == 'undefined') ? 'noColor' : colorFillContainer;

	if(colorFillContainer == 'veryLight')
		colorFillText = 'veryLight';
	else if(colorFillContainer == 'white' && colorFillText == 'noColor')
		colorFillText = 'white';

	return colorFillText + ':' + colorFillContainer;
}

// Function to convert diagrams if breaking changes have been introduced
mxMondrianBase.prototype.templateConversion = function()
{
	try {
		if(this.state != null)
		{

			if(this.state.cell.hasAttribute('Modifier-Text'))
			{
				this.state.cell.setAttribute('Tag-Text', this.state.cell.getAttribute('Modifier-Text',''));
				this.state.cell.getValue().removeAttribute('Modifier-Text');
			}

			let styleCurrent = null;
			let styleUpdate = false;
			let modifierUpdate = false;
			let colorBackgroundUpdate = false;
			let groupUpdate = false;
			let fontUpdate = false;
			let shapeUpdate = false;
		
			if(this.state.view.graph.model != null && this.state.cell != null)
				styleCurrent = this.state.view.graph.model.getStyle(this.state.cell);
		
			if(styleCurrent != null)
			{
				if (styleCurrent.indexOf('modifier') > 0)
				{
					styleUpdate = true;
					modifierUpdate = true;
				}
					
				if (styleCurrent.indexOf('colorFillText') > 0 || styleCurrent.indexOf('colorFillContainer') > 0)
				{
					styleUpdate = true;
					colorBackgroundUpdate = true;
				}

				if (this.state.style['shapeType'] == 'group')
				{
					styleUpdate = true;
					groupUpdate = true;
				}

				if	(styleCurrent.indexOf('fontSource') > 0 && this.state.style['fontSource'].startsWith('fonts%2F'))
				{
					styleUpdate = true;
					fontUpdate = true;
				}

				if	(this.state.style['shape'] === 'mxgraph.ibm2mondrian.base')
				{
					styleUpdate = true;
					shapeUpdate = true;
				}
			}
		
			if(styleUpdate)
			{
				newStyle = styleCurrent;
				// Modifier -> Tag
				if(modifierUpdate)
				{
					newStyle = newStyle.replace(/noModifier/g, 'noTag');
					newStyle = newStyle.replace(/modifier/g, 'tag');	
				}
				
				// Color Title Bar & Container -> Background
				this.state.view.graph.model.beginUpdate();
				try
				{
					if(modifierUpdate)
					{
						if(this.state.style['modifier'] != null)
							this.state.style['tag'] = this.state.style['modifier'].replace(/noModifier/g, 'noTag');

						if(this.state.style['modifierColorFamily'] != null)
							this.state.style['tagColorFamily'] = this.state.style['modifierColorFamily'];

						if(this.state.style['modifierColorFill'] != null)
							this.state.style['tagColorFill'] = this.state.style['modifierColorFill'];
					}

					if(colorBackgroundUpdate)
					{
						newStyle = mxUtils.setStyle(newStyle, 'colorBackground', mxMondrianBase.prototype.colorBackgroundConversion(this.state.style['colorFillText'], this.state.style['colorFillContainer']));
						this.state.style['colorBackground'] = mxMondrianBase.prototype.colorBackgroundConversion(this.state.style['colorFillText'], this.state.style['colorFillContainer']);

						newStyle = mxUtils.setStyle(newStyle, 'colorFillText', null);
						newStyle = mxUtils.setStyle(newStyle, 'colorFillContainer', null);
					}

					if(groupUpdate)
					{
						newStyle = mxUtils.setStyle(newStyle, 'shapeType', 'pg');
						this.state.style['shapeType'] = 'pg';
					}

					if(fontUpdate)
					{
						let newFontSource = 'mondrian%2F' + this.state.style['fontSource'];
						newStyle = mxUtils.setStyle(newStyle, 'fontSource', newFontSource);
						this.state.style['fontSource'] = newFontSource;
					}

					if(shapeUpdate)
					{
						newStyle = mxUtils.setStyle(newStyle, 'shape', 'mxgraph.mondrian.base');
						this.state.style['shape'] = 'mxgraph.mondrian.base';
					}

					this.state.view.graph.model.setStyle(this.state.cell, newStyle);
				}
				catch(err)
				{
					console.log(err);
				}
				finally
				{
					this.state.view.graph.model.endUpdate();
				}
			}			
		}			
	} catch (error) {
		console.log(error);
	}

}

mxMondrianBase.prototype.installListeners = function()
{
	if (this.changeListener == null)
	{
		this.changeListener = mxUtils.bind(this, function(sender, evt)
		{
			try
			{
				if(evt.properties.change.constructor.name === 'mxValueChange' && (evt.properties.change.cell.id === this.cellID))
				{
					mxMondrianBase.prototype.setAttributesFromRepo(this.state.cell);

					const currentIconAttribute = evt.properties.change.value.attributes.getNamedItem('Icon-Name');
					const previousIconAttribute = evt.properties.change.previous.attributes.getNamedItem('Icon-Name');
	
					const currentIconName = (currentIconAttribute != null) ? currentIconAttribute.value : null;
					const previousIconName = (previousIconAttribute != null) ?  previousIconAttribute.value : null;
					
					const currentCMTextAttribute = evt.properties.change.value.attributes.getNamedItem('Tag-Text');
					const previousCMTextAttribute = evt.properties.change.previous.attributes.getNamedItem('Tag-Text');
	
					const currentCMText = (currentCMTextAttribute != null) ? currentCMTextAttribute.value : null;
					const previousCMText = (previousCMTextAttribute != null) ?  previousCMTextAttribute.value : null;

					if(currentIconName != previousIconName || currentCMText != previousCMText)
						this.redraw();
				}
				else if(evt.properties.change.constructor.name === 'mxStyleChange' && (evt.properties.change.cell.id === this.cellID))
				{
					const styleCurrent = evt.properties.change.style;
					
					const isMondrianShape = (styleCurrent.indexOf(mxMondrianBase.prototype.cst.MONDRIAN_BASE_SHAPE) > 0);
					if(isMondrianShape)
					{
						const stylePrevious = evt.properties.change.previous;
	
						const shapeTypeCurrent = mxMondrianBase.prototype.getStyleValue(styleCurrent, mxMondrianBase.prototype.cst.SHAPE_TYPE);
						const shapeTypePrevious = mxMondrianBase.prototype.getStyleValue(stylePrevious, mxMondrianBase.prototype.cst.SHAPE_TYPE);
	
						var shapeLayoutCurrent = mxMondrianBase.prototype.getStyleValue(styleCurrent, mxMondrianBase.prototype.cst.SHAPE_LAYOUT).split(':')[0];
						const shapeLayoutPrevious = mxMondrianBase.prototype.getStyleValue(stylePrevious, mxMondrianBase.prototype.cst.SHAPE_LAYOUT).split(':')[0];

						const shapeSubLayoutCurrent = mxMondrianBase.prototype.getStyleValue(styleCurrent, mxMondrianBase.prototype.cst.SHAPE_LAYOUT).split(':')[1];
						const shapeSubLayoutPrevious = mxMondrianBase.prototype.getStyleValue(stylePrevious, mxMondrianBase.prototype.cst.SHAPE_LAYOUT).split(':')[1];

						const positionTextCurrent = mxMondrianBase.prototype.getStyleValue(styleCurrent, mxMondrianBase.prototype.cst.POSITION_TEXT);
						const positionTextPrevious = mxMondrianBase.prototype.getStyleValue(stylePrevious, mxMondrianBase.prototype.cst.POSITION_TEXT);
	
						const iconImageCurrent = mxMondrianBase.prototype.getStyleValue(styleCurrent, mxMondrianBase.prototype.cst.ICON_IMAGE);
						const iconImagePrevious = mxMondrianBase.prototype.getStyleValue(stylePrevious, mxMondrianBase.prototype.cst.ICON_IMAGE);
	
						var styleMustUpdate = (shapeTypeCurrent != shapeTypePrevious) || (shapeLayoutCurrent != shapeLayoutPrevious || (positionTextCurrent != positionTextPrevious) || iconImageCurrent != iconImagePrevious || shapeSubLayoutCurrent != shapeSubLayoutPrevious);
						if(styleMustUpdate)
						{
							// Define the new style
							var styleNew = styleCurrent;
							var updatedStyle = mxMondrianBase.prototype.getStyle(styleNew, shapeTypeCurrent, shapeLayoutCurrent, positionTextCurrent, iconImageCurrent);
							styleNew = updatedStyle.style;
							shapeLayoutCurrent = updatedStyle.shapeLayout;
							styleMustUpdate = mxMondrianBase.prototype.cellMustRestyle(styleCurrent, styleNew);
						}
						
						var geoMustUpdate = (shapeTypeCurrent != shapeTypePrevious) || (shapeLayoutCurrent != shapeLayoutPrevious);
						if(geoMustUpdate)
						{
							//Define the new Geometery
							const geoCurrent = evt.properties.change.cell.geometry;
							var newRect = mxMondrianBase.prototype.getRectangle(
								new mxRectangle(geoCurrent.x, geoCurrent.y, geoCurrent.width, geoCurrent.height), 
									shapeTypeCurrent, shapeLayoutCurrent, shapeSubLayoutCurrent);
					
							geoMustUpdate = mxMondrianBase.prototype.cellMustResize(geoCurrent, newRect);
						}
	
						if(styleMustUpdate || geoMustUpdate)
						{
							this.state.view.graph.model.beginUpdate();
							try
							{				
								if(styleMustUpdate)
								{
									this.state.view.graph.model.setStyle(this.state.cell, styleNew);
								}
									
								if(geoMustUpdate)
								{
									this.state.view.graph.model.setGeometry(this.state.cell, 
										new mxGeometry(newRect.x, newRect.y, newRect.width, newRect.height));
								}
							}
							finally
							{
								this.state.view.graph.model.endUpdate();
							}
						}
					}
				}
				else
				{
					// do nothing
				}
			}
			catch(err)
			{
				// do nothing
			}
		});

		this.state.view.graph.model.addListener(mxEvent.EXECUTED, this.changeListener);
	}
}

mxMondrianBase.prototype.getStyleValue = function(style, key, defaultValue)
{
	var value = 'undefined';
	var keyIndex = style.indexOf(key);

	if(keyIndex > 0)
	{	
		var valueSeparator = style.indexOf('=', keyIndex + 1);
		var keySeparator = style.indexOf(';', valueSeparator + 1);

		if(keySeparator < 0)
			keySeparator = style.length;
		
		value = style.substring(valueSeparator + 1, keySeparator);
	}

	return (value === 'undefined' &&  defaultValue != undefined) ? defaultValue : value;
}

/**
 * Function: redraw
 *
 * Reconfigures this shape. This will update the attributees of the Shape.
 */
mxMondrianBase.prototype.redraw = function()
{
	this.shapeType = mxUtils.getValue(this.style, mxMondrianBase.prototype.cst.SHAPE_TYPE, mxMondrianBase.prototype.cst.SHAPE_TYPE_DEFAULT);	
	
	let shapeLayout = mxUtils.getValue(this.style, mxMondrianBase.prototype.cst.SHAPE_LAYOUT, mxMondrianBase.prototype.cst.SHAPE_LAYOUT_DEFAULT).split(':');;
	this.shapeLayout = shapeLayout[0];
	this.shapeSubLayout = shapeLayout[1];

	this.shapeStyle = mxUtils.getValue(this.style, mxMondrianBase.prototype.cst.SHAPE_STYLE, mxMondrianBase.prototype.cst.SHAPE_STYLE_DEFAULT);
	this.shapeMultiplicity = mxUtils.getValue(this.style, mxMondrianBase.prototype.cst.SHAPE_MULTIPLICITY, mxMondrianBase.prototype.cst.SHAPE_MULTIPLICITY_DEFAULT);
	this.iconImage = mxUtils.getValue(this.style, mxMondrianBase.prototype.cst.ICON_IMAGE, mxMondrianBase.prototype.cst.ICON_IMAGE_DEFAULT);
	this.colorFamily = mxUtils.getValue(this.style, mxMondrianBase.prototype.cst.COLOR_FAMILY, mxMondrianBase.prototype.cst.COLOR_FAMILY_DEFAULT);
	this.colorFillIcon = mxUtils.getValue(this.style, mxMondrianBase.prototype.cst.COLOR_FILL_ICON, mxMondrianBase.prototype.cst.COLOR_FILL_ICON_DEFAULT);
	
	let colorFillBackground = mxUtils.getValue(this.style, mxMondrianBase.prototype.cst.COLOR_FILL_BACKGROUND, mxMondrianBase.prototype.cst.COLOR_FILL_BACKGROUND_DEFAULT).split(':');
	this.colorFillText = colorFillBackground[0];
	this.colorFillContainer = colorFillBackground[1];

	this.positionText = mxUtils.getValue(this.style, mxMondrianBase.prototype.cst.POSITION_TEXT, mxMondrianBase.prototype.cst.POSITION_TEXT_DEFAULT);

	mxShape.prototype.redraw.apply(this, arguments);
};

mxMondrianBase.prototype.cellMustResize = function(currentGeo, newGeo)
{
	if(currentGeo.width != newGeo.width)
		return true;
	else if(currentGeo.height != newGeo.height)
		return true;
	else
		return false;
}

mxMondrianBase.prototype.cellMustRestyle = function(currentStyle, newStyle)
{
	return newStyle != currentStyle;
}

mxMondrianBase.prototype.paintVertexShape = function(c, x, y, w, h)
{
	this.shapeVisualDefinition = mxMondrianBase.prototype.getShapeVisualDefinition(
		this,
		this.shapeType, this.shapeLayout, this.shapeSubLayout, this.shapeStyle, this.shapeMultiplicity, w, h,
		this.colorFamily, this.colorFillIcon, this.colorFillText, this.colorFillContainer,
		this.iconImage);

	c.translate(x, y);

	this.paintContainer(c);
	this.paintTitleBar(c);
	this.paintCorner(c);
	this.paintIcon(c);
	this.paintShape(c);
	this.paintTag(c);

	// if the fontColor is Black or White the color is controlled by visualization rules
	let svd = this.shapeVisualDefinition;
	fontColor = this.style.fontColor;
	if(fontColor != svd.text.color && (fontColor === '#000000' || fontColor === '#FFFFFF' || fontColor === '#ffffff' || fontColor === 'undefined'))
	{
		this.style.fontColor = svd.text.color;
		styleCurrent = this.state.view.graph.model.getStyle(this.state.cell);
		newStyle = mxUtils.setStyle(styleCurrent, 'fontColor', this.style.fontColor);
		this.state.view.graph.model.setStyle(this.state.cell, newStyle);
	}
};

/**
 * Shape declaration for all Shapes
**/
mxMondrianBase.prototype.paintActor = function(c, width, offSet = 0)
{
	c.ellipse(offSet, offSet, width-offSet*2, width-offSet*2); 
}

mxMondrianBase.prototype.paintTS = function(c, width, height, radius, offSet = 0, leftShift = 0)
{
	c.begin();
	c.moveTo(radius + leftShift, offSet);
	c.lineTo(width - radius + leftShift, offSet);
	c.arcTo(radius - offSet, radius - offSet, 0, 0, 1, width - radius + leftShift, height - offSet);
	c.lineTo(radius + leftShift, height - offSet);
	c.arcTo(radius - offSet, radius - offSet, 0, 0, 1, radius + leftShift, offSet);
	c.close();
}

mxMondrianBase.prototype.paintLG = function(c, width, height, radius, offSet = 0)
{
	c.begin();
	c.moveTo(offSet, offSet);
	c.lineTo(width - radius, offSet);
	c.arcTo(radius - offSet, radius - offSet, 0, 0, 1, width - offSet, radius);
	c.lineTo(width - offSet, height - radius);
	c.arcTo(radius - offSet, radius - offSet, 0, 0, 1, width - radius, height - offSet);
	c.lineTo(radius, height - offSet);
	c.arcTo(radius - offSet, radius - offSet, 0, 0, 1, offSet, height - radius);
	c.lineTo(offSet, offSet);
	c.close();
}

mxMondrianBase.prototype.paintRoundRect = function(c, width, height, radius, offSet = 0)
{
	c.roundrect(offSet, offSet, width - offSet*2, height - offSet*2, radius - offSet, radius - offSet);
}

mxMondrianBase.prototype.paintRect = function(c, width, height, offSet = 0)
{
	c.rect(offSet, offSet, width - offSet*2, height - offSet*2);
}

/**
 * Function: paintContainer
 * 
 * Generic background painting implementation.
 */
mxMondrianBase.prototype.paintContainer = function(c)
{
	let svd = this.shapeVisualDefinition;
	if(svd.container.visible)
	{
		const endContainer = svd.shape.height - svd.text.labelBoundsHeight;
		const startContainer = svd.text.labelBoundsHeight;

		if(svd.shape.type === 'ln' || svd.shape.type === 'lc')
		{
			c.setFillColor(svd.container.color);
			c.begin();
			c.moveTo(0, startContainer);
			c.lineTo(svd.shape.width, startContainer);
			c.lineTo(svd.shape.width, svd.shape.height - svd.shape.radius);
			c.arcTo(svd.shape.radius, svd.shape.radius, 0, 0, 1, svd.shape.width - svd.shape.radius, svd.shape.height);
			c.lineTo(svd.shape.radius, svd.shape.height);
			c.arcTo(svd.shape.radius, svd.shape.radius, 0, 0, 1, 0, svd.shape.height - svd.shape.radius);
			c.lineTo(0, startContainer);
			c.close();
			c.fill();
		}
		else {
			c.setFillColor(svd.container.color);
			c.rect(0, startContainer, svd.shape.width, endContainer);
			c.fill();
		}
	}
};

/**
 * Function: paintTitleBar
 * 
 * Generic background painting implementation.
 */
mxMondrianBase.prototype.paintTitleBar = function(c)
{
	let svd = this.shapeVisualDefinition; 
	if(svd.titleBar.visible)
	{
		if(svd.shape.type === 'ln' || svd.shape.type === 'lc')
		{
			if (svd.container.visible)
			{
				c.setFillColor(svd.titleBar.color);
				c.begin();
				c.moveTo(svd.shape.radius, 0);
				c.lineTo(svd.shape.width - svd.shape.radius, 0);
				c.arcTo(svd.shape.radius, svd.shape.radius, 0, 0, 1, svd.shape.width, svd.shape.radius);
				c.lineTo(svd.shape.width, svd.text.labelBoundsHeight);
				c.lineTo(0, svd.text.labelBoundsHeight);
				c.lineTo(0, svd.shape.radius);
				c.arcTo(svd.shape.radius, svd.shape.radius, 0, 0, 1, svd.shape.radius, 0);
				c.close();
				c.fill();
			}
			else
			{
				c.setFillColor(svd.titleBar.color);
				c.roundrect(0, 0, svd.shape.width, svd.text.labelBoundsHeight, svd.shape.radius, svd.shape.radius);
				c.fill();
			}
		}
		else if(svd.shape.type === 'lg')
		{
			c.setFillColor(svd.titleBar.color);
			c.begin();
			c.moveTo(0, 0);
			c.lineTo(svd.shape.width - svd.shape.radius, 0);
			c.arcTo(svd.shape.radius, svd.shape.radius, 0, 0, 1, svd.shape.width, svd.shape.radius);
			c.lineTo(svd.shape.width, svd.text.labelBoundsHeight);
			c.lineTo(0, svd.text.labelBoundsHeight);
			c.lineTo(0, 0);
			c.close();
			c.fill();
		}
		else
		{
			c.setFillColor(svd.titleBar.color);
			c.rect(0, 0, svd.shape.width, svd.text.labelBoundsHeight);
			c.fill();
		}
	}
};

/**
 * Function: paintCorner
 * 
 * Generic background painting implementation.
 */
mxMondrianBase.prototype.paintCorner = function(c)
{
	let svd = this.shapeVisualDefinition; 
	if(svd.corner.visible)
	{
		const doubleStyleOffset = (svd.outerLine.secondLine) ? svd.outerLine.secondLineOffSet : 0;
		c.setFillColor(svd.corner.color);

		if(svd.shape.type === 'actor')
		{
			mxMondrianBase.prototype.paintActor(c, svd.shape.width, doubleStyleOffset);
		}
		else if(svd.shape.type === 'ts')
		{
			mxMondrianBase.prototype.paintTS(c, svd.shape.width, svd.corner.height, svd.shape.radius, doubleStyleOffset, svd.shape.leftOffSet);
		}
		else if(svd.shape.type === 'ln' || svd.shape.type === 'lc')
		{
			if(svd.shape.layout === 'collapsed' || svd.shape.layout === 'legend')
			{
				mxMondrianBase.prototype.paintRoundRect(c, svd.shape.width, svd.shape.height, svd.shape.radius, doubleStyleOffset);
			}
			else
			{
				c.begin();
				c.moveTo(svd.shape.radius, 0);
				c.lineTo(svd.corner.width, 0);
				c.lineTo(svd.corner.width, svd.corner.height);
				if (svd.container.visible)
				{
					c.lineTo(0, svd.corner.height);
				}
				else
				{
					c.lineTo(svd.shape.radius, svd.corner.height);
					c.arcTo(svd.shape.radius, svd.shape.radius, 0, 0, 1, 0, svd.corner.height - svd.shape.radius);
				}
				c.lineTo(0, svd.shape.radius);	
				c.arcTo(svd.shape.radius, svd.shape.radius, 0, 0, 1, svd.shape.radius, 0);
				c.close();	
			}		
		}
		else
		{
			mxMondrianBase.prototype.paintRect(c, svd.corner.width, svd.corner.height, doubleStyleOffset);
		}
		
		c.fill();
	}
};

/**
 * Function: paintShape
 * 
 * Generic background painting implementation.
 */
mxMondrianBase.prototype.paintShape = function(c)
{
	let svd = this.shapeVisualDefinition;
	if(svd.shape.visible)
	{
		let doRestore = false;
		
		c.setStrokeColor(svd.outerLine.color);

	// Style: Double
		if(svd.outerLine.secondLine)
		{
			const doubleStyleOffset = svd.outerLine.secondLineOffSet;
			const WHITE = '#ffffff';

			c.save();
			c.setDashed(false, false);

			// WHITE LINE 
			c.setStrokeWidth(doubleStyleOffset);
			c.setStrokeColor(WHITE);

			if(svd.shape.type === 'actor')
				mxMondrianBase.prototype.paintActor(c, svd.shape.width, doubleStyleOffset/2);
			else if(svd.shape.type === 'ts')
				mxMondrianBase.prototype.paintTS(c, svd.shape.width, svd.shape.height, svd.shape.radius, doubleStyleOffset/2, svd.shape.leftOffSet);
			else if(svd.shape.type === 'ln' || svd.shape.type === 'lc')
				mxMondrianBase.prototype.paintRoundRect(c, svd.shape.width, svd.shape.height, svd.shape.radius, doubleStyleOffset/2);
			else if(svd.shape.type === 'lg')
				mxMondrianBase.prototype.paintLG(c, svd.shape.width, svd.shape.height, svd.shape.radius, doubleStyleOffset/2);
			else
				mxMondrianBase.prototype.paintRect(c, svd.shape.width, svd.shape.height, doubleStyleOffset/2);
			
			c.stroke();

			// DOUBLE LINE
			c.setStrokeWidth(1);
			c.setStrokeColor(svd.outerLine.color);			

			if(svd.shape.type === 'actor')
				mxMondrianBase.prototype.paintActor(c, svd.shape.width, doubleStyleOffset);
			else if(svd.shape.type === 'ts')
				mxMondrianBase.prototype.paintTS(c, svd.shape.width, svd.shape.height, svd.shape.radius, doubleStyleOffset, svd.shape.leftOffSet);
			else if(svd.shape.type === 'ln' || svd.shape.type === 'lc')
				mxMondrianBase.prototype.paintRoundRect(c, svd.shape.width, svd.shape.height, svd.shape.radius, doubleStyleOffset);
			else if(svd.shape.type === 'lg')
				mxMondrianBase.prototype.paintLG(c, svd.shape.width, svd.shape.height, svd.shape.radius, doubleStyleOffset);
			else
				mxMondrianBase.prototype.paintRect(c, svd.shape.width, svd.shape.height, doubleStyleOffset);
				
			c.stroke();

			c.restore();
		}
			
	// Divider Line
		if (svd.dividerLine.visible)
		{
			c.save();
			c.setStrokeColor(svd.dividerLine.color);
			c.setDashed(false);
			c.setStrokeWidth(1);
			c.begin();
			c.moveTo(0, svd.text.labelBoundsHeight);
			c.lineTo(svd.shape.width, svd.text.labelBoundsHeight);		
			c.stroke();
			c.restore();
		}
		
	// Base
		if(svd.outerLine.dashed)
		{
			let dashPattern = '6 6';

			doRestore = true;
			c.save();
			c.setDashed(true, true);
			c.setDashPattern(dashPattern);
		}

		if(svd.shape.type === 'actor')
		{
			mxMondrianBase.prototype.paintActor(c, svd.shape.width);
		}
		else if(svd.shape.type === 'ts')
		{
			mxMondrianBase.prototype.paintTS(c, svd.shape.width, svd.shape.height, svd.shape.radius, 0, svd.shape.leftOffSet);
		}
		else if(svd.shape.type === 'ln' || svd.shape.type === 'lc')
		{
			mxMondrianBase.prototype.paintRoundRect(c, svd.shape.width, svd.shape.height, svd.shape.radius);
		}
		else if(svd.shape.type === 'lg')
		{
			mxMondrianBase.prototype.paintLG(c, svd.shape.width, svd.shape.height, svd.shape.radius);
		}
		else
		{
			mxMondrianBase.prototype.paintRect(c, svd.shape.width, svd.shape.height);
		}

		c.stroke();

		this.paintShapeMultiplicity(c);

		if(doRestore)
			c.restore();		

	// Component decorator
		if(svd.shape.type === 'lc' || svd.shape.type === 'pc')
		{
			c.save();
			c.setDashed(false);
			c.setFillColor(svd.decorator.component.color);
			c.rect(svd.decorator.component.offSet, Math.floor(svd.corner.height/4), svd.decorator.component.width, svd.decorator.component.height);
			c.fillAndStroke();
			c.rect(svd.decorator.component.offSet, Math.floor((svd.corner.height/3)*2), svd.decorator.component.width, svd.decorator.component.height);
			c.fillAndStroke();
			c.restore();
		}
		
	//Bar decorator
		if(svd.bar.visible)
		{
			c.setFillColor(svd.outerLine.color);
			c.rect(0, 0, svd.bar.width,  svd.bar.height);
			c.fillAndStroke();
		}

		if(svd.style.type === 'strikethrough')
		{
			let leftCornerX = (svd.shape.layout === 'expanded') ? svd.corner.width : 0;
			let leftCornerY = 0;
			let rightCornerX = svd.shape.width;
			let rightCornerY = (svd.shape.layout === 'expanded') ? svd.text.labelBoundsHeight : svd.shape.height;

			c.setStrokeColor(svd.style.color);
			c.begin();
			
			if(svd.shape.type === 'actor')
			{
				let h = svd.shape.radius; // x coordinate of circle center
				let k = svd.shape.radius; // y coordinate of circle center
				let r = svd.shape.radius; // radius of circle
				let angle = 135;

				leftCornerX = h + r*Math.cos(angle * (Math.PI/180));
				leftCornerY = k - r*Math.sin(angle * (Math.PI/180));

				angle = 315;
				rightCornerX = h + r*Math.cos(angle * (Math.PI/180));
				rightCornerY = k - r*Math.sin(angle * (Math.PI/180));
			}
			else if(svd.shape.type === 'ts')
			{
				if(svd.shape.layout === 'collapsed' || svd.shape.layout === 'legend')
				{
					let h = svd.shape.radius + svd.shape.leftOffSet; // x coordinate of circle center
					let k = svd.shape.radius; // y coordinate of circle center
					let r = svd.shape.radius; // radius of circle
					let angle = 125;
					
					leftCornerX = h + r*Math.cos(angle * (Math.PI/180));
					leftCornerY = k - r*Math.sin(angle * (Math.PI/180));
		
					h = (svd.shape.layout === 'collapsed') ? 40 : 10;
					angle = 305;
					rightCornerX = h + r*Math.cos(angle * (Math.PI/180));
					rightCornerY = k - r*Math.sin(angle * (Math.PI/180));	
				}
				else
				{
					leftCornerX = svd.shape.radius;
					rightCornerX = rightCornerX - svd.shape.radius;
				}

			}
			else if(svd.shape.type === 'ln' || svd.shape.type === 'lc' || svd.shape.type === 'lg')
			{
				let h = svd.shape.radius; // x coordinate of circle center
				let k = svd.shape.radius; // y coordinate of circle center
				let r = svd.shape.radius; // radius of circle
				let angle = 135;

				if(svd.shape.type === 'lg')
				{
					leftCornerX = svd.bar.width;
					rightCornerY = svd.shape.height;
				}
				else if(svd.shape.layout === 'expanded' && svd.corner.visible)
				{
					//do nothing
				}
				else
				{
					leftCornerX = h + r*Math.cos(angle * (Math.PI/180));
					leftCornerY = k - r*Math.sin(angle * (Math.PI/180));
				}
				
				if(svd.dividerLine.visible)
				{
					//do nothing
				}
				else
				{
					h = (svd.shape.layout === 'expanded' || svd.shape.layout === 'collapsed') ? rightCornerX - 8 : 12;
					k = (svd.shape.layout === 'expanded' || svd.shape.layout === 'collapsed') ? rightCornerY - 8 : 12;
		
					angle = 315;
					rightCornerX = h + r*Math.cos(angle * (Math.PI/180));
					rightCornerY = k - r*Math.sin(angle * (Math.PI/180));	
				}
			}
			else if(svd.shape.type === 'pg')
			{
				leftCornerX = svd.bar.width;
				rightCornerY = svd.shape.height;
			}

			c.moveTo(leftCornerX, leftCornerY);
			c.lineTo(rightCornerX, rightCornerY);
			c.stroke();
		}
	}
};

mxMondrianBase.prototype.paintTag = function(c)
{
	let svd = this.shapeVisualDefinition;
	if(svd.tag.visible)
	{
		let fontSize = 12;
		let characterWidth = (6/10) * fontSize;
		let tagOuterBoxSingle = {
			circle: {width: 14, height:14},
			diamond: {width: 14, height:14},
			square: {width: 12, height:12},
			triangle: {width: 14, height:13.5},
			hexagon: {width: 15, height:13},
			octagon: {width: 13, height:13},
		};
		let outerBoxSingleWidth = tagOuterBoxSingle[svd.tag.shape].width;
		let outerBoxSingleHeight = tagOuterBoxSingle[svd.tag.shape].height;

		let tagText = svd.tag.text;
		let textLength = (tagText != null) ? tagText.length : 0;
		let extraTextWidth = (textLength > 1) ? characterWidth * (textLength - 1) + 4 : 0;
		let tagCenter = (svd.shape.layout === 'collapsed' || svd.shape.layout === 'expanded') ? 0 : svd.shape.height/2;

		let tagHeight = outerBoxSingleHeight;
		let tagWidth = outerBoxSingleWidth + extraTextWidth;
		let topTagY = -1 * tagHeight/2 + tagCenter;
		let bottomTagY = tagHeight/2 + tagCenter;

		let textPositionY = tagCenter - 1;
		
		let rightTagX = 0;

		let tagOffSet = (svd.shape.type === 'actor' || svd.shape.type === 'ts') ? -8 : 0;
		const tagSpaceRight = -1 * (outerBoxSingleWidth/2) - tagOffSet;
		//if(svd.shape.layout === 'collapsed')
		//	rightTagX = (svd.shape.width/2 + tagWidth/2);
		//else 
		if(svd.shape.layout === 'legend')
			rightTagX = tagWidth;
		else 
			rightTagX = svd.shape.width - tagSpaceRight;

		if(svd.shape.layout === 'legend')
			svd.text.labelBoundsOffSetLeft = 15 + extraTextWidth + 8;
		
		let leftTagX = rightTagX - tagWidth;
		let centerTagX = (rightTagX + leftTagX)/2;

		c.setFillColor(svd.tag.fill.color);
		c.setStrokeColor(svd.tag.line.color);
		c.setDashed(false);
		c.setStrokeWidth(1);

		let tagVisualSpecs = [
			{offSet: -1, fillColor: '#ffffff', strokeColor: '#ffffff', lineJoin: 'bevel'},
			{offSet: 0, fillColor: svd.tag.fill.color, strokeColor: svd.tag.line.color, lineJoin: 'miter'}];

		let lineOffSet = 0;

		for(let idx = 0; idx < tagVisualSpecs.length; idx++)
		{
			c.setStrokeColor(tagVisualSpecs[idx].strokeColor);
			c.setFillColor(tagVisualSpecs[idx].fillColor);
			c.setLineJoin(tagVisualSpecs[idx].lineJoin);
			lineOffSet = tagVisualSpecs[idx].offSet;

			if(svd.tag.shape === 'circle')
			{
				let circleRadius = 7;

				c.begin();
				c.moveTo(leftTagX + circleRadius, topTagY + lineOffSet);
				c.lineTo(rightTagX - circleRadius, topTagY + lineOffSet);
				c.arcTo(circleRadius - lineOffSet, circleRadius - lineOffSet, 0, 0, 1, rightTagX - circleRadius, bottomTagY - lineOffSet);
				c.lineTo(leftTagX + circleRadius, bottomTagY - lineOffSet);
				c.arcTo(circleRadius - lineOffSet, circleRadius - lineOffSet, 0, 0, 1, leftTagX + circleRadius, topTagY + lineOffSet);
				c.close();
			}
			else if(svd.tag.shape === 'diamond')
			{
				c.begin();
				c.moveTo(leftTagX + outerBoxSingleWidth/2, topTagY + lineOffSet);
				c.lineTo(rightTagX - outerBoxSingleWidth/2, topTagY + lineOffSet);
				c.lineTo(rightTagX - lineOffSet, tagCenter);
				c.lineTo(rightTagX - outerBoxSingleWidth/2, bottomTagY - lineOffSet);
				c.lineTo(leftTagX + outerBoxSingleWidth/2, bottomTagY - lineOffSet);
				c.lineTo(leftTagX + lineOffSet, tagCenter);
				c.close();
			}
			else if(svd.tag.shape === 'square')
			{
				c.begin();
				c.moveTo(leftTagX + lineOffSet, topTagY + lineOffSet);
				c.lineTo(rightTagX - lineOffSet, topTagY + lineOffSet);
				c.lineTo(rightTagX - lineOffSet, bottomTagY - lineOffSet);
				c.lineTo(leftTagX + lineOffSet, bottomTagY - lineOffSet);
				c.lineTo(leftTagX + lineOffSet, topTagY + lineOffSet);
				c.close();
			}
			else if(svd.tag.shape === 'triangle')
			{
				c.begin();
				c.moveTo(leftTagX + outerBoxSingleWidth/2, topTagY + lineOffSet);
				c.lineTo(rightTagX - lineOffSet - outerBoxSingleWidth/2, topTagY + lineOffSet);
				c.lineTo(rightTagX - 2 * lineOffSet, bottomTagY - lineOffSet);
				c.lineTo(leftTagX + 2 * lineOffSet, bottomTagY - lineOffSet);
				c.lineTo(leftTagX + lineOffSet + outerBoxSingleWidth/2, topTagY + lineOffSet);
				c.close();
			}
			else if(svd.tag.shape === 'hexagon')
			{
				c.begin();
				c.moveTo(leftTagX + outerBoxSingleWidth/4, topTagY + lineOffSet);
				c.lineTo(rightTagX - lineOffSet/2 - outerBoxSingleWidth/4, topTagY + lineOffSet);
				c.lineTo(rightTagX - lineOffSet, tagCenter);
				c.lineTo(rightTagX - lineOffSet/2 - outerBoxSingleWidth/4, bottomTagY - lineOffSet);
				c.lineTo(leftTagX + lineOffSet/2 + outerBoxSingleWidth/4, bottomTagY - lineOffSet);
				c.lineTo(leftTagX + lineOffSet, tagCenter);
				c.lineTo(leftTagX + lineOffSet/2 + outerBoxSingleWidth/4, topTagY + lineOffSet);
				c.close();
			}
			else if(svd.tag.shape === 'octagon')
			{
				c.begin();
				c.moveTo(leftTagX + lineOffSet/2 + outerBoxSingleWidth/4, topTagY + lineOffSet);
				c.lineTo(rightTagX - lineOffSet/2 - outerBoxSingleWidth/4, topTagY + lineOffSet);
				c.lineTo(rightTagX - lineOffSet, topTagY + lineOffSet/2 + outerBoxSingleHeight/4);
				c.lineTo(rightTagX - lineOffSet, bottomTagY - lineOffSet/2 - outerBoxSingleHeight/4);
				c.lineTo(rightTagX - lineOffSet/2 - outerBoxSingleWidth/4, bottomTagY - lineOffSet);
				c.lineTo(leftTagX + lineOffSet/2 + outerBoxSingleWidth/4, bottomTagY - lineOffSet);
				c.lineTo(leftTagX + lineOffSet, bottomTagY - lineOffSet/2 - outerBoxSingleHeight/4);
				c.lineTo(leftTagX + lineOffSet, topTagY + lineOffSet/2 + outerBoxSingleHeight/4);
				c.lineTo(leftTagX + lineOffSet/2 + outerBoxSingleWidth/4, topTagY + lineOffSet);			
				c.close();
			}
			
			c.fillAndStroke();					
		}		

		if(tagText != null)
		{
			c.setFontColor(svd.tag.textColor);
			c.setFontSize(fontSize);
			c.setFontFamily(svd.config.TAG_FONT);
			c.text(centerTagX, textPositionY, 0, 14, tagText, mxConstants.ALIGN_CENTER, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 0);	
		}
	}
}

mxMondrianBase.prototype.paintShapeMultiplicity = function(c)
{
	let svd = this.shapeVisualDefinition;
	if(svd.multiplicity.visible)
	{
		let lineNumbers = [1, 2];

		if(svd.shape.type === 'ln' || svd.shape.type === 'lc' || svd.shape.type === 'lg')
		{
			c.begin();
			for(let idx = 0; idx < lineNumbers.length; idx++)
			{
				c.moveTo((lineNumbers[idx] + 1) * svd.multiplicity.spacing, -lineNumbers[idx] * svd.multiplicity.spacing);
				c.lineTo(svd.shape.width + lineNumbers[idx] * svd.multiplicity.spacing - svd.shape.radius, -lineNumbers[idx] * svd.multiplicity.spacing);
				c.arcTo(svd.shape.radius, svd.shape.radius, 0, 0, 1, svd.shape.width + lineNumbers[idx] * svd.multiplicity.spacing, svd.shape.radius - lineNumbers[idx] * svd.multiplicity.spacing);
				c.lineTo(svd.shape.width + lineNumbers[idx] * svd.multiplicity.spacing, svd.shape.height - (lineNumbers[idx] + 1) * svd.multiplicity.spacing);	
			}
			c.stroke();
		}
		else if(svd.shape.type === 'actor')
		{
			c.begin();
			for(let idx = 0; idx < lineNumbers.length; idx++)
			{
				c.moveTo(svd.shape.width/2 + lineNumbers[idx] * svd.multiplicity.spacing, -lineNumbers[idx] * svd.multiplicity.spacing);
				c.arcTo(svd.shape.radius, svd.shape.radius, 0, 0, 1, svd.shape.width + lineNumbers[idx] * svd.multiplicity.spacing, svd.shape.height/2 - lineNumbers[idx] * svd.multiplicity.spacing);	
			}
			c.stroke();
		}
		else if (svd.shape.type === 'ts')
		{
			c.begin();
			for(let idx = 0; idx < lineNumbers.length; idx++)
			{
				c.moveTo(svd.shape.radius + svd.shape.leftOffSet + (lineNumbers[idx] - 1) * svd.multiplicity.spacing, -lineNumbers[idx] * svd.multiplicity.spacing);
				c.lineTo(svd.shape.width + svd.shape.leftOffSet - svd.shape.radius + lineNumbers[idx] * svd.multiplicity.spacing, -lineNumbers[idx] * svd.multiplicity.spacing);
				c.arcTo(svd.shape.radius, svd.shape.radius, 0, 0, 1, svd.shape.width + svd.shape.leftOffSet + lineNumbers[idx] * svd.multiplicity.spacing, svd.shape.height/2 - lineNumbers[idx] * svd.multiplicity.spacing);				
			}
		
			c.stroke();	
		}
		else
		{
			c.begin();
			for(let idx = 0; idx < lineNumbers.length; idx++)
			{
				c.moveTo((lineNumbers[idx] + 1) * svd.multiplicity.spacing, -lineNumbers[idx] * svd.multiplicity.spacing);
				c.lineTo(svd.shape.width + lineNumbers[idx] * svd.multiplicity.spacing, -lineNumbers[idx] * svd.multiplicity.spacing);
				c.lineTo(svd.shape.width + lineNumbers[idx] * svd.multiplicity.spacing, svd.shape.height - (lineNumbers[idx] + 1) * svd.multiplicity.spacing);	
			}
			c.stroke();
		}
	}
}

/**
 * Function: paintIcon
 * 
 * Generic background painting implementation.
 * Two options are provide to show an Icon:
 * 	  1) Via a Stencil, where the Icon-Name data attribute must contain the name of the shape available in the Stencil
 *    2) Via the image style property
 * 
 * Option 2 is deprecated and will be removed in future. If both options are used on the same Shape, the Stencil Icon is used 
 */
mxMondrianBase.prototype.iconScalingFactor = function(iconWidth, iconHeight, boxSize)
{
	return boxSize/(Math.max(iconWidth, iconHeight));
}

mxMondrianBase.prototype.paintIcon = function(c)
{
	let svd = this.shapeVisualDefinition;
	if(svd.icon.visible)
	{
		let iconStencilName = this.state.cell.getAttribute('Icon-Name',null) || 'undefined';
		let iconImageStyle = this.image || 'undefined';

		// Determine what Icon to show
		let showStencilIcon = true;
		let stencilIconIsUndefined = (iconStencilName == 'undefined');

		let showImageIcon = (iconImageStyle != null && iconImageStyle != '' && iconImageStyle != 'undefined');
		
		// Retrieve the stencil from the registry 
		let iconStencil = null;
		if(showStencilIcon)
		{
			let iconName = mxMondrianBase.prototype.cst.MONDRIAN_ICONS_STENCIL_REGISTRY + iconStencilName;

			if(Sidebar.prototype.mondrianRepo.hasStencil(iconName))
				iconStencil = mxStencilRegistry.getStencil(Sidebar.prototype.mondrianRepo.getStencil(iconName));
			
			if(iconStencil == null) // try an alias
			{
				iconName = iconStencilName;

				if(Sidebar.prototype.mondrianRepo.hasStencil(iconName))
					iconStencil = mxStencilRegistry.getStencil(Sidebar.prototype.mondrianRepo.getStencil(iconName));
			}
			
			if(iconStencil == null) // the iconStencilName cannot be found, so the 'notfound' Icon is retrieved
			{
				iconName = mxMondrianBase.prototype.cst.MONDRIAN_BASE_STENCIL_REGISTRY + 'notfound';
				iconStencil = mxStencilRegistry.getStencil(Sidebar.prototype.mondrianRepo.getStencil(iconName));

				stencilIconIsUndefined = true;
			}

			showStencilIcon = (iconStencil != null); // only show the Icon if a stencil is found
		}

		// Make final call what Icon to show
		if(showStencilIcon && !stencilIconIsUndefined) // stencil is found and it is not the 'undefined' stencil -> never use the Image Style
			showImageIcon = false;
		else if(showStencilIcon && stencilIconIsUndefined && showImageIcon) // stencil is found, but it is the 'undefined stencil and there is an Image Style set -> use the Image Style
			showStencilIcon = false;
		
		if(showStencilIcon || showImageIcon)
		{
			let iconWidth = svd.icon.size;
			let iconHeight = svd.icon.size;

			if(showStencilIcon)
			{
				let scalingFactor = this.iconScalingFactor(iconStencil.w0, iconStencil.h0, svd.icon.size);
				iconWidth = iconStencil.w0 * scalingFactor;
				iconHeight = iconStencil.h0 * scalingFactor;
			}

			let positionX = (svd.shape.type === 'lg' || svd.shape.type  === 'pg') ? svd.corner.width - iconWidth : svd.corner.width/2 - iconWidth/2;
			positionX = (svd.shape.layout === 'expanded' && svd.shape.type  === 'ts') ? positionX + svd.shape.radius/2 : positionX;
			positionX = (svd.shape.layout === 'legend') ? 0 : positionX;
			
			let positionY = svd.corner.height/2 - iconHeight/2;

			let canvasCenterX = positionX + iconWidth/2;
			let canvasCenterY = svd.corner.height/2;
		
			c.save();
			// rotate icon
			c.rotate(svd.icon.rotate, svd.icon.flipH, svd.icon.flipV, 
				canvasCenterX, canvasCenterY);
			
			if(showStencilIcon)
			{
				c.setStrokeColor('none');
				c.setFillColor(svd.icon.color);
				c.setDashed(false);
	
				iconStencil.strokewidth = 1;
				iconStencil.drawShape(c, this, positionX, positionY, iconWidth, iconHeight);	
			}
			else if(showImageIcon)
			{
				c.image(positionX, positionY, iconWidth, iconHeight, this.image, true, false, false);
			}
			
			c.restore();
		}
	}
};

/**
 * Function: getStyle
 * 
 * Returns the style based on shapeType & shapeLayout.
 */
var shapeStyle = {};
mxMondrianBase.prototype.getStyle = function(style, shapeType, shapeLayout, positionText, iconImage)
{	

	if(shapeType === 'pg' || shapeType === 'lg')
	{
		style = mxUtils.setStyle(style, 'container', 1);
		style = mxUtils.setStyle(style, 'collapsible', 0);
		style = mxUtils.setStyle(style, 'recursiveResize', 0);
		style = mxUtils.setStyle(style, 'expand', 0);

		if(shapeLayout === 'collapsed') // a group can only be expanded so should ignore the shapeLayout setting
		{
			shapeLayout = 'expanded';
			style = mxUtils.setStyle(style, 'shapeLayout', shapeLayout);
		}	
	}
	else if(shapeType === 'actor')
	{
		if(shapeLayout === 'expanded') // an actor can only be expanded so should ignore the shapeLayout setting
		{
			shapeLayout = 'collapsed';
			style = mxUtils.setStyle(style, 'shapeLayout', shapeLayout);
		}	
	}

	if(shapeLayout === 'collapsed'|| shapeLayout === 'legend')
	{
		style = mxUtils.setStyle(style, 'container', 0);
	}

	if(shapeLayout === 'expanded' || shapeLayout === 'legend')
	{
		let spacingLeft = (shapeLayout === 'expanded') ? this.textSpacingLeft : 0;
		let spacingRight = (shapeLayout === 'expanded' && shapeType === 'ts' && iconImage === 'noIcon') ? 16 : spacingLeft;
		let align = (shapeLayout === 'expanded' && shapeType === 'ts' && iconImage === 'noIcon') ? mxConstants.ALIGN_CENTER : mxConstants.ALIGN_LEFT;

		shapeStyle.verticalLabelPosition = mxConstants.ALIGN_MIDDLE;
		shapeStyle.labelPosition = mxConstants.ALIGN_CENTER;
		shapeStyle.verticalAlign = mxConstants.ALIGN_MIDDLE;
		shapeStyle.align = align;
		shapeStyle.spacingLeft = spacingLeft;
		shapeStyle.spacingRight = spacingRight;			
		shapeStyle.spacing = 0;
		shapeStyle.spacingTop = 0;
		shapeStyle.spacingBottom = 0;
		style = mxUtils.setStyle(style, mxConstants.STYLE_LABEL_WIDTH, null); // remove the label width since this is controlled by the bounding box
		shapeStyle.positionText = null;			
	}
	else if(shapeLayout === 'collapsed')
	{
		if(positionText === 'top')
		{
			shapeStyle.verticalLabelPosition = mxConstants.ALIGN_TOP;
			shapeStyle.labelPosition = mxConstants.ALIGN_CENTER;
			shapeStyle.verticalAlign = mxConstants.ALIGN_BOTTOM;
			shapeStyle.align = mxConstants.ALIGN_CENTER;
			shapeStyle.spacing = 0;
			shapeStyle.spacingLeft = 0;
			shapeStyle.spacingRight = 0;
			shapeStyle.spacingTop = 0;
			shapeStyle.spacingBottom = this.textSpacing;
			shapeStyle.positionText = positionText;
		}
		else if(positionText === 'left')
		{
			shapeStyle.verticalLabelPosition = mxConstants.ALIGN_MIDDLE;
			shapeStyle.labelPosition = mxConstants.ALIGN_LEFT;
			shapeStyle.verticalAlign = mxConstants.ALIGN_MIDDLE;
			shapeStyle.align = mxConstants.ALIGN_RIGHT;
			shapeStyle.spacing = 0;
			shapeStyle.spacingLeft = 0;
			shapeStyle.spacingRight = this.textSpacing;
			shapeStyle.spacingTop = 0;
			shapeStyle.spacingBottom = 0;
			shapeStyle.positionText = positionText;
		}		
		else if(positionText === 'right')
		{
			shapeStyle.verticalLabelPosition = mxConstants.ALIGN_MIDDLE;
			shapeStyle.labelPosition = mxConstants.ALIGN_RIGHT;
			shapeStyle.verticalAlign = mxConstants.ALIGN_MIDDLE;
			shapeStyle.align = mxConstants.ALIGN_LEFT;
			shapeStyle.spacing = 0;
			shapeStyle.spacingLeft = this.textSpacing;
			shapeStyle.spacingRight = 0;
			shapeStyle.spacingTop = 0;
			shapeStyle.spacingBottom = 0;
			shapeStyle.positionText = positionText;
		}		
		else // default is bottom
		{
			shapeStyle.verticalLabelPosition = mxConstants.ALIGN_BOTTOM;
			shapeStyle.labelPosition = mxConstants.ALIGN_CENTER;
			shapeStyle.verticalAlign = mxConstants.ALIGN_TOP;
			shapeStyle.align = mxConstants.ALIGN_CENTER;
			shapeStyle.spacing = 0;
			shapeStyle.spacingLeft = 0;
			shapeStyle.spacingRight = 0;
			shapeStyle.spacingTop = this.textSpacing - 4; //draw.io adds 4px padding
			shapeStyle.spacingBottom = 0;
			shapeStyle.positionText = 'bottom';
		}
	}

	style = mxUtils.setStyle(style, mxConstants.STYLE_VERTICAL_LABEL_POSITION, shapeStyle.verticalLabelPosition);
	style = mxUtils.setStyle(style, mxConstants.STYLE_LABEL_POSITION, shapeStyle.labelPosition);
	style = mxUtils.setStyle(style, mxConstants.STYLE_VERTICAL_ALIGN, shapeStyle.verticalAlign);
	style = mxUtils.setStyle(style, mxConstants.STYLE_ALIGN, shapeStyle.align);

	style = mxUtils.setStyle(style, mxConstants.STYLE_SPACING, shapeStyle.spacing);
	style = mxUtils.setStyle(style, mxConstants.STYLE_SPACING_LEFT, shapeStyle.spacingLeft);
	style = mxUtils.setStyle(style, mxConstants.STYLE_SPACING_RIGHT, shapeStyle.spacingRight);
	style = mxUtils.setStyle(style, mxConstants.STYLE_SPACING_TOP, shapeStyle.spacingTop);
	style = mxUtils.setStyle(style, mxConstants.STYLE_SPACING_BOTTOM, shapeStyle.spacingBottom);

	style = mxUtils.setStyle(style, 'positionText', shapeStyle.positionText);

	return {style, shapeLayout};
}
/**
 * Function: getRectangle
 * 
 * Returns the rectangle based on shapeType & shapeLayout.
 */
mxMondrianBase.prototype.getRectangle = function(rect, shapeType, shapeLayout, shapeSubLayout)
{
	if(shapeType != null)
	{
		let dimensions = mxMondrianBase.prototype.getShapeDimensions(shapeType, shapeLayout, shapeSubLayout, rect.width, rect.height);

		if(shapeLayout === 'collapsed')
		{
			rect.width = dimensions.minRectWidth;
			rect.height = dimensions.minRectHeight;
		}
		else if(shapeLayout === 'expanded')
		{
			if(shapeType === 'ts')
			{
				rect.width = Math.max(dimensions.minRectWidth, rect.width);
				rect.height = dimensions.minRectHeight;
			}
			else
			{
				rect.width = Math.max(dimensions.minRectWidth, rect.width);
				rect.height = Math.max(dimensions.minRectHeight, rect.height);
			}
		}
		else if(shapeLayout === 'legend')
		{
			rect.width = Math.max(dimensions.minRectWidth, rect.width);
			rect.height = dimensions.minRectHeight;
		}
	}

	return rect;
};

/**
 * Function: getLabelBounds
 * 
 * Returns the bounds for the label.
 */
mxMondrianBase.prototype.getLabelBounds = function(rect)
{
	let svd = this.shapeVisualDefinition;
	return new mxRectangle(
					rect.x + svd.text.labelBoundsOffSetLeft * this.scale, 
					rect.y,
					rect.width - (svd.text.labelBoundsOffSetLeft * this.scale),
					svd.text.labelBoundsHeight * this.scale);
};

/**
 * Function: getConstraints
 * 
 * Returns the Connection Constraints for the shape.
 */
mxMondrianBase.prototype.getConstraints = function(style, w, h)
{
	let svd = this.shapeVisualDefinition;

	if(svd.shape.layout === 'legend')
		return null;

	var constr = [];

	if(svd.shape.type === 'actor')
	{
		var step = 30;
		var h = 0.5; // x coordinate of circle center
		var k = 0.5; // y coordinate of circle center
		var r = 0.5; // radius of circle
		for(var angle=0;  angle < 360;  angle+=step)
		{ 
			var x = h + r*Math.cos(angle * (Math.PI/180));
			var y = k - r*Math.sin(angle * (Math.PI/180));
			constr.push(new mxConnectionConstraint(new mxPoint(x,y), false));
		}
	}
	else
	{
		const connectionPositions = [0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.7, 0.75, 0.8, 0.9];
		const dXoffSet = (svd.shape.type != 'ts' && svd.multiplicity.visible) ? 8 : 0;
		const dYoffSet = (svd.shape.type != 'ts' && svd.multiplicity.visible) ? 8 : 0;
		
		var connectionConstraint = null;
		// Left side
		for (pointIndex = 0; pointIndex < connectionPositions.length; pointIndex++) {
			connectionConstraint = new mxConnectionConstraint(new mxPoint(0, connectionPositions[pointIndex]), false);
			constr.push(connectionConstraint);	
		}

		// Right side
		for (pointIndex = 0; pointIndex < connectionPositions.length; pointIndex++) {
			connectionConstraint = new mxConnectionConstraint(new mxPoint(1, connectionPositions[pointIndex]), false);
			connectionConstraint.dx = dXoffSet;
			constr.push(connectionConstraint);	
		}

		// Top side
		for (pointIndex = 0; pointIndex < connectionPositions.length; pointIndex++) {
			connectionConstraint = new mxConnectionConstraint(new mxPoint(connectionPositions[pointIndex], 0), false);
			connectionConstraint.dy = -1 * dYoffSet;
			constr.push(connectionConstraint);	
		}

		// Bottom side
		for (pointIndex = 0; pointIndex < connectionPositions.length; pointIndex++) {
			connectionConstraint = new mxConnectionConstraint(new mxPoint(connectionPositions[pointIndex], 1), false);
			constr.push(connectionConstraint);	
		}

	}

	return (constr);
}

mxMondrianBase.prototype.destroy = function()
{
	mxShape.prototype.destroy.apply(this, arguments);

	if(this.changeListener != null)
	{
		this.state.view.graph.model.removeListener(this.changeListener);
		this.changeListener = null;
	}
}

let _union = mxVertexHandler.prototype.union;
mxVertexHandler.prototype.union = function(bounds, dx, dy, index, gridEnabled, scale, tr, constrained)
{  	
	let rect = _union.apply(this, arguments); 

	if(this.state.style['shape'] === mxMondrianBase.prototype.cst.MONDRIAN_BASE_SHAPE)
	{
		const shapeType = mxUtils.getValue(this.state.style, mxMondrianBase.prototype.cst.SHAPE_TYPE, mxMondrianBase.prototype.cst.SHAPE_TYPE_DEFAULT);
		const shapeLayout = mxUtils.getValue(this.state.style, mxMondrianBase.prototype.cst.SHAPE_LAYOUT, mxMondrianBase.prototype.cst.SHAPE_LAYOUT_DEFAULT).split(':')[0];
		const shapeSubLayout = mxUtils.getValue(this.state.style, mxMondrianBase.prototype.cst.SHAPE_LAYOUT, mxMondrianBase.prototype.cst.SHAPE_LAYOUT_DEFAULT).split(':')[1];
		rect = mxMondrianBase.prototype.getRectangle(rect, shapeType, shapeLayout, shapeSubLayout);
	}

	return rect;
};

let _createCustomeHandles = mxVertexHandler.prototype.createCustomHandles;
mxVertexHandler.prototype.createCustomHandles = function()
{
	if(this.state.style['shape'] === mxMondrianBase.prototype.cst.MONDRIAN_BASE_SHAPE)
	{
		// Implements the handle for the first divider
		var cursor = 'ew-resize'
		var textHandle = new mxHandle(this.state, cursor);
		
		textHandle.getPosition = function(bounds)
		{
			var labelWidth = Math.max(48, parseFloat(mxUtils.getValue(this.state.style, 'labelWidth', 100)));
						
			switch(mxUtils.getValue(this.state.style, 'positionText', null)) {
				case 'left':
					return new mxPoint(bounds.x - labelWidth - mxMondrianBase.prototype.textSpacing, bounds.getCenterY());
				case 'right':
					return new mxPoint(bounds.x + bounds.width + labelWidth + mxMondrianBase.prototype.textSpacing, bounds.getCenterY());
				case 'top':
					return new mxPoint(bounds.getCenterX() - labelWidth/2, bounds.y - mxMondrianBase.prototype.textSpacing);
				case 'bottom':
					return new mxPoint(bounds.getCenterX() - labelWidth/2, bounds.y + bounds.height + mxMondrianBase.prototype.textSpacing);
				default:
					return null;
				}
		};
		
		textHandle.setPosition = function(bounds, pt)
		{		
			switch(mxUtils.getValue(this.state.style, 'positionText', null)) {
				case 'left':
					this.state.style['labelWidth'] = Math.round(bounds.x - pt.x - mxMondrianBase.prototype.textSpacing);
					break;
				case 'right':
					this.state.style['labelWidth'] = Math.round(pt.x - bounds.x - bounds.width - mxMondrianBase.prototype.textSpacing);
					break;
				case 'top':
					this.state.style['labelWidth'] = Math.round((bounds.getCenterX() - pt.x) * 2);
					break;
				case 'bottom':
					this.state.style['labelWidth'] = Math.round((bounds.getCenterX() - pt.x) * 2);
					break;
				default:
					return null;
				}
		};
		
		textHandle.execute = function()
		{
			this.copyStyle('labelWidth');
		}

		textHandle.ignoreGrid = true;

		return [textHandle];
	}

	return _createCustomeHandles.call(this);
};

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
	let legendColor = mxUtils.getValue(this.style, 
		mxMondrianLegend.prototype.cst.LEGEND_COLOR, mxMondrianLegend.prototype.cst.LEGEND_COLOR_DEFAULT).split(':');

	let textColor = mxMondrianBase.prototype.getColor(mxMondrianBase.prototype.CONFIG.COLOR_PALETTE, legendColor[0], mxMondrianBase.prototype.colorIntensity.MEDIUM);
	let strokeColor = mxMondrianBase.prototype.getColor(mxMondrianBase.prototype.CONFIG.COLOR_PALETTE, legendColor[1], mxMondrianBase.prototype.colorIntensity.MEDIUM);
	let fillColor = mxMondrianBase.prototype.getColor(mxMondrianBase.prototype.CONFIG.COLOR_PALETTE, legendColor[2], mxMondrianBase.prototype.colorIntensity.MEDIUM);

	c.translate(x, y);
	c.setFillColor(fillColor);
	c.setStrokeColor(strokeColor);
	c.rect(0, 0, w, h);
	c.fillAndStroke();

	const standardBlack = mxMondrianBase.prototype.getColor(mxMondrianBase.prototype.CONFIG.COLOR_PALETTE, 'black', mxMondrianBase.prototype.colorIntensity.MEDIUM);
	const standardGray = mxMondrianBase.prototype.getColor(mxMondrianBase.prototype.CONFIG.COLOR_PALETTE, 'gray', mxMondrianBase.prototype.colorIntensity.MEDIUM);

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
 * Class: mxMondrianBaseDeploymentUnit
 * Extends <mxShape> to implement shapes that provide a Deployment Unit that is compliant with the Mondrian Design Method
 */
 function mxMondrianBaseDeploymentUnit(bounds, fill, stroke, strokewidth)
 {
	 mxShape.call(this);
	 this.bounds = bounds;
	 this.fill = fill;
	 this.stroke = stroke;
	 this.strokewidth = (strokewidth != null) ? strokewidth : 1;
 };
 
 mxUtils.extend(mxMondrianBaseDeploymentUnit, mxShape);
 
 mxMondrianBaseDeploymentUnit.prototype.cst = 
 {
		 MONDRIAN_DU : 'mxgraph.mondrian.du',
		 SHAPE_TYPE : 'shapeType',
		 SHAPE_TYPE_DEFAULT : 'd',	 
		 DU_COLOR : 'duColor',
		 DU_COLOR_DEFAULT : 'black:noColor:noColor'	
 };
 
 mxMondrianBaseDeploymentUnit.prototype.customProperties = [
	{name:'shapeType', dispName:'Type', type:'enum', defVal:'d',
		enumList:[
			{val:'d', dispName: 'Data'}, {val:'e', dispName: 'Execution'}, {val:'i', dispName: 'Installation'}, {val:'p', dispName: 'Presentation'}, 
			{val:'td', dispName: 'Technical Data'}, {val:'te', dispName: 'Technical Execution'}, {val:'ti', dispName: 'Technical Installation'}, {val:'tp', dispName: 'Technical Presentation'}
		]
	}
 ];
 
// The ShapeVisualDefinition contains all properties that define color of various parts of the Shape
mxMondrianBaseDeploymentUnit.prototype.getShapeVisualDefinition = function (thisShape, shapeType)
{
	// basic colors
	const WHITE = '#ffffff';
	const BLACK = '#000000';

	// VD properties
	let shapeVD = {
		shape: {visible:false, type: shapeType, width: null, height: null, radius: null, leftOffSet: null},
		icon: {visible: false, color: null, size: null, spacing: null, rotate: 0, flipH: false, flipV: false},
		text: {color: null, labelBoundsHeight: 16, labelBoundsOffSetLeft: 24},
	};

	shapeVD.icon.visible = true;
	shapeVD.icon.color = BLACK;
	shapeVD.icon.spacing = 0;
	shapeVD.icon.size = 16;

	return shapeVD;
};

 mxMondrianBaseDeploymentUnit.prototype.init = function(container)
 {
	let mondrianAttributes = ['Element-ID', 'Element-Name'];
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
  mxMondrianBaseDeploymentUnit.prototype.redraw = function()
  {
	 this.shapeType = mxUtils.getValue(this.style, mxMondrianBaseDeploymentUnit.prototype.cst.SHAPE_TYPE, mxMondrianBaseDeploymentUnit.prototype.cst.SHAPE_TYPE_DEFAULT);
	 
	 mxShape.prototype.redraw.apply(this, arguments);
  };
 
  mxMondrianBaseDeploymentUnit.prototype.paintVertexShape = function(c, x, y, w, h)
 {	
	 this.shapeVisualDefinition = mxMondrianBaseDeploymentUnit.prototype.getShapeVisualDefinition(this,this.shapeType);

	 let duColor = mxUtils.getValue(this.style, mxMondrianBaseDeploymentUnit.prototype.cst.DU_COLOR, mxMondrianBaseDeploymentUnit.prototype.cst.DU_COLOR_DEFAULT).split(':');
	 let textColor = mxMondrianBase.prototype.getColor(mxMondrianBase.prototype.CONFIG.COLOR_PALETTE, duColor[0], mxMondrianBase.prototype.colorIntensity.MEDIUM);
	 let strokeColor = mxMondrianBase.prototype.getColor(mxMondrianBase.prototype.CONFIG.COLOR_PALETTE, duColor[1], mxMondrianBase.prototype.colorIntensity.MEDIUM);
	 let fillColor = mxMondrianBase.prototype.getColor(mxMondrianBase.prototype.CONFIG.COLOR_PALETTE, duColor[2], mxMondrianBase.prototype.colorIntensity.MEDIUM);

	 c.translate(x, y);

	 //this.paintLabel(c);
	 c.setFillColor(fillColor);
	 c.setStrokeColor(strokeColor);
	 c.rect(0, 0, w, h);
	 c.fillAndStroke();
	 
	 this.paintIcon(c);
 
	 const standardBlack = mxMondrianBase.prototype.getColor(mxMondrianBase.prototype.CONFIG.COLOR_PALETTE, 'black', mxMondrianBase.prototype.colorIntensity.MEDIUM);
	 const standardGray = mxMondrianBase.prototype.getColor(mxMondrianBase.prototype.CONFIG.COLOR_PALETTE, 'gray', mxMondrianBase.prototype.colorIntensity.MEDIUM);
 
	 fontColor = this.style.fontColor;
	 if(fontColor != textColor && (fontColor === standardBlack || fontColor === standardGray || fontColor === 'undefined'))
	 {
		 this.style.fontColor = textColor;
		 styleCurrent = this.state.view.graph.model.getStyle(this.state.cell);
		 newStyle = mxUtils.setStyle(styleCurrent, 'fontColor', this.style.fontColor);
		 this.state.view.graph.model.setStyle(this.state.cell, newStyle);
	 }
 };
 

 mxMondrianBaseDeploymentUnit.prototype.paintIcon = function(c)
 {
	 let svd = this.shapeVisualDefinition;
	 if(svd.icon.visible)
	 {
		 let positionX = svd.icon.spacing;
		 let positionY = svd.icon.spacing;
 
		 let iconStencilName = this.shapeType;
 
		 // Determine what Icon to show
		 let showStencilIcon = true;
 
		 // Retrieve the stencil from the registry 
		 let iconStencil = null;
		 if(showStencilIcon)
		 {
			 iconStencil = mxStencilRegistry.getStencil(mxMondrianBase.prototype.cst.MONDRIAN_BASE_STENCIL_REGISTRY + 'du_' + iconStencilName);
 
			 if(iconStencil == null) // the iconStencilName cannot be found, so the 'undefined' Icon is retrieved
				 iconStencil = mxStencilRegistry.getStencil(mxMondrianBase.prototype.cst.MONDRIAN_BASE_STENCIL_REGISTRY + 'undefined');
 
			 showStencilIcon = (iconStencil != null); // only show the Icon if a stencil is found
		 }
 
		 if(showStencilIcon)
		 {
			c.save();
			let canvasCenterX = positionX + svd.icon.size/2;
			let canvasCenterY = positionY + svd.icon.size/2;
		
			// rotate icon
			c.rotate(svd.icon.rotate, svd.icon.flipH, svd.icon.flipV, 
				canvasCenterX, canvasCenterY);
			
			c.setStrokeColor('none');
			c.setFillColor(svd.icon.color);
			c.setDashed(false);

			iconStencil.strokewidth = 1;
			iconStencil.drawShape(c, this, positionX, positionY, svd.icon.size, svd.icon.size);	
			 
			 c.restore();
		 }
	 }
 };
 
 mxMondrianBaseDeploymentUnit.prototype.getLabelBounds = function(rect)
 {
	let svd = this.shapeVisualDefinition;
	return new mxRectangle(
					rect.x + svd.text.labelBoundsOffSetLeft * this.scale, 
					rect.y,
					rect.width - (svd.text.labelBoundsOffSetLeft * this.scale),
					svd.text.labelBoundsHeight * this.scale);
 };

/**
 * Mondrian Design Method shape registration
 */
mxCellRenderer.registerShape(mxMondrianBase.prototype.cst.MONDRIAN_BASE_SHAPE, mxMondrianBase);
mxCellRenderer.registerShape(mxMondrianLegend.prototype.cst.MONDRIAN_LEGEND_SHAPE, mxMondrianLegend);
mxCellRenderer.registerShape(mxMondrianBaseDeploymentUnit.prototype.cst.MONDRIAN_DU, mxMondrianBaseDeploymentUnit);

/**
 * IBM Mondrian Design Method shape registration for backward compatibility
 **/
mxIBM2MondrianBase.config = {
	BASE_SHAPE: 'mxgraph.ibm2mondrian.base',
	LEGEND_SHAPE: 'mxgraph.ibm2mondrian.legend',
	DU_SHAPE: 'mxgraph.ibm2mondrian.du',
	BASE_STENCIL_REGISTRY: 'mondrianbase.',
	ICONS_STENCIL_REGISTRY: 'mondrianicons.',
	STYLE: 'IBM',
	TAG_FONT : 'IBM Plex Mono',
	// IBM Design Language Color Definitions https://www.ibm.com/design/language/color/#specifications
	COLOR_PALETTE: {
		red: {light: '#fff1f1', medium: '#fa4d56', dark: '#750e13'}, 		//RED: 		swatch_10, swatch_50, swatch_80
		magenta: {light: '#fff0f7', medium: '#ee5396', dark: '#9f1853'},	//MAGENTA: 	swatch_10, swatch_50, swatch_70
		purple: {light: '#f6f2ff', medium: '#a56eff', dark: '#6929c4'}, 	//PURPLE: 	swatch_10, swatch_50, swatch_70
		cyan: {light: '#e5f6ff', medium: '#1192e8', dark: '#00539a'}, 		//CYAN:	 	swatch_10, swatch_50, swatch_70
		blue: {light: '#edf5ff', medium: '#0f62fe', dark: '#002d9c'}, 		//BLUE: 	swatch_10, swatch_60, swatch_80
		teal: {light: '#d9fbfb', medium: '#009d9a', dark: '#005d5d'},	 	//TEAL: 	swatch_10, swatch_50, swatch_70
		green: {light: '#defbe6', medium: '#24a148', dark: '#0e6027'}, 		//GREEN: 	swatch_10, swatch_50, swatch_70
		yellow: {light: '#fcf4d6', medium: '#b28600', dark: '#684e00'}, 	//YELLOW: 	swatch_10, swatch_50, swatch_70
		orange: {light: '#fff2e8', medium: '#eb6200', dark: '#8a3800'},		//ORANGE: 	swatch_10, swatch_50, swatch_70
		gray: {light: '#f2f4f8', medium: '#697077', dark: '#343a3f'}, 		//GRAY: 	swatch_10, swatch_60, swatch_80
		black: {light: '#f2f4f8', medium: '#000000', dark: '#000000'} 		//BLACK: 	swatch_10, swatch_50, swatch_70
	}
}

/* BASE SHAPE*/
function mxIBM2MondrianBase()
{
	this.CONFIG = mxIBM2MondrianBase.config
};

mxUtils.extend(mxIBM2MondrianBase, mxMondrianBase);	


/* LEGEND SHAPE*/
function mxIBM2MondrianLegend()
{	
	this.CONFIG = mxIBM2MondrianBase.config
};
mxUtils.extend(mxIBM2MondrianLegend, mxMondrianLegend);

/* DU SHAPE*/
function mxIBM2MondrianBaseDeploymentUnit()
{	
	this.CONFIG = mxIBM2MondrianBase.config
};
mxUtils.extend(mxIBM2MondrianBaseDeploymentUnit, mxMondrianBaseDeploymentUnit);

mxCellRenderer.registerShape(mxIBM2MondrianBase.config.BASE_SHAPE, mxIBM2MondrianBase);
mxCellRenderer.registerShape(mxIBM2MondrianBase.config.LEGEND_SHAPE, mxIBM2MondrianLegend);
mxCellRenderer.registerShape(mxIBM2MondrianBase.config.DU_SHAPE, mxIBM2MondrianBaseDeploymentUnit);