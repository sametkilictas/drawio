/**
 * Copyright (c) 2020, Merijn Weiss
 **/

/**
 * Class: mxMondrianShape
 *
 * Extends <mxShape> to implement shapes that are compliant with the Mondrian Design Method
 * 
 * Constructor: mxMondrianShape
 * 
 * Parameters:
 * 
 * bounds - <mxRectangle> that defines the bounds. This is stored in
 * <mxShape.bounds>.
 * fill - String that defines the fill color. This is stored in <fill>.
 * stroke - String that defines the stroke color. This is stored in <stroke>.
 * strokewidth - Optional integer that defines the stroke width. Default is 1
**/
function mxMondrianShape(bounds, fill, stroke, strokewidth)
{
	mxShape.call(this, bounds, fill, stroke, strokewidth);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
	this.defaultStyleString = undefined;
};

/**
 * Extends mxShape.
 */
mxUtils.extend(mxMondrianShape, mxShape);

mxMondrianShape.prototype.cst = {
	MONDRIAN_BASE_SHAPE : 'mxgraph.mondrian.base',

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

	TAG : 'tag',
	TAG_DEFAULT : 'noTag',
	TAG_TEXT : 'tagText',
	TAG_TEXT_DEFAULT : 'Tag-Text',
	TAG_COLOR_FAMILY : 'tagColorFamily',
	TAG_COLOR_FAMILY_DEFAULT : 'black',
	TAG_COLOR_FILL : 'tagColorFill', 
	TAG_COLOR_FILL_DEFAULT : 'medium', 
};

mxMondrianShape.prototype.getTagText = function(thisShape)
{
	let tagTextAttribute = mxUtils.getValue(thisShape.style, mxMondrianShape.prototype.cst.TAG_TEXT, mxMondrianShape.prototype.cst.TAG_TEXT_DEFAULT);

	return (tagTextAttribute === 'noText') ? null : thisShape.state.cell.getAttribute(tagTextAttribute,null)
}

mxMondrianShape.prototype.getColorIntensity = function(colorIntensity, shapePart, shapeType)
{
	const INTENSITY = window.MONDRIAN_CORE.CONFIG.COLOR.INTENSITY;
	if((shapeType === 'pg' || shapeType === 'lg') && shapePart === 'corner')
		return INTENSITY.NO_COLOR;
	else if(shapePart === 'outerLine' || shapePart === 'tagLine')
		return (colorIntensity === INTENSITY.DARK) ? INTENSITY.DARK : INTENSITY.MEDIUM;
	else if(colorIntensity == INTENSITY.VERY_LIGHT)
		return INTENSITY.LIGHT
	else
		return colorIntensity;
}

