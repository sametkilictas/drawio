(function()
{
	Sidebar.prototype.IBM2MondrianBaseShape = {
		BASE_SHAPE : 'mxgraph.ibm2mondrian.base',
		LEGEND_SHAPE : 'mxgraph.ibm2mondrian.legend',
		DU_SHAPE : 'mxgraph.ibm2mondrian.du',
		

		SHAPE_TYPE: {
			ACTOR: 'actor',
			TARGET_SYSTEM: 'ts',
			LOGICAL_NODE: 'ln',
			LOGICAL_COMPONENT: 'lc',
			LOGICAL_GROUP: 'lg',
			PRESCRIBED_NODE: 'pn',
			PRESCRIBED_COMPONENT: 'pc',
			PRESCRIBED_GROUP: 'pg',
			LEGEND: 'legend',
			DU: 'du'
		},

		SHAPE_LAYOUT: {
			EXPANDED: 'expanded',
			COLLAPSED: 'collapsed',
			LEGEND_SHAPE: 'legend:shape',
			LEGEND_ICON: 'legend:icon',
			LEGEND_TAG: 'legend:tag'
		},

		SHAPE_CONTAINER: {
			YES: 'container',
			YES_TRANSPARENT: 'container_transparent',
			NO: 'no_container',
			NO_TRANSPARENT: 'no_container_transparent',
		},

		COLOR_FAMILY: {
			RED: 'red',
			MAGENTA: 'magenta',
			PURPLE: 'purple',
			CYAN: 'cyan',
			BLUE: 'blue',
			TEAL: 'teal',
			GREEN: 'green',
			BLACK: 'black',
			GRAY: 'gray',
			YELLOW: 'yellow',
			ORANGE: 'orange',			
			NO_COLOR: 'noColor'
		}
	}

	Sidebar.prototype.addIBM2MondrianEditorExtensions = function()
	{
		const MBS = Sidebar.prototype.IBM2MondrianBaseShape;

		// load webfonts used in Visual Standards
		Graph.addFont('IBM Plex Sans Regular', 'fonts/IBMPlexSans-Regular.woff');
		Graph.addFont('IBM Plex Sans SmBld', 'fonts/IBMPlexSans-SemiBold.woff');
		Graph.addFont('IBM Plex Mono', 'fonts/IBMPlexMono-Regular.woff');
		Graph.addFont('IBM Plex Sans Condensed', 'fonts/IBMPlexSansCondensed-Regular.woff');

		// load external stencil libraries
		if(Editor.config != null && Editor.config[MBS.BASE_SHAPE])
		{
			let iconStencilLibraries = Editor.config[MBS.BASE_SHAPE].icon_stencil_libraries;
			for (stencilLibrary in iconStencilLibraries) {
				mxStencilRegistry.loadStencilSet(iconStencilLibraries[stencilLibrary]);
			}

			let sideBars = Editor.config[MBS.BASE_SHAPE].sidebars;
			
			return {
				IconStencils: iconStencilLibraries,
				Sidebars: sideBars
			};
		}
	}

	Sidebar.prototype.addIBM2MondrianPalette = function(sidebarConfigFileURLs, addSidebarBase = true)
	{
		let baseURL = (new RegExp(/^.*\//)).exec(window.location.href)[0];
		let stencilURL = baseURL + 'stencils/ibm/ibm2mondrian_batch_1.xml'; //TEMP
		mxStencilRegistry.loadStencilSet(stencilURL); //TEMP

		this.GenerateIBM2MondrianPalette(sidebarConfigFileURLs, addSidebarBase);
	}

	Sidebar.prototype.GenerateIBM2MondrianPalette = function(sidebarConfigFileURLs, addSidebarBase = true)
	{
		let mondrianEditorExtensions = Sidebar.prototype.addIBM2MondrianEditorExtensions() || [];

		sidebarConfigFileURLs = sidebarConfigFileURLs || [];

		if(addSidebarBase)
		{

			let baseUrl = (new RegExp(/^.*\//)).exec(window.location.href)[0];

			sidebarConfigFileURLs.splice(0,0,{id: 'ibm2mondrian', name: 'IBM' , url:  baseUrl + 'js/diagramly/sidebar/ibm/IBM2MondrianBase.json'});
			//sidebarConfigFileURLs.splice(1,0,{id: 'ibm2cloud', name: 'IBM' , url: baseUrl + 'js/diagramly/sidebar/IBM2MondrianCloud.json'});
		}
		
		if(mondrianEditorExtensions.Sidebars != null)
		{
			for(let sidebarExtension in mondrianEditorExtensions.Sidebars)
			{
				sidebarConfigFileURLs.push(mondrianEditorExtensions.Sidebars[sidebarExtension]);
			}	
		}

		// Create sidebar based on JSON
		const dt = 'ibm mondrian ';

		for(let filenameIndex in sidebarConfigFileURLs)
		{
			let filename = sidebarConfigFileURLs[filenameIndex].url;
			let sidebarID = sidebarConfigFileURLs[filenameIndex].id;
			let sidebarMainName = sidebarConfigFileURLs[filenameIndex].name;

			try
			{
				let sidebarFileText = mxUtils.load(filename).getText();
				let sidebarConfigs = JSON.parse(sidebarFileText);
				let sidebarVariables = sidebarConfigs.Variables;
				
				for(let sidebarKey in sidebarConfigs.Sidebars)
				{
					let sidebar = sidebarConfigs.Sidebars[sidebarKey]; 
					let sbEntries = [];
		
					for (let section in sidebar)
					{
						// Expand Variables
						for(let shapeKey in sidebar[section])
						{
							let shape = sidebar[section][shapeKey];
		
							// Expand Properties
							for(let prop in shape)
							{
								if(sidebarVariables[prop])
								{
									for(let newProp in sidebarVariables[prop])
									{
										shape[newProp] = sidebarVariables[prop][newProp]; 
									}
								}
							}
		
							// Expand Property Values
							for(let prop in shape)
							{
								if(typeof(shape[prop]) === 'string' && sidebarVariables[shape[prop]])
									shape[prop] = sidebarVariables[shape[prop]]; 
							}
						}
		
						//Create SB entries
						if (section != '*')
							sbEntries.push(this.addEntry(dt + section.toLowerCase(), this.createSection(section)));
			
						let shapes = sidebar[section];
			
						for (let shapeName in shapes) {
							sbEntries.push(this.addEntry(dt + shapeName.toLowerCase(), function() {
								const shape = shapes[shapeName];

								let positionText = null; 

								if(shape.hasOwnProperty('text'))
								{
									if(shape.text.position != null)
										positionText = shape.text.position
								}

								let shapeBorder = null;
								let shapeMultiplicity = null;

								if(shape.hasOwnProperty('format'))
								{
									if(shape.format.border != null)
										shapeBorder = shape.format.border;

									if(shape.format.multiplicity != null)
										shapeMultiplicity = shape.format.multiplicity;
								}

								let shapeIntensity = null;
								let shapeBackground = null;

								if(shape.hasOwnProperty('color'))
								{
									if(shape.color.intensity != null)
										shapeIntensity = shape.color.intensity;

									if(shape.color.background != null)
										shapeBackground = shape.color.background;
								}
		
								let tagForm = null;
								let tagColorFamily = null;
								let tagColorFill = null;
								let tagText = "";

								if(shape.hasOwnProperty("tag"))
								{
									if(shape.tag.form != null)
										tagForm = shape.tag.form;

									if(shape.tag.family != null)
										tagColorFamily = shape.tag.family

									if(shape.tag.fill != null)
										tagColorFill = shape.tag.fill

									if(shape.tag.text != null)
										tagText = shape.tag.text;
								}

								var bg = Sidebar.prototype.addIBM2MondrianVertexTemplateFactory(shape.format.type, shape.format.layout, shape.color.family, shapeIntensity, shapeBackground, shapeMultiplicity, shapeBorder, shape.format.container, shape.text.font, shape.extra, shape.id, shapeName, positionText, shape.icon, tagForm, tagColorFamily, tagColorFill, tagText);
								
								let showLabel = (shape.format.type == 'du');
								return sb.createVertexTemplateFromCells([bg], bg.geometry.width, bg.geometry.height, shapeName, showLabel);
							}));
						}
					}
			
					const sidebarFullName = sidebarMainName + " " + sidebarKey;
					//const sidebarFullName = sidebarMainName + " / " + sidebarKey;
					this.setCurrentSearchEntryLibrary(sidebarID, sidebarID + sidebarKey);
					this.addPaletteFunctions(sidebarID + sidebarKey, sidebarFullName, false, sbEntries);
				}
			}
			catch (ex){
				console.log(sidebarConfigFileURLs[filenameIndex]);	
				console.log(ex);
			}

		}

		this.setCurrentSearchEntryLibrary();
	};

	Sidebar.prototype.addIBM2MondrianVertexTemplateFactory = function(shapeType, shapeLayout, shapeColor, shapeIntensity, shapeBackground, shapeMultiplicity, shapeBorder, shapeContainer, styleFont, shapeExtraStyle, elementID, elementName, positionText, iconName, tagForm, tagColorFamily, tagColorFill, tagText)
	{
		let MBS = Sidebar.prototype.IBM2MondrianBaseShape;
		let fixedStandardSettings = ';html=1;whiteSpace=wrap;metaEdit=1;collapsible=0;recursiveResize=0;expand=0';

		let shape = null;
		
		if(shapeType == MBS.SHAPE_TYPE.LEGEND)
			shape = 'shape=' + MBS.LEGEND_SHAPE;
		else if(shapeType == MBS.SHAPE_TYPE.DU)
			shape = 'shape=' + MBS.DU_SHAPE;
		else
			shape = 'shape=' + MBS.BASE_SHAPE;

		let fontSettings = (styleFont == '') ? ';fontFamily=IBM Plex Sans SmBld;fontColor=#000000;fontSize=14' : styleFont;

		let shapeSettings = '';
		let standardSettings = '';
		
		let shapeWidth = null;
		let shapeHeight = null;

		if(shapeType == MBS.SHAPE_TYPE.LEGEND)
		{
			shapeHeight = 56;
			shapeWidth = 136;
			shapeSettings = ';legendLayout=' + shapeLayout;

			standardSettings = standardSettings + ';strokeWidth=1';
			standardSettings = standardSettings + ';verticalAlign=middle;align=left;spacing=0;spacingLeft=0;spacingRight=0;spacingTop=0;spacingBottom=0';
			standardSettings = standardSettings + ';connectable=0';
			standardSettings = standardSettings + ';childLayout=stackLayout;stackUnitSize=16;resizeParent=1;resizeParentMax=0;resizeLast=0;allowGaps=0';

			if(shapeLayout == 'horizontalTB' || shapeLayout == 'horizontal')
				standardSettings = standardSettings + ';stackFill=0;horizontalStack=1';
			else
				standardSettings = standardSettings + ';stackFill=1;horizontalStack=0';

			if(shapeLayout == 'horizontalTB' || shapeLayout == 'verticalTB')
				standardSettings = standardSettings + ';noLabel=0;marginTop=32';
			else
				standardSettings = standardSettings + ';noLabel=1;marginTop=8';

			standardSettings = standardSettings + ';marginBottom=8;marginRight=8;marginLeft=8;stackSpacing=8';
		}
		else if(shapeType == MBS.SHAPE_TYPE.DU)
		{
			shapeHeight = 16;
			shapeWidth = 192;

			standardSettings = standardSettings + ';shapeType=' + shapeLayout;
			standardSettings = standardSettings + ';verticalAlign=middle;align=left;spacing=0;spacingLeft=0;spacingRight=0;spacingTop=0;spacingBottom=0';
			standardSettings = standardSettings + ';connectable=0';
		}
		else
		{
			shapeSettings = ";shapeType=" + shapeType + ";shapeLayout=" + shapeLayout + ";colorFamily=" + shapeColor;
			standardSettings = ';image=';

			if(shapeIntensity != null)
				shapeSettings = shapeSettings +  ";colorFillIcon=" + shapeIntensity

			if(shapeBackground != null)
			{
				if(shapeBackground.search(":") != -1)
					shapeSettings = shapeSettings + ";colorBackground=" + shapeBackground
				else
					shapeSettings = shapeSettings + ";colorBackground=" + shapeBackground + ":" + shapeBackground
			}
			else if(shapeContainer === MBS.SHAPE_CONTAINER.YES_TRANSPARENT || shapeContainer === MBS.SHAPE_CONTAINER.NO_TRANSPARENT)
				shapeSettings = shapeSettings + ";colorBackground=noColor:noColor";

			if(shapeBorder != null)
				shapeSettings = shapeSettings + ";strokeWidth=" + shapeBorder;
			else
				shapeSettings = shapeSettings + ";strokeWidth=1";

			
			if(tagForm != null)
				shapeSettings = shapeSettings + ";tag=" + tagForm

			if(tagColorFamily != null)
				shapeSettings = shapeSettings + ";tagColorFamily=" + tagColorFamily

			if(tagColorFill != null)
				shapeSettings = shapeSettings + ";tagColorFill=" + tagColorFill

			if(shapeMultiplicity != null)
				shapeSettings = shapeSettings + ";shapeMultiplicity=" + shapeMultiplicity

			if(shapeLayout === MBS.SHAPE_LAYOUT.EXPANDED)
			{
				shapeHeight = (shapeType == MBS.SHAPE_TYPE.LOGICAL_GROUP || shapeType == MBS.SHAPE_TYPE.PRESCRIBED_GROUP) ? 152 : 48;
				shapeWidth = 240;
				standardSettings = standardSettings + ';verticalAlign=middle;align=left;spacing=0;spacingLeft=16;spacingRight=16;spacingTop=0;spacingBottom=0';
			}
			else if(shapeLayout === MBS.SHAPE_LAYOUT.COLLAPSED)
			{
				shapeHeight = 48;
				shapeWidth = (shapeType === MBS.SHAPE_TYPE.TARGET_SYSTEM) ? 64 : 48;
				standardSettings = standardSettings + ';verticalAlign=top;align=center;spacing=0;spacingLeft=0;spacingRight=0;spacingTop=0;spacingBottom=0;verticalLabelPosition=bottom;labelPosition=center;positionText=bottom';
			}
			else if(shapeLayout === MBS.SHAPE_LAYOUT.LEGEND_SHAPE || shapeLayout === MBS.SHAPE_LAYOUT.LEGEND_ICON || shapeLayout === MBS.SHAPE_LAYOUT.LEGEND_TAG)
			{
				shapeHeight = 16;
				shapeWidth = 240;
				standardSettings = standardSettings + ';verticalAlign=middle;align=left;spacing=0;spacingLeft=0;spacingRight=0;spacingTop=0;spacingBottom=0';
				standardSettings = standardSettings + ';connectable=0';
			}
		}

		if(shapeContainer === MBS.SHAPE_CONTAINER.YES || shapeContainer === MBS.SHAPE_CONTAINER.YES_TRANSPARENT)
			standardSettings = standardSettings + ';container=1';
		else if(shapeContainer === MBS.SHAPE_CONTAINER.NO || shapeContainer === MBS.SHAPE_CONTAINER.NO_TRANSPARENT)
			standardSettings = standardSettings + ';container=0';

		var bg = new mxCell('', 
			new mxGeometry(0, 0, shapeWidth, shapeHeight), shape + shapeSettings + fixedStandardSettings + fontSettings + standardSettings + shapeExtraStyle);
		bg.vertex = true;

		bg.setValue(mxUtils.createXmlDocument().createElement('UserObject'));
		bg.setAttribute('placeholders', '1');
		if(shapeType == MBS.SHAPE_TYPE.LEGEND)
		{
			bg.setAttribute('label', '%Legend-Title%');
			bg.setAttribute('Legend-Title', elementName);
		}
		else if(shapeType == MBS.SHAPE_TYPE.DU)
		{
			bg.setAttribute('label', '%Element-Name%');
			bg.setAttribute('Element-ID', elementID);
			bg.setAttribute('Element-Name', elementName);
		}
		else
		{
			bg.setAttribute('label', '%Element-Name%<BR><font style=\'font-size: 14px\' face=\'IBM Plex Sans Regular\'>%Element-ID%</font>');
			bg.setAttribute('Element-ID', elementID);
			bg.setAttribute('Element-Name', elementName);
			bg.setAttribute('Icon-Name', iconName);
			bg.setAttribute('Tag-Text', tagText);
		}
		
		return bg;
	}
})();
