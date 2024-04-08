/**
 * Class: mxMondrianConnector
 * Extends <mxArrowConnector> to implement connectors that connect Mondrian Shapes
 */
function mxMondrianConnector()
{
	mxConnector.call(this);
	this.defaultStyleString = 'jumpStyle=line;jumpSize=8;endArrow=none;startArrow=none;metaEdit=1';
};

mxUtils.extend(mxMondrianConnector, mxConnector);

mxMondrianConnector.prototype.cst = 
{
	MONDRIAN_CONNECTOR : 'mxgraph.mondrian.connector',
	COLOR_FAMILY_LINE : 'colorFamilyLine',
	COLOR_FAMILY_LINE_DEFAULT : 'black',
	COLOR_INTENSITY_LINE : 'colorIntensityLine',
	COLOR_INTENSITY_LINE_DEFAULT : 'medium',

	ATTRIBUTES_TEXT : 'attributesText',

	EDGE_LABEL_1: 'edgeLabel1',
	EDGE_LABEL_2: 'edgeLabel2',
	EDGE_LABEL_ATTRIBUTES: 'edgeLabelAttributes',
	EDGE_LABEL_1_ATTRIBUTES: 'edgeLabel1Attributes',
	EDGE_LABEL_2_ATTRIBUTES: 'edgeLabel2Attributes',

	EDGE_CHILD: 'edgeChild'
};


// FUNCTIONS
mxMondrianConnector.prototype.init = function(container)
{
	if(this.state != null)
	{
		this.cellID = this.state.cell.id;
		this.installListeners();
	}
	mxConnector.prototype.init.apply(this, arguments);
}