mxMondrianShape.prototype.getShapeDimensions = function (shapeType, shapeLayout, width, height)
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
			minRectWidth = (shapeType === 'actor' || shapeType === 'bms_ellipse') ? 24 : 96;
			minRectHeight = (shapeType === 'bms_ellipse') ? 24 : 48;
			
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

			lableBoundOffsetLeft = 40;

			if(shapeType === 'actor')
				shapeWidth = 16;
			else
				shapeWidth = 32;
				
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

		shapeHeight = (minRectHeight > shapeHeight) ? minRectHeight : shapeHeight;

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
mxMondrianShape.prototype.getShapeVisualDefinition = function (
							thisShape,
							shapeType, shapeLayout, shapeSubLayout, shapeStyle, shapeMultiplicity, width, height,
							colorFamily, colorFillIcon, colorFillText, colorFillContainer,
							iconImage) {

	const CORE = window.MONDRIAN_CORE;
	const INTENSITY = CORE.CONFIG.COLOR.INTENSITY;

	// class types
	const BASIC = 'basicShape';
	const NORMAL = 'normalShape';

	// basic colors
	const WHITE = '#ffffff';
	const BLACK = '#000000';

	// VD properties
	let shapeVD = {
		class: {type:null},
		config: CORE.CONFIG,
		shape: {visible:false, type: shapeType, layout: shapeLayout, width: null, height: null, radius: null, leftOffSet: null, isPreDefined: ((thisShape.state.cell.getAttribute('repoAttributes','')) != '')},
		style: {type: shapeStyle, color: null},
		multiplicity: {visible: shapeMultiplicity, spacing: null},
		outerLine: {color: null, colorIntensity: null, dashed: (shapeStyle === 'dashed'), secondLine: (shapeStyle === 'double'), secondLineOffSet: null},
		bar: {visible: false, color: null, colorIntensity: null, width: null, height: null},
		corner: {visible: false, color: null, colorIntensity: null, width: null, height: null},
		icon: {visible: false, color: null, size: null, spacing: null, rotate: 0, flipH: false, flipV: false},
		titleBar: {visible: false, color: null,colorIntensity: null},
		text: {color: null, labelBoundsHeight: null, labelBoundsOffSetLeft: null, onDarkBackGround: false},
		dividerLine: {visible: false, color: null, colorIntensity: null},
		container: {visible: false, color: null, colorIntensity: null},
		decorator: {component: {color: WHITE, width: null, height: null, offSet: null}},
		tag: {visible: false, shape: 'circle', fill: {color: null, colorIntensity: null}, line: {color: null, colorIntensity: null}, text: null, textColor: null},
	};

	// if the shape is set to legend some of the style properties get overridden
	shapeVD.shape.type = (shapeVD.shape.layout == 'legend' && (shapeSubLayout != 'shape' && shapeSubLayout != 'shapeAndStyle') && shapeSubLayout != 'icon') ? 'legendBaseItem': shapeVD.shape.type;
	
	shapeVD.class.type = (shapeVD.shape.type.startsWith('bms') ? BASIC : NORMAL);

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
			//colorFillIcon = (colorFillIcon === 'medium' || colorFillIcon === 'dark') ? colorFillIcon : 'medium';
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
	let dimensions = mxMondrianShape.prototype.getShapeDimensions(shapeVD.shape.type, shapeLayout, width, height);

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
	shapeVD.icon.visible = (shapeLayout === 'expanded' || shapeLayout === 'collapsed' || (shapeLayout === 'legend' && shapeSubLayout === 'icon')) && (iconImage != 'noIcon') && (shapeVD.class.type != BASIC);
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
	shapeVD.corner.colorIntensity = this.getColorIntensity(colorFillIcon, 'corner', shapeVD.shape.type);
	shapeVD.corner.visible = shapeVD.shape.visible && (shapeVD.icon.visible || shapeVD.corner.colorIntensity != 'noColor');// && (shapeVD.class.type != BASIC);
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
	shapeVD.dividerLine.visible = false;
	shapeVD.dividerLine.colorIntensity = 'undefined';

	if(thisShape.state.view.graph['mondrianHighlightPredefinedEnabled'])
	{
		colorFamily = (shapeVD.shape.isPreDefined) ? 'green' : 'red';
		shapeVD.corner.colorIntensity = (shapeVD.shape.isPreDefined) ? 'light' : shapeVD.corner.colorIntensity;
	}

	// Get the HEX values for each Shape part
	shapeVD.outerLine.color = CORE.getColor(colorFamily, shapeVD.outerLine.colorIntensity);
	shapeVD.bar.color = CORE.getColor(colorFamily, shapeVD.bar.colorIntensity);
	shapeVD.corner.color = CORE.getColor(colorFamily, shapeVD.corner.colorIntensity);
	shapeVD.titleBar.color = CORE.getColor(colorFamily, shapeVD.titleBar.colorIntensity);
	shapeVD.dividerLine.color = CORE.getColor(colorFamily, shapeVD.dividerLine.colorIntensity);
	shapeVD.container.color = CORE.getColor(colorFamily, shapeVD.container.colorIntensity);

	shapeVD.icon.color = (CORE.isDarkColor(shapeVD.corner.color, shapeVD.corner.colorIntensity)) && shapeVD.corner.visible ?  WHITE : BLACK;

	if(shapeVD.class.type === NORMAL)
	{
		if(shapeLayout === 'collapsed' || shapeLayout === 'legend')
		{
			shapeVD.text.color = (thisShape.style.labelColor) ? thisShape.style.labelColor : 'black';
			shapeVD.text.onDarkBackGround = false;
			shapeVD.text.labelBoundsOffSetLeft = dimensions.lableBoundOffsetLeft;
			shapeVD.style.color = (CORE.isDarkColor(shapeVD.corner.color, shapeVD.corner.colorIntensity)) ?  WHITE : shapeVD.outerLine.color;
	
			if(shapeVD.outerLine.dashed)
				shapeVD.outerLine.secondLine = (CORE.isDarkColor(shapeVD.corner.color, shapeVD.corner.colorIntensity));
		}
		else if (shapeLayout === 'expanded')
		{
			shapeVD.text.color = (thisShape.style.labelColor) ? thisShape.style.labelColor : 'black';
			shapeVD.text.onDarkBackGround = CORE.isDarkColor(shapeVD.titleBar.color, shapeVD.titleBar.colorIntensity);
			shapeVD.text.labelBoundsOffSetLeft = shapeVD.corner.width;
			shapeVD.style.color = shapeVD.outerLine.color;
	
			if(shapeVD.shape.type === 'ts')
			{
				if(shapeVD.style.type === 'strikethrough')
					shapeVD.style.color = (CORE.isDarkColor(shapeVD.corner.color, shapeVD.corner.colorIntensity)) ?  WHITE : shapeVD.outerLine.color;
				else if(shapeVD.outerLine.dashed)
					shapeVD.outerLine.secondLine = (CORE.isDarkColor(shapeVD.corner.color, shapeVD.corner.colorIntensity));
	
				shapeVD.text.labelBoundsOffSetLeft = (shapeVD.icon.visible) ? shapeVD.text.labelBoundsOffSetLeft : 0;
			}
		}
	
		shapeVD.text.labelBoundsHeight = dimensions.titleBarHeight;
	}
	else if(shapeVD.class.type === BASIC)
	{
		shapeVD.text.color = (thisShape.style.labelColor) ? thisShape.style.labelColor : 'black';
		shapeVD.text.onDarkBackGround = 
			(	(thisShape.style.labelPosition === 'center' || thisShape.style.labelPosition === undefined) && 
				(thisShape.style.verticalLabelPosition === 'middle' || thisShape.style.verticalLabelPosition === undefined)) ? CORE.isDarkColor(shapeVD.corner.color, shapeVD.corner.colorIntensity) : false;
		shapeVD.text.labelBoundsOffSetLeft = dimensions.lableBoundOffsetLeft;
		shapeVD.style.color = shapeVD.outerLine.color;
		shapeVD.text.labelBoundsHeight = dimensions.titleBarHeight;
	}

	shapeVD.decorator.component.color = WHITE;
	shapeVD.decorator.component.width = dimensions.decoratorComponentWidth;
	shapeVD.decorator.component.height = dimensions.decoratorComponentHeight;
	shapeVD.decorator.component.offSet = dimensions.decoratorComponentOffset;

	//  tag
	shapeVD.tag.shape = mxUtils.getValue(thisShape.style, mxMondrianShape.prototype.cst.TAG, mxMondrianShape.prototype.cst.TAG_DEFAULT);
	shapeVD.tag.visible = (shapeLayout === 'expanded' || shapeLayout === 'collapsed' || (shapeLayout === 'legend' && shapeSubLayout === 'tag')) && (shapeVD.tag.shape != 'noTag');
	if(shapeVD.tag.visible)
	{
		let tagColorFamily = mxUtils.getValue(thisShape.style, mxMondrianShape.prototype.cst.TAG_COLOR_FAMILY, mxMondrianShape.prototype.cst.TAG_COLOR_FAMILY_DEFAULT);
		let tagColorFill = mxUtils.getValue(thisShape.style, mxMondrianShape.prototype.cst.TAG_COLOR_FILL, mxMondrianShape.prototype.cst.TAG_COLOR_FILL_DEFAULT);
		let tagColorLine = (tagColorFill == INTENSITY.DARK || tagColorFill == INTENSITY.MEDIUM) ? tagColorFill : colorFillIcon;

		shapeVD.tag.fill.colorIntensity = this.getColorIntensity(tagColorFill, 'tag', shapeVD.shape.type);
		shapeVD.tag.fill.color = CORE.getColor(tagColorFamily, shapeVD.tag.fill.colorIntensity);

		shapeVD.tag.line.colorIntensity = this.getColorIntensity(tagColorLine, 'tagLine', shapeVD.shape.type);
		shapeVD.tag.line.color = CORE.getColor(tagColorFamily, shapeVD.tag.line.colorIntensity);

		shapeVD.tag.text = this.getTagText(thisShape);
		shapeVD.tag.textColor = (CORE.isDarkColor(shapeVD.tag.fill.color, shapeVD.tag.fill.colorIntensity)) ?  WHITE : BLACK;
	}

	return shapeVD;
};

mxMondrianShape.prototype.resetStyles()
{
	//let selectedCells = graph.getSelectionCells();
}

mxMondrianShape.prototype.customProperties = [
	{name:'template', dispName: 'Template', type:'dynamicEnum', enumSource:'shapeTemplate', defVal:'noTemplate',
		enumList:[],
		onChange: function(graph, newValue)
		{
			let selectedCells = graph.getSelectionCells();

			for (let i = 0; i < selectedCells.length; i++)
			{	
				graph.setCellStyles('initTemplate', '1', [selectedCells[i]]);

				if(newValue === 'noTemplate')
					graph.setCellStyles('template', null, [selectedCells[i]]);
			}
		}
}	,
	{name:'shapeType', dispName:'Shape', type:'enum', defVal:'pn',
		enumList:[
			{val:'actor', dispName: 'Actor'}, 
			//{val:'ts', dispName: 'Target System'}, 
			{val:'ln', dispName: 'Logical Node'}, 
			{val:'lc', dispName: 'Logical Component'}, 
			{val:'lg', dispName: 'Logical Group'}, 
			{val:'pn', dispName: 'Prescribed Node'}, 
			{val:'pc', dispName: 'Prescribed Component'}, 
			{val:'pg', dispName: 'Prescribed Group'},
			{val:'-', dispName: '----------'},
			{val:'bms_ellipse', dispName: 'Basic (Ellipse)'}],
	},
	{name:'shapeLayout', dispName:'Shape (Layout)', type:'enum', defVal:'expanded',
		enumList:[
			{val:'collapsed', dispName: 'Collapsed', filter:'shapeType:bms_ellipse'},
			{val:'expanded', dispName: 'Expanded', filter:'shapeType:actor'}, 
			{val:'expanded:stackLayout', dispName: 'Expanded (Stack Layout)', filter:'shapeType:actor,bms_ellipse'},
			{val:'legend:color', dispName: 'Legend (Color)'}, {val:'legend:shape', dispName: 'Legend (Shape)'}, {val:'legend:style', dispName: 'Legend (Style)'},
			{val:'legend:icon', dispName: 'Legend (Icon)', filter:'shapeType:bms_ellipse'},
			{val:'legend:tag', dispName: 'Legend (Tag)'},
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
	{name:'shapeMultiplicity', dispName: 'Multiplicity', type: 'bool', defVal: false,
	isVisible: function(state, format)
	{
		let shapeLayout = mxUtils.getValue(state.style, 'shapeType', '');
		return !shapeLayout.startsWith('bms');
	}},
	{name:'colorFamily', dispName:'Color', type:'enum', defVal:'blue',
		enumList:[{val:'blue', dispName: 'Blue'}, {val:'black', dispName: 'Black'}, {val:'cyan', dispName: 'Cyan'}, {val:'green', dispName: 'Green'}, {val:'gray', dispName: 'Gray'}, {val:'magenta', dispName: 'Magenta'}, {val:'purple', dispName: 'Purple'}, {val:'red', dispName: 'Red'}, {val:'teal', dispName: 'Teal'}, {val:'yellow', dispName: 'Yellow'}, {val:'orange', dispName: 'Orange'}]},
	{name:'colorFillIcon', dispName:'Color (Outline)', type:'enum', defVal:'medium',
		enumList:[{val:'noColor', dispName: 'None'}, {val:'white', dispName: 'White'}, {val:'light', dispName: 'Light'}, {val:'medium', dispName: 'Medium'}, {val:'dark', dispName: 'Dark'}]},
	
	{name:'colorBackground', dispName:'Color (Fill)', type:'enum', defVal:'noColor:noColor',
		enumList:[
		{val:'noColor:noColor', dispName: 'None'}, {val:'white:white', dispName: 'White'}, {val:'veryLight:veryLight', dispName: 'Very Light'},
		{val:'white:noColor', dispName: 'Bar: White, Body: None'},
		{val:'veryLight:noColor', dispName: 'Bar: Very Light, Body: None'},
		{val:'veryLight:white', dispName: 'Bar: Very Light, Body: White'}
	],
	isVisible: function(state, format)
	{
		let shapeLayout = mxUtils.getValue(state.style, 'shapeType', '');
		return !shapeLayout.startsWith('bms');
	}},

	{name:'iconImage', dispName:'Icon', type:'enum', defVal:'stencilIcon',
		enumList:[{val:'noIcon', dispName: 'No'}, {val:'stencilIcon', dispName: 'Yes'}, 
		{val:'stencilIcon_Rotate90', dispName: 'Yes (Rotate 90)'}, {val:'stencilIcon_Rotate180', dispName: 'Yes (Rotate 180)'}, {val:'stencilIcon_Rotate270', dispName: 'Yes (Rotate 270)'},
		{val:'stencilIcon_FlipH', dispName: 'Yes (Flip Horizontal)'}, {val:'stencilIcon_FlipV', dispName: 'Yes (Flip Vertical)'},
		],
		isVisible: function(state, format)
        {
			let shapeLayout = mxUtils.getValue(state.style, 'shapeType', '');
        	return !shapeLayout.startsWith('bms');
        }},
	
	// Label
	{name: 'attributesText', dispName: 'Label (Attributes)', type: 'staticArr', subType: 'dynamicEnum', size: '3', subDefVal: 'noText',
		enumList:[{val:'noText', dispName: 'None'}],
		onChange: function(graph, newValue)
		{
			const CORE = window.MONDRIAN_CORE;
			let selectedCells = graph.getSelectionCells();
			
			for (let i = 0; i < selectedCells.length; i++)
			{			
				selectedCells[i].setAttribute('label', CORE.defineLabel(newValue,selectedCells[i]));
			}
		}
	},
	{name:'positionText', dispName:'Label (Position)', type:'enum', defVal:'bottom',
		enumList:[{val:'bottom', dispName: 'Bottom'}, {val:'top', dispName: 'Top'}, {val:'left', dispName: 'Left'}, {val:'right', dispName: 'Right'}],
		isVisible: function(state, format)
        {
        	return mxUtils.getValue(state.style, 'shapeLayout', '') === 'collapsed';
        }
	},
	{name:'labelColor', dispName:'Label (Color)', type:'enum', defVal:'black',
		enumList:[{val:'blue', dispName: 'Blue'}, {val:'black', dispName: 'Black'}, {val:'cyan', dispName: 'Cyan'}, {val:'green', dispName: 'Green'}, {val:'gray', dispName: 'Gray'}, {val:'magenta', dispName: 'Magenta'}, {val:'purple', dispName: 'Purple'}, {val:'red', dispName: 'Red'}, {val:'teal', dispName: 'Teal'}, {val:'yellow', dispName: 'Yellow'}, {val:'orange', dispName: 'Orange'}]},

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
mxMondrianShape.prototype.textSpacing = 4;

/**
 * Variable: textSpacingLeft
 *
 * Default value for text spacing. Default is 16.
 */
 mxMondrianShape.prototype.textSpacingLeft = 16;

/**
 * Function: init
 *
 * Initializes the shape and the <indicator>.
 */
mxMondrianShape.prototype.init = function(container)
{
	if(this.state != null)
	{
		this.cellID = this.state.cell.id;
		this.installListeners();
	}

	mxShape.prototype.init.apply(this, arguments);
};

mxMondrianShape.prototype.installListeners = function()
{
	if (this.changeListener == null)
	{
		this.changeListener = mxUtils.bind(this, function(sender, evt)
		{
			const CORE = window.MONDRIAN_CORE;
			const REPO = window.MONDRIAN_REPO;
			try
			{
				if((evt.properties.change.constructor.name === 'ChangePageSetup') || (evt.properties.change.constructor.name === 'mxValueChange' && (evt.properties.change.cell.id === this.cellID)))
				{
					this.redraw();
				}
				else if(evt.properties.change.constructor.name === 'mxStyleChange' && (evt.properties.change.cell.id === this.cellID))
				{
					const styleCurrent = evt.properties.change.style;

					const isMondrianShape = (styleCurrent.indexOf(mxMondrianShape.prototype.cst.MONDRIAN_BASE_SHAPE) > 0);
					if(isMondrianShape)
					{
						let repoAttributes = REPO.getAttributesFromRepo(this.state, 'Element-ID');
						CORE.updateStyle(this.state, repoAttributes.repoFormatSettings, this.defaultStyleString);

						const stylePrevious = evt.properties.change.previous;
	
						const shapeTypeCurrent = CORE.getStyleValue(styleCurrent, mxMondrianShape.prototype.cst.SHAPE_TYPE);
						const shapeTypePrevious = CORE.getStyleValue(stylePrevious, mxMondrianShape.prototype.cst.SHAPE_TYPE);
	
						var shapeLayoutCurrent = CORE.getStyleValue(styleCurrent, mxMondrianShape.prototype.cst.SHAPE_LAYOUT).split(':')[0];
						const shapeLayoutPrevious = CORE.getStyleValue(stylePrevious, mxMondrianShape.prototype.cst.SHAPE_LAYOUT).split(':')[0];

						const shapeSubLayoutCurrent = CORE.getStyleValue(styleCurrent, mxMondrianShape.prototype.cst.SHAPE_LAYOUT).split(':')[1];
						const shapeSubLayoutPrevious = CORE.getStyleValue(stylePrevious, mxMondrianShape.prototype.cst.SHAPE_LAYOUT).split(':')[1];

						const positionTextCurrent = CORE.getStyleValue(styleCurrent, mxMondrianShape.prototype.cst.POSITION_TEXT);
						const positionTextPrevious = CORE.getStyleValue(stylePrevious, mxMondrianShape.prototype.cst.POSITION_TEXT);
	
						const iconImageCurrent = CORE.getStyleValue(styleCurrent, mxMondrianShape.prototype.cst.ICON_IMAGE);
						const iconImagePrevious = CORE.getStyleValue(stylePrevious, mxMondrianShape.prototype.cst.ICON_IMAGE);
	
						var styleMustUpdate = (shapeTypeCurrent != shapeTypePrevious) || (shapeLayoutCurrent != shapeLayoutPrevious || (positionTextCurrent != positionTextPrevious) || iconImageCurrent != iconImagePrevious || shapeSubLayoutCurrent != shapeSubLayoutPrevious);
						
						if(styleMustUpdate)
						{
							// Define the new style
							var styleNew = styleCurrent;
							var updatedStyle = mxMondrianShape.prototype.setStyle(styleNew, shapeTypeCurrent, shapeLayoutCurrent, positionTextCurrent, iconImageCurrent);

							styleNew = updatedStyle.style;
							shapeLayoutCurrent = updatedStyle.shapeLayout;
							styleMustUpdate = mxMondrianShape.prototype.cellMustRestyle(styleCurrent, styleNew);
						}
						
						var geoMustUpdate = (shapeTypeCurrent != shapeTypePrevious) || (shapeLayoutCurrent != shapeLayoutPrevious);
						if(geoMustUpdate)
						{
							//Define the new Geometery
							const geoCurrent = evt.properties.change.cell.geometry;
							var newRect = mxMondrianShape.prototype.getRectangle(
								new mxRectangle(geoCurrent.x, geoCurrent.y, geoCurrent.width, geoCurrent.height), 
									shapeTypeCurrent, shapeLayoutCurrent);
					
							geoMustUpdate = mxMondrianShape.prototype.cellMustResize(geoCurrent, newRect);
						}
	
						if(styleMustUpdate || geoMustUpdate)
						{
							this.state.view.graph.model.beginUpdate();
							try
							{				
								if(styleMustUpdate)
									this.state.view.graph.model.setStyle(this.state.cell, styleNew);
									
								if(geoMustUpdate)
									this.state.view.graph.model.setGeometry(this.state.cell, 
										new mxGeometry(newRect.x, newRect.y, newRect.width, newRect.height));
							}
							finally
							{
								this.state.view.graph.model.endUpdate();
							}
						}
						this.redraw();
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

/**
 * Function: redraw
 *
 * Reconfigures this shape. This will update the attributes of the Shape.
 */
mxMondrianShape.prototype.redraw = function()
{
	this.shapeType = mxUtils.getValue(this.style, mxMondrianShape.prototype.cst.SHAPE_TYPE, mxMondrianShape.prototype.cst.SHAPE_TYPE_DEFAULT);	
	
	let shapeLayout = mxUtils.getValue(this.style, mxMondrianShape.prototype.cst.SHAPE_LAYOUT, mxMondrianShape.prototype.cst.SHAPE_LAYOUT_DEFAULT).split(':');;
	this.shapeLayout = shapeLayout[0];
	this.shapeSubLayout = shapeLayout[1];

	this.shapeStyle = mxUtils.getValue(this.style, mxMondrianShape.prototype.cst.SHAPE_STYLE, mxMondrianShape.prototype.cst.SHAPE_STYLE_DEFAULT);
	this.shapeMultiplicity = mxUtils.getValue(this.style, mxMondrianShape.prototype.cst.SHAPE_MULTIPLICITY, mxMondrianShape.prototype.cst.SHAPE_MULTIPLICITY_DEFAULT);
	this.iconImage = mxUtils.getValue(this.style, mxMondrianShape.prototype.cst.ICON_IMAGE, mxMondrianShape.prototype.cst.ICON_IMAGE_DEFAULT);
	this.colorFamily = mxUtils.getValue(this.style, mxMondrianShape.prototype.cst.COLOR_FAMILY, mxMondrianShape.prototype.cst.COLOR_FAMILY_DEFAULT);
	this.colorFillIcon = mxUtils.getValue(this.style, mxMondrianShape.prototype.cst.COLOR_FILL_ICON, mxMondrianShape.prototype.cst.COLOR_FILL_ICON_DEFAULT);
	
	let colorFillBackground = mxUtils.getValue(this.style, mxMondrianShape.prototype.cst.COLOR_FILL_BACKGROUND, mxMondrianShape.prototype.cst.COLOR_FILL_BACKGROUND_DEFAULT).split(':');
	this.colorFillText = colorFillBackground[0];
	this.colorFillContainer = colorFillBackground[1];

	this.positionText = mxUtils.getValue(this.style, mxMondrianShape.prototype.cst.POSITION_TEXT, mxMondrianShape.prototype.cst.POSITION_TEXT_DEFAULT);
	
	mxShape.prototype.redraw.apply(this, arguments);
};

mxMondrianShape.prototype.cellMustResize = function(currentGeo, newGeo)
{
	if(currentGeo.width != newGeo.width)
		return true;
	else if(currentGeo.height != newGeo.height)
		return true;
	else
		return false;
}

mxMondrianShape.prototype.cellMustRestyle = function(currentStyle, newStyle)
{
	return newStyle != currentStyle;
}

mxMondrianShape.prototype.paintVertexShape = function(c, x, y, w, h)
{
	this.shapeVisualDefinition = mxMondrianShape.prototype.getShapeVisualDefinition(
		this,
		this.shapeType, this.shapeLayout, this.shapeSubLayout, this.shapeStyle, this.shapeMultiplicity, w, h,
		this.colorFamily, this.colorFillIcon, this.colorFillText, this.colorFillContainer,
		this.iconImage);

	const CORE = window.MONDRIAN_CORE;
	const REPO = window.MONDRIAN_REPO;

	CORE.addAttributes(this, 'mxMondrianShape', this.shapeVisualDefinition.text.color, this.shapeVisualDefinition.text.onDarkBackGround);
	let repoAttributes = REPO.getAttributesFromRepo(this.state, 'Element-ID');
	CORE.updateStyle(this.state, repoAttributes.repoFormatSettings, this.defaultStyleString);

	c.translate(x, y);

	this.paintContainer(c);
	this.paintTitleBar(c);
	this.paintCorner(c);
	this.paintIcon(c);
	this.paintShape(c);
	this.paintTag(c);
};

/**
 * Shape declaration for all Shapes
**/
mxMondrianShape.prototype.paintActor = function(c, width, offSet = 0)
{
	c.ellipse(offSet, offSet, width-offSet*2, width-offSet*2); 
}

mxMondrianShape.prototype.paintTS = function(c, width, height, radius, offSet = 0, leftShift = 0)
{
	c.begin();
	c.moveTo(radius + leftShift, offSet);
	c.lineTo(width - radius + leftShift, offSet);
	c.arcTo(radius - offSet, radius - offSet, 0, 0, 1, width - radius + leftShift, height - offSet);
	c.lineTo(radius + leftShift, height - offSet);
	c.arcTo(radius - offSet, radius - offSet, 0, 0, 1, radius + leftShift, offSet);
	c.close();
}

mxMondrianShape.prototype.paintLG = function(c, width, height, radius, offSet = 0)
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

mxMondrianShape.prototype.paintRoundRect = function(c, width, height, radius, offSet = 0)
{
	c.roundrect(offSet, offSet, width - offSet*2, height - offSet*2, radius - offSet, radius - offSet);
}

mxMondrianShape.prototype.paintRect = function(c, width, height, offSet = 0)
{
	c.rect(offSet, offSet, width - offSet*2, height - offSet*2);
}

/**
 * Shape declaration for all Basic Shapes
**/
mxMondrianShape.prototype.paintEllipse = function(c, width, height, offSet = 0)
{
	c.ellipse(offSet, offSet, width-offSet*2, height-offSet*2); 
}

/*
 * STEP 1: paintContainer
 */
mxMondrianShape.prototype.paintContainer = function(c)
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

/*
 * STEP 2: paintTitleBar
 */
mxMondrianShape.prototype.paintTitleBar = function(c)
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

/*
 * STEP 3: paintCorner
 */
mxMondrianShape.prototype.paintCorner = function(c)
{
	let svd = this.shapeVisualDefinition; 
	if(svd.corner.visible)
	{
		const doubleStyleOffset = (svd.outerLine.secondLine) ? svd.outerLine.secondLineOffSet : 0;
		c.setFillColor(svd.corner.color);

		if(svd.shape.type === 'actor')
		{
			mxMondrianShape.prototype.paintActor(c, svd.shape.width, doubleStyleOffset);
		}
		else if(svd.shape.type === 'ts')
		{
			mxMondrianShape.prototype.paintTS(c, svd.shape.width, svd.corner.height, svd.shape.radius, doubleStyleOffset, svd.shape.leftOffSet);
		}
		else if(svd.shape.type === 'ln' || svd.shape.type === 'lc')
		{
			if(svd.shape.layout === 'collapsed' || svd.shape.layout === 'legend')
			{
				mxMondrianShape.prototype.paintRoundRect(c, svd.shape.width, svd.shape.height, svd.shape.radius, doubleStyleOffset);
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
		else if(svd.shape.type === 'bms_ellipse')
		{
			mxMondrianShape.prototype.paintEllipse(c, svd.shape.width, svd.shape.height, doubleStyleOffset);
		}
		else
		{
			mxMondrianShape.prototype.paintRect(c, svd.corner.width, svd.corner.height, doubleStyleOffset);
		}
		
		c.fill();
	}
};

/*
 * STEP 5: paintShape
 */
mxMondrianShape.prototype.paintShape = function(c)
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
				mxMondrianShape.prototype.paintActor(c, svd.shape.width, doubleStyleOffset/2);
			else if(svd.shape.type === 'ts')
				mxMondrianShape.prototype.paintTS(c, svd.shape.width, svd.shape.height, svd.shape.radius, doubleStyleOffset/2, svd.shape.leftOffSet);
			else if(svd.shape.type === 'ln' || svd.shape.type === 'lc')
				mxMondrianShape.prototype.paintRoundRect(c, svd.shape.width, svd.shape.height, svd.shape.radius, doubleStyleOffset/2);
			else if(svd.shape.type === 'lg')
				mxMondrianShape.prototype.paintLG(c, svd.shape.width, svd.shape.height, svd.shape.radius, doubleStyleOffset/2);
			else if(svd.shape.type === 'bms_ellipse')
				mxMondrianShape.prototype.paintEllipse(c, svd.shape.width, svd.shape.height, doubleStyleOffset/2);
			else
				mxMondrianShape.prototype.paintRect(c, svd.shape.width, svd.shape.height, doubleStyleOffset/2);
			
			c.stroke();

			// DOUBLE LINE
			c.setStrokeWidth(1);
			c.setStrokeColor(svd.outerLine.color);			

			if(svd.shape.type === 'actor')
				mxMondrianShape.prototype.paintActor(c, svd.shape.width, doubleStyleOffset);
			else if(svd.shape.type === 'ts')
				mxMondrianShape.prototype.paintTS(c, svd.shape.width, svd.shape.height, svd.shape.radius, doubleStyleOffset, svd.shape.leftOffSet);
			else if(svd.shape.type === 'ln' || svd.shape.type === 'lc')
				mxMondrianShape.prototype.paintRoundRect(c, svd.shape.width, svd.shape.height, svd.shape.radius, doubleStyleOffset);
			else if(svd.shape.type === 'lg')
				mxMondrianShape.prototype.paintLG(c, svd.shape.width, svd.shape.height, svd.shape.radius, doubleStyleOffset);
			else if(svd.shape.type === 'bms_ellipse')
				mxMondrianShape.prototype.paintEllipse(c, svd.shape.width, svd.shape.height, doubleStyleOffset);
			else
				mxMondrianShape.prototype.paintRect(c, svd.shape.width, svd.shape.height, doubleStyleOffset);
				
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
			mxMondrianShape.prototype.paintActor(c, svd.shape.width);
		else if(svd.shape.type === 'ts')
			mxMondrianShape.prototype.paintTS(c, svd.shape.width, svd.shape.height, svd.shape.radius, 0, svd.shape.leftOffSet);
		else if(svd.shape.type === 'ln' || svd.shape.type === 'lc')
			mxMondrianShape.prototype.paintRoundRect(c, svd.shape.width, svd.shape.height, svd.shape.radius);
		else if(svd.shape.type === 'lg')
			mxMondrianShape.prototype.paintLG(c, svd.shape.width, svd.shape.height, svd.shape.radius);
		else if(svd.shape.type === 'bms_ellipse')
			mxMondrianShape.prototype.paintEllipse(c, svd.shape.width, svd.shape.height);
		else
			mxMondrianShape.prototype.paintRect(c, svd.shape.width, svd.shape.height);

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
				let angle = 135;
				let leftCoordinate = mxMondrianShape.prototype.getCoordinateOnCircle(angle, svd.shape.radius, svd.shape.radius, svd.shape.radius);
				leftCornerX = leftCoordinate.x;
				leftCornerY = leftCoordinate.y;

				angle = 315;
				let rightCoordinate = mxMondrianShape.prototype.getCoordinateOnCircle(angle, svd.shape.radius, svd.shape.radius, svd.shape.radius);
				rightCornerX = rightCoordinate.x;
				rightCornerY = rightCoordinate.y;
			}
			else if(svd.shape.type === 'ts')
			{
				if(svd.shape.layout === 'collapsed' || svd.shape.layout === 'legend')
				{
					let angle = 125;
					let leftCoordinate = mxMondrianShape.prototype.getCoordinateOnCircle(angle, svd.shape.radius, svd.shape.radius, svd.shape.radius);
					leftCornerX = leftCoordinate.x;
					leftCornerY = leftCoordinate.y;
	
					angle = 305;
					let h = (svd.shape.layout === 'collapsed') ? 40 : 10;
					let rightCoordinate = mxMondrianShape.prototype.getCoordinateOnCircle(angle, h, svd.shape.radius, svd.shape.radius);
					rightCornerX = rightCoordinate.x;
					rightCornerY = rightCoordinate.y;	
				}
				else
				{
					leftCornerX = svd.shape.radius;
					rightCornerX = rightCornerX - svd.shape.radius;
				}

			}
			else if(svd.shape.type === 'ln' || svd.shape.type === 'lc' || svd.shape.type === 'lg')
			{
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
					let angle = 135;
					let leftCoordinate = mxMondrianShape.prototype.getCoordinateOnCircle(angle, svd.shape.radius);
					leftCornerX = leftCoordinate.x;
					leftCornerY = leftCoordinate.y;
				}
				
				if(svd.dividerLine.visible)
				{
					//do nothing
				}
				else
				{
					let h = (svd.shape.layout === 'expanded' || svd.shape.layout === 'collapsed') ? rightCornerX - 8 : 12;
					let k = (svd.shape.layout === 'expanded' || svd.shape.layout === 'collapsed') ? rightCornerY - 8 : 12;
					let r = svd.shape.radius; // radius of circle

					angle = 315;
					let rightCoordinate = mxMondrianShape.prototype.getCoordinateOnCircle(angle, h, k, r);
					rightCornerX = rightCoordinate.x;
					rightCornerY = rightCoordinate.y;	
				}
			}
			else if(svd.shape.type === 'pg')
			{
				leftCornerX = svd.bar.width;
				rightCornerY = svd.shape.height;
			}
			else if(svd.shape.type === 'bms_ellipse')
			{
				let angle = 45;
				let leftCoordinate = mxMondrianShape.prototype.getCoordinateOnEllipse(angle, svd.shape.width/2, svd.shape.height/2, svd.shape.width/2, svd.shape.height/2);
				leftCornerX = leftCoordinate.x;
				leftCornerY = leftCoordinate.y;

				angle = 225;
				let rightCoordinate = mxMondrianShape.prototype.getCoordinateOnEllipse(angle, svd.shape.width/2, svd.shape.height/2, svd.shape.width/2, svd.shape.height/2);
				rightCornerX = rightCoordinate.x;
				rightCornerY = rightCoordinate.y;
			}

			c.moveTo(leftCornerX, leftCornerY);
			c.lineTo(rightCornerX, rightCornerY);
			c.stroke();
		}
	}
};

/*
 * STEP 6: paintTag
 */
mxMondrianShape.prototype.paintTag = function(c)
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

		if(svd.shape.layout === 'legend')
			rightTagX = tagWidth;
		else 
			rightTagX = svd.shape.width - tagSpaceRight;

		if(svd.shape.layout === 'legend')
		{
			let minimalTextStart = 15 + extraTextWidth + 8;
			svd.text.labelBoundsOffSetLeft = (svd.text.labelBoundsOffSetLeft < minimalTextStart) ? minimalTextStart : svd.text.labelBoundsOffSetLeft;
		}
			
		
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

mxMondrianShape.prototype.paintShapeMultiplicity = function(c)
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
 * STEP 4: paintIcon
 * 
 * Generic background painting implementation.
 * Two options are provide to show an Icon:
 * 	  1) Via a Stencil, where the Icon-Name data attribute must contain the name of the shape available in the Stencil
 *    2) Via the image style property
 * 
 * Option 2 is deprecated and will be removed in future. If both options are used on the same Shape, the Stencil Icon is used 
 */
mxMondrianShape.prototype.iconScalingFactor = function(iconWidth, iconHeight, boxSize)
{
	return boxSize/(Math.max(iconWidth, iconHeight));
}

mxMondrianShape.prototype.paintIcon = function(c)
{
	let svd = this.shapeVisualDefinition;
	if(svd.icon.visible)
	{
		let iconStencilName = this.state.cell.getAttribute('Icon-Name',null) || 'icon-undefined';
		let iconImageStyle = this.image || 'undefined';

		// Determine what Icon to show
		let showStencilIcon = true;
		let stencilIconIsUndefined = (iconStencilName == 'icon-undefined');

		let showImageIcon = (iconImageStyle != null && iconImageStyle != '' && iconImageStyle != 'undefined');
		
		// Retrieve the stencil from the registry 
		let iconStencil = null;
		if(showStencilIcon)
		{
			let iconName = window.MONDRIAN_REPO.MONDRIAN_ICONS_STENCIL_REGISTRY + iconStencilName;
			
			if(window.MONDRIAN_REPO.hasStencil(iconName))
				iconStencil = mxStencilRegistry.getStencil(window.MONDRIAN_REPO.getStencil(iconName));
			
			if(iconStencil == null) // try an alias
			{
				iconName = iconStencilName;

				if(window.MONDRIAN_REPO.hasStencil(iconName))
					iconStencil = mxStencilRegistry.getStencil(window.MONDRIAN_REPO.getStencil(iconName));
			}
			
			if(iconStencil == null) // the iconStencilName cannot be found, so the 'notfound' Icon is retrieved
			{
				iconName = window.MONDRIAN_REPO.MONDRIAN_BASE_STENCIL_REGISTRY + 'notfound';
				iconStencil = mxStencilRegistry.getStencil(window.MONDRIAN_REPO.getStencil(iconName));

				stencilIconIsUndefined = true;
			}

			showStencilIcon = (iconStencil != null); // only show the Icon if a stencil is found
		}

		// Make final call what Icon to show
		if(showStencilIcon && !stencilIconIsUndefined) // stencil is found and it is not the 'undefined' stencil -> never use the Image Style
			showImageIcon = false;
		else if(showStencilIcon && stencilIconIsUndefined && showImageIcon) // stencil is found, but it is the 'undefined stencil and there is an Image Style set -> use the Image Style
			showStencilIcon = false;
		
		showStencilIcon = true; // TODO: remove the image selection. It is not used anymore.
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
mxMondrianShape.prototype.setStyle = function(style, shapeType, shapeLayout, positionText, iconImage)
{	
	let classType = (shapeType.startsWith('bms')) ? 'basicShape' : 'normalShape';
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
	else if(classType === 'basicShape')
	{
		if(shapeLayout === 'collapsed')
		{
			shapeLayout = 'expanded';
			style = mxUtils.setStyle(style, 'shapeLayout', shapeLayout);
		}
	}

	if(classType === 'basicShape')
	{
		shapeStyle.verticalLabelPosition = null;
		shapeStyle.labelPosition = null;
		shapeStyle.verticalAlign = null;
		shapeStyle.align = null;
		shapeStyle.spacingLeft = 0;
		shapeStyle.spacingRight = 0;
		shapeStyle.spacing = 0;
		shapeStyle.spacingTop = 0;
		shapeStyle.spacingBottom = 0;
		style = mxUtils.setStyle(style, mxConstants.STYLE_LABEL_WIDTH, null); // remove the label width since this is controlled by the bounding box
		shapeStyle.positionText = null;
	}
	else if(classType === 'normalShape')
	{
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
	}

	if(shapeLayout === 'legend')
	{
		shapeStyle.verticalLabelPosition = null;
		shapeStyle.labelPosition = null;
		shapeStyle.verticalAlign = null;
		shapeStyle.align = mxConstants.ALIGN_LEFT;
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
mxMondrianShape.prototype.getRectangle = function(rect, shapeType, shapeLayout)
{
	if(shapeType != null)
	{
		let dimensions = mxMondrianShape.prototype.getShapeDimensions(shapeType, shapeLayout, rect.width, rect.height);

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
mxMondrianShape.prototype.getLabelBounds = function(rect)
{
	let svd = this.shapeVisualDefinition;

	if(svd.class.type === 'basicShape' && svd.shape.layout != 'legend')
	{
		return rect;
	}
	else
	{
		let newRect = new mxRectangle(
			rect.x + svd.text.labelBoundsOffSetLeft * this.scale, 
			rect.y,
			rect.width - (svd.text.labelBoundsOffSetLeft * this.scale),
			svd.text.labelBoundsHeight * this.scale);

		return newRect;
	}
};

mxMondrianShape.prototype.getCoordinateOnCircle = function(angle, h = 0.5, k = 0.5, r = 0.5)
{
	let x = h + r*Math.cos(angle * (Math.PI/180));
	let y = k - r*Math.sin(angle * (Math.PI/180));

	return {x: x, y: y};
}

mxMondrianShape.prototype.getCoordinateOnEllipse = function(angle, h = 0.5, k = 0.5, rx = 0.5, ry = 0.5)
{
	let t = Math.tan(angle / 360 * Math.PI);
	let px = rx * (1 - t ** 2) / (1 + t ** 2),
	py = ry * 2 * t / (1 + t ** 2);

	return {x: px + h, y: py + k};
}

/**
 * Function: getConstraints
 * 
 * Returns the Connection Constraints for the shape.
 */
mxMondrianShape.prototype.getConstraints = function(style, w, h)
{
	let svd = this.shapeVisualDefinition;

	if(svd.shape.layout === 'legend')
		return null;

	var constr = [];

	if(svd.shape.type === 'actor')
	{
		var step = 30;
		for(var angle=0;  angle < 360;  angle+=step)
		{ 
			let coordinate = mxMondrianShape.prototype.getCoordinateOnCircle(angle);
			constr.push(new mxConnectionConstraint(new mxPoint(coordinate.x,coordinate.y), false));
		}
	}
	else if(svd.shape.type === 'bms_ellipse')
	{
		var step = 360/8;
		for(var angle=0;  angle < 360;  angle+=step)
		{ 
			let coordinate = mxMondrianShape.prototype.getCoordinateOnEllipse(angle);
			constr.push(new mxConnectionConstraint(new mxPoint(coordinate.x,coordinate.y), false));
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

mxMondrianShape.prototype.destroy = function()
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

	if(this.state.style['shape'] === mxMondrianShape.prototype.cst.MONDRIAN_BASE_SHAPE)
	{
		const shapeType = mxUtils.getValue(this.state.style, mxMondrianShape.prototype.cst.SHAPE_TYPE, mxMondrianShape.prototype.cst.SHAPE_TYPE_DEFAULT);
		const shapeLayout = mxUtils.getValue(this.state.style, mxMondrianShape.prototype.cst.SHAPE_LAYOUT, mxMondrianShape.prototype.cst.SHAPE_LAYOUT_DEFAULT).split(':')[0];
		rect = mxMondrianShape.prototype.getRectangle(rect, shapeType, shapeLayout);
	}

	return rect;
};

let _createCustomeHandles = mxVertexHandler.prototype.createCustomHandles;
mxVertexHandler.prototype.createCustomHandles = function()
{
	if(this.state.style['shape'] === mxMondrianShape.prototype.cst.MONDRIAN_BASE_SHAPE)
	{
		// Implements the handle for the first divider
		var cursor = 'ew-resize'
		var textHandle = new mxHandle(this.state, cursor);
		
		textHandle.getPosition = function(bounds)
		{
			var labelWidth = Math.max(48, parseFloat(mxUtils.getValue(this.state.style, 'labelWidth', 100)));
						
			switch(mxUtils.getValue(this.state.style, 'positionText', null)) {
				case 'left':
					return new mxPoint(bounds.x - labelWidth - mxMondrianShape.prototype.textSpacing, bounds.getCenterY());
				case 'right':
					return new mxPoint(bounds.x + bounds.width + labelWidth + mxMondrianShape.prototype.textSpacing, bounds.getCenterY());
				case 'top':
					return new mxPoint(bounds.getCenterX() - labelWidth/2, bounds.y - mxMondrianShape.prototype.textSpacing);
				case 'bottom':
					return new mxPoint(bounds.getCenterX() - labelWidth/2, bounds.y + bounds.height + mxMondrianShape.prototype.textSpacing);
				default:
					return null;
				}
		};
		
		textHandle.setPosition = function(bounds, pt)
		{		
			switch(mxUtils.getValue(this.state.style, 'positionText', null)) {
				case 'left':
					this.state.style['labelWidth'] = Math.round(bounds.x - pt.x - mxMondrianShape.prototype.textSpacing);
					break;
				case 'right':
					this.state.style['labelWidth'] = Math.round(pt.x - bounds.x - bounds.width - mxMondrianShape.prototype.textSpacing);
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
 * Mondrian Design Method shape registration
 */
mxCellRenderer.registerShape(mxMondrianShape.prototype.cst.MONDRIAN_BASE_SHAPE, mxMondrianShape);