mxMondrianConnector.prototype.installListeners = function()
{
	if (this.changeListener == null)
	{
		this.changeListener = mxUtils.bind(this, function(sender, evt)
		{
			const REPO = window.MONDRIAN_REPO;

			try
			{
				if(evt.properties.change.constructor.name === 'ChangePageSetup')
				{
					this.paintLine();
				}
				else if(
					(evt.properties.change.constructor.name === 'mxValueChange' || evt.properties.change.constructor.name === 'mxStyleChange')
					&& (evt.properties.change.cell.id === this.cellID))
				{
					if(this.state != null)
					{
						REPO.setAttributesFromRepo(this.state, 'Interface-ID');
						this.paintLine();
					}				
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

mxMondrianConnector.prototype.setEdgeLabel = function(graph, cell, edgeChild)
{
	const CORE = window.MONDRIAN_CORE;
	let isChild1 = false;
	let isChild2 = false;

	if(cell.children != undefined)
	{
		for (let c = 0; c < cell.children.length; c++)
		{
			let child = cell.children[c];
			let edgeChildNumber = CORE.getStyleValue(child.style, mxMondrianConnector.prototype.cst.EDGE_CHILD, undefined);

			isChild1 = (isChild1 || (edgeChildNumber == 1));
			isChild2 = (isChild2 || (edgeChildNumber == 2));
		}
	}

	if( (edgeChild === mxMondrianConnector.prototype.cst.EDGE_LABEL_1 && !isChild1) || (edgeChild === mxMondrianConnector.prototype.cst.EDGE_LABEL_2 && !isChild2))
		mxMondrianConnector.prototype.createEdgeLabel(graph, graph.view.getState(cell), edgeChild);
}

mxMondrianConnector.prototype.createEdgeLabel = function(graph, cellState, edgeChild)
{
	let edgeLabelSettings = {};
	let edgeChildNumber = 0;

	if(edgeChild === mxMondrianConnector.prototype.cst.EDGE_LABEL_1)
	{
		edgeLabelSettings['x'] = -0.75;
		edgeChildNumber = 1;
	}
	else if(edgeChild === mxMondrianConnector.prototype.cst.EDGE_LABEL_2)
	{
		edgeLabelSettings['x'] = 0.75;
		edgeChildNumber = 2;
	}
	else
	{
		edgeLabelSettings['x'] = 0;
	}
	
	let edgeLabel = graph.addText(cellState.x, cellState.y, cellState, edgeLabelSettings);
	graph.setCellStyles('edgeChild', edgeChildNumber, [edgeLabel]);

	return edgeLabel;
}

mxMondrianConnector.prototype.paintEdgeShape = function(c, pts)
{	
	let labelColor = this.state.style.labelColor;
	window.MONDRIAN_CORE.addAttributes(this, 'mxMondrianConnector', ((labelColor) ? labelColor : 'black'));

	mxMondrianConnector.prototype.addEdgeLabels(this);

	mxConnector.prototype.paintEdgeShape.apply(this, arguments);
}

mxMondrianConnector.prototype.paintLine = function(c, pts)
{
	if(this.state != null)
	{ 
		let repoAttributes = window.MONDRIAN_REPO.getAttributesFromRepo(this.state, 'Interface-ID');
		window.MONDRIAN_CORE.updateStyle(this.state, repoAttributes.repoFormatSettings, this.defaultStyleString);

		if(window.MONDRIAN_CORE.getStyleValue(this.state.cell.style, 'edgeLabel1Attributes', undefined) != undefined)
			mxMondrianConnector.prototype.setEdgeLabel(this.state.view.graph, this.state.cell, mxMondrianConnector.prototype.cst.EDGE_LABEL_1);

		if(window.MONDRIAN_CORE.getStyleValue(this.state.cell.style, 'edgeLabel2Attributes', undefined) != undefined)
			mxMondrianConnector.prototype.setEdgeLabel(this.state.view.graph, this.state.cell, mxMondrianConnector.prototype.cst.EDGE_LABEL_2);

	}

	mxConnector.prototype.paintLine.apply(this, arguments);
}

mxMondrianConnector.prototype.addEdgeLabels = function(connector)
{
	if(connector.state != null && connector.state.cell != null && connector.state.view.getState(connector.state.cell) != null)
	{
		const CORE = window.MONDRIAN_CORE;
		let cell = connector.state.cell;
		let cellState = connector.state.view.getState(cell);

		if(cellState.cell.children != undefined)
		{
			let parent = cellState.cell;

			let el1Child = CORE.getStyleValue(parent.style, mxMondrianConnector.prototype.cst.EDGE_LABEL_1, undefined);
			let el2Child = CORE.getStyleValue(parent.style, mxMondrianConnector.prototype.cst.EDGE_LABEL_2, undefined);

			for (let c = 0; c < cellState.cell.children.length; c++)
			{
				let child = cellState.cell.children[c];

				let isChild1 = false;
				let isChild2 = false;

				let edgeChild = CORE.getStyleValue(child.style, mxMondrianConnector.prototype.cst.EDGE_CHILD, undefined);

				if(edgeChild == undefined || edgeChild == 'undefined') // CLEANUP OF OLD USAGE OF ATTRIBUTES
				{		
					isChild1 = (child.id == el1Child);
					isChild2 = (child.id == el2Child);
	
					if(isChild1)
					{
						edgeChild = 1;
						child.style = mxUtils.setStyle(child.style, mxMondrianConnector.prototype.cst.EDGE_CHILD, edgeChild);
						parent.style = mxUtils.setStyle(parent.style, mxMondrianConnector.prototype.cst.EDGE_LABEL_1, undefined);
					}
					else if(isChild2)
					{
						edgeChild = 2;
						child.style = mxUtils.setStyle(child.style, mxMondrianConnector.prototype.cst.EDGE_CHILD, edgeChild);
						parent.style = mxUtils.setStyle(parent.style, mxMondrianConnector.prototype.cst.EDGE_LABEL_2, undefined);
					}
				}
				else
				{
					isChild1 = (edgeChild == 1);
					isChild2 = (edgeChild == 2);
				}

				let edgeLabelAttribute = (isChild1) ? mxMondrianConnector.prototype.cst.EDGE_LABEL_1_ATTRIBUTES : ((isChild2) ? mxMondrianConnector.prototype.cst.EDGE_LABEL_2_ATTRIBUTES : undefined);
				let edgeLabelAttributes = (edgeLabelAttribute) ?  CORE.getStyleValue(parent.style, edgeLabelAttribute, undefined) : undefined;

				if(edgeLabelAttributes != undefined && edgeLabelAttributes != 'undefined')
				{
					let labelColor = (isChild1) ? CORE.getStyleValue(parent.style, 'edgeLabel1Color', 'black') : CORE.getStyleValue(parent.style, 'edgeLabel2Color', 'black') ;
					let labelFormat = (isChild1) ? CORE.getStyleValue(parent.style, 'edgeLabel1Template', 'default') : CORE.getStyleValue(parent.style, 'edgeLabel2Template', 'default') ;
					
					child.value.setAttribute('label', 
						CORE.defineLabel(edgeLabelAttributes, child, 'defaultSettingsConnector', labelColor, false, labelFormat));
				}
			}
		}	
	}
}

mxMondrianConnector.prototype.customProperties = [
	{name:'template', dispName: 'Template', type:'dynamicEnum', enumSource:'interfaceTemplate', defVal:'noTemplate',
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
	},
	{name:'colorFamilyLine', dispName:'Color', type:'enum', defVal:'black',
		enumList:[{val:'blue', dispName: 'Blue'}, {val:'black', dispName: 'Black'}, {val:'cyan', dispName: 'Cyan'}, {val:'green', dispName: 'Green'}, {val:'limegreen', dispName: 'Lime Green'}, {val:'gray', dispName: 'Gray'}, {val:'magenta', dispName: 'Magenta'}, {val:'purple', dispName: 'Purple'}, {val:'red', dispName: 'Red'}, {val:'teal', dispName: 'Teal'}, {val:'yellow', dispName: 'Yellow'}, {val:'orange', dispName: 'Orange'}],
		onChange: function(graph, newValue)
		{
			const CORE = window.MONDRIAN_CORE;
			let selectedCells = graph.getSelectionCells();
			
			for (let i = 0; i < selectedCells.length; i++)
			{			
				let colorIntensityLine = CORE.getStyleValue(
					selectedCells[i].style, 
					mxMondrianConnector.prototype.cst.COLOR_INTENSITY_LINE, 
					mxMondrianConnector.prototype.cst.COLOR_INTENSITY_LINE_DEFAULT);

				let mondrianColor = CORE.getColor(newValue, colorIntensityLine);

				graph.setCellStyles('strokeColor', mondrianColor, [selectedCells[i]]);
			}
		}
	},
	{name:'colorIntensityLine', dispName:'Color (Intensity)', type:'enum', defVal:'medium',
		enumList:[{val:'light', dispName: 'Light'}, {val:'medium', dispName: 'Medium'}, {val:'dark', dispName: 'Dark'}],
		onChange: function(graph, newValue)
		{
			const CORE = window.MONDRIAN_CORE;
			let selectedCells = graph.getSelectionCells();

			for (let i = 0; i < selectedCells.length; i++)
			{			
				let colorFamilyLine = CORE.getStyleValue(
					selectedCells[i].style, 
					mxMondrianConnector.prototype.cst.COLOR_FAMILY_LINE, 
					mxMondrianConnector.prototype.cst.COLOR_FAMILY_LINE_DEFAULT);

				let mondrianColor = CORE.getColor(colorFamilyLine, newValue);

				graph.setCellStyles('strokeColor', mondrianColor, [selectedCells[i]]);
			}
		}
	},
	{name: 'attributesText', dispName: 'Label', type: 'staticArr', subType: 'dynamicEnum', size: '3', subDefVal: 'noText',
		enumList:[{val:'noText', dispName: 'None'}],
		onChange: function(graph, newValue)
		{
			let selectedCells = graph.getSelectionCells();
			
			for (let i = 0; i < selectedCells.length; i++)
			{			
				selectedCells[i][mxMondrianConnector.prototype.cst.ATTRIBUTES_TEXT] = newValue;
			}
		}
	},
	{name:'labelColor', dispName:'Label (Color)', type:'enum', defVal:'black',
		enumList:[{val:'blue', dispName: 'Blue'}, {val:'black', dispName: 'Black'}, {val:'cyan', dispName: 'Cyan'}, {val:'green', dispName: 'Green'}, {val:'gray', dispName: 'Gray'}, {val:'magenta', dispName: 'Magenta'}, {val:'purple', dispName: 'Purple'}, {val:'red', dispName: 'Red'}, {val:'teal', dispName: 'Teal'}, {val:'yellow', dispName: 'Yellow'}, {val:'orange', dispName: 'Orange'}]},

	{name: 'edgeLabel1Attributes', dispName: 'Label (Edge 1)', type: 'staticArr', subType: 'dynamicEnum', size: '3', subDefVal: 'noText',
		enumList:[{val:'noText', dispName: 'None'}],
		onChange: function(graph, newValue)
		{
			let selectedCells = graph.getSelectionCells();
			
			for (let i = 0; i < selectedCells.length; i++)
			{	
				mxMondrianConnector.prototype.setEdgeLabel(graph, selectedCells[i], mxMondrianConnector.prototype.cst.EDGE_LABEL_1);
			}
		}
	},
	{name:'edgeLabel1Color', dispName:'Label (E1, Color)', type:'enum', defVal:'black',
		enumList:[{val:'blue', dispName: 'Blue'}, {val:'black', dispName: 'Black'}, {val:'cyan', dispName: 'Cyan'}, {val:'green', dispName: 'Green'}, {val:'gray', dispName: 'Gray'}, {val:'magenta', dispName: 'Magenta'}, {val:'purple', dispName: 'Purple'}, {val:'red', dispName: 'Red'}, {val:'teal', dispName: 'Teal'}, {val:'yellow', dispName: 'Yellow'}, {val:'orange', dispName: 'Orange'}]},


	{name: 'edgeLabel2Attributes', dispName: 'Label (Edge 2)', type: 'staticArr', subType: 'dynamicEnum', size: '3', subDefVal: 'noText',
		enumList:[{val:'noText', dispName: 'None'}],
		onChange: function(graph, newValue)
		{
			let selectedCells = graph.getSelectionCells();
			
			for (let i = 0; i < selectedCells.length; i++)
			{	
				mxMondrianConnector.prototype.setEdgeLabel(graph, selectedCells[i], mxMondrianConnector.prototype.cst.EDGE_LABEL_2);
			}
		}
	},

	{name:'edgeLabel2Color', dispName:'Label (E1, Color)', type:'enum', defVal:'black',
	enumList:[{val:'blue', dispName: 'Blue'}, {val:'black', dispName: 'Black'}, {val:'cyan', dispName: 'Cyan'}, {val:'green', dispName: 'Green'}, {val:'gray', dispName: 'Gray'}, {val:'magenta', dispName: 'Magenta'}, {val:'purple', dispName: 'Purple'}, {val:'red', dispName: 'Red'}, {val:'teal', dispName: 'Teal'}, {val:'yellow', dispName: 'Yellow'}, {val:'orange', dispName: 'Orange'}]},

];

/**
 * Mondrian Design Method shape registration
 */
mxCellRenderer.registerShape(mxMondrianConnector.prototype.cst.MONDRIAN_CONNECTOR, mxMondrianConnector);