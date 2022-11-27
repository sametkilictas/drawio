(function()
{
	Sidebar.prototype.mondrian = {
		BASEURL: null,
		SIDEBAR_PATH: 'mondrian/',
		MONDRIAN_CONFIG_FILE: 'baseConfig.json',
		STENCIL_REPOSITORY: 'stencils/stencilRepository.json',

		BASE_SHAPE : 'mxgraph.mondrian.base',
		LEGEND_SHAPE : 'mxgraph.mondrian.legend',
		DU_SHAPE : 'mxgraph.mondrian.du',

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
	}

	Sidebar.prototype.mondrianRepo = {
		STENCILS: {},
		ELEMENTS: {},

		addStencil: function(name, stencil)
		{
			Sidebar.prototype.mondrianRepo.STENCILS[name] = {stencil: stencil};
		},

		hasStencil: function(name)
		{
			return Sidebar.prototype.mondrianRepo.STENCILS.hasOwnProperty(name);
		},

		getStencil: function(name)
		{
			return Sidebar.prototype.mondrianRepo.STENCILS[name].stencil;
		},

		addElement: function(client, id, element)
		{
			let elementKey = (client === 'default') ? id : client + '.' + id;
			elementKey = elementKey.toLowerCase();

			Sidebar.prototype.mondrianRepo.ELEMENTS[elementKey] = {element: element};
		},

		hasElement: function(predefinedElements, id)
		{
			if(id === undefined)
				return false;

			id = id.toLowerCase();

			if((predefinedElements != 'undefined' && predefinedElements != 'default' && predefinedElements != ''))
			{
				for(let predefinedElement in predefinedElements)
				{
					if(Sidebar.prototype.mondrianRepo.ELEMENTS[predefinedElements[predefinedElement].toLowerCase() + '.' + id])
						return true;
				}
			}

			return Sidebar.prototype.mondrianRepo.ELEMENTS.hasOwnProperty(id)
		},

		getElement: function(predefinedElements, id)
		{
			id = id.toLowerCase();

			let definedElement;

			if((predefinedElements != 'undefined' && predefinedElements != 'default' && predefinedElements != ''))
			{
				for(let predefinedElement in predefinedElements)
				{
					definedElement = Sidebar.prototype.mondrianRepo.ELEMENTS[predefinedElements[predefinedElement].toLowerCase() + '.' + id];

					if(definedElement != undefined)
						return definedElement.element	
				}
			}
		
			definedElement = Sidebar.prototype.mondrianRepo.ELEMENTS[id];

			return definedElement.element;
		}
	};

	Sidebar.prototype.addMondrianPalette = function()
	{
		let MBS = Sidebar.prototype.mondrian;
		MBS.BASEURL = (new RegExp(/^.*\//)).exec(window.location.href)[0];
		
		let mondrianConfig = JSON.parse(mxUtils.load(MBS.BASEURL + MBS.SIDEBAR_PATH + MBS.MONDRIAN_CONFIG_FILE).getText());
		
		// FONTS
		// load webfonts used in Visual Standards
		for(let fontKey in mondrianConfig.Fonts)
		{
			Graph.addFont(mondrianConfig.Fonts[fontKey].name, mondrianConfig.Fonts[fontKey].uri);
		}

		// STENCILS
		for (let stencilKey in mondrianConfig.Stencils) {
			mxStencilRegistry.loadStencilSet(mondrianConfig.Stencils[stencilKey].uri);
		}

		this.buildStencilRepo(mxStencilRegistry.stencils);

		// ELEMENTS
		for (let elementsKey in mondrianConfig.Elements) {
			let elements = JSON.parse(mxUtils.load(mondrianConfig.Elements[elementsKey].uri).getText())

			let clients = mondrianConfig.Elements[elementsKey].client.split(',');

			for (let client in clients)
			{
				for (let elementKey in elements)
				{
					Sidebar.prototype.mondrianRepo.addElement(clients[client], elementKey, elements[elementKey]);
				}	
			}
		}

		// SIDEBARS
		let sideBars = {};
		for(let sidebarKey in mondrianConfig.Sidebars)
		{
			let sideBar = mondrianConfig.Sidebars[sidebarKey];
			if(sideBar.type === 'STENCIL')
				sideBar.url = 'STENCIL:' + sideBar.uri;
			else
				sideBar.url = MBS.BASEURL + MBS.SIDEBAR_PATH + sideBar.uri;

			// Add Shape Side Bar
			this.configuration.push({id: sideBar.id + sideBar.lib, prefix: sideBar.id, libs: [sideBar.lib]});

			if(!sideBars.hasOwnProperty(sideBar.id))
				sideBars[sideBar.id] = {title: sideBar.id, entries: []};

			// Extend More Shapes...
			sideBars[sideBar.id].entries.push({title: sideBar.lib, id: sideBar.id + sideBar.lib, image: IMAGE_PATH + '/sidebar-ibm2mondrian-base-shapes.png'});
		}

		let sidebarIDX = 0;
		for(let sideBar in sideBars)
		{
			this.entries.splice(sidebarIDX,0,{title: sideBars[sideBar].title, entries: sideBars[sideBar].entries});
			sidebarIDX++;
		}

		this.GenerateMondrianPalette(mondrianConfig.Sidebars);
	}

	Sidebar.prototype.buildStencilRepo = function(stencils)
	{
		let MBS = Sidebar.prototype.mondrian;

		// load all stencils
		for(let stencil in stencils)
		{
			Sidebar.prototype.mondrianRepo.addStencil(stencil, stencil);			
		}

		// add the repository to get the alias
		let stencilRepo = JSON.parse(mxUtils.load(MBS.BASEURL + MBS.SIDEBAR_PATH + MBS.STENCIL_REPOSITORY).getText());

		for(let stencil in stencilRepo)
		{
			if(Sidebar.prototype.mondrianRepo.hasStencil(stencil))
			{
				let alias = stencilRepo[stencil].alias;
				for (let i = 0; i < alias.length; i++) {
					Sidebar.prototype.mondrianRepo.addStencil(alias[i], stencil);
				}	
			}
		}

		// strip the namespace & add as alias
		for(let stencil in stencils)
		{
			let stencilName = stencil.split('.').pop();
			if(Sidebar.prototype.mondrianRepo.hasStencil(stencil)) // an alias has precendence
			{
				Sidebar.prototype.mondrianRepo.addStencil(stencilName, stencil);
			}
		}

	}

	Sidebar.prototype.addMondrianEditorExtensions = function()
	{
		const MBS = Sidebar.prototype.mondrian;

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

	Sidebar.prototype.GenerateMondrianPalette = function(sideBarConfigs)
	{
		sideBarConfigs = sideBarConfigs || [];

		let mondrianEditorExtensions = Sidebar.prototype.addMondrianEditorExtensions() || [];	
		if(mondrianEditorExtensions.Sidebars != null)
		{
			for(let sidebarExtension in mondrianEditorExtensions.Sidebars)
			{
				sideBarConfigs.push(mondrianEditorExtensions.Sidebars[sidebarExtension]);
			}
		}

		// Create sidebar based on JSON
		for(let sidebarConfigKey in sideBarConfigs)
		{
			let sideBarConfig = sideBarConfigs[sidebarConfigKey];

			if(sideBarConfig.url.startsWith('STENCIL'))
			{
				let namespace = sideBarConfig.url.split(':')[1];
				let sbEntries = [];
				let stencilKeys = Object.keys(mxStencilRegistry.stencils);
				stencilKeys.sort();

				let stencilKeysLength = stencilKeys.length;
				let namespaceFQN = namespace.split('.');
				let currentStencilSection = namespaceFQN.pop();
				while(currentStencilSection == '')
				{
					currentStencilSection = namespaceFQN.pop();
				}
				
				for (let i = 0; i < stencilKeysLength; i++)
				{
					let stencilKey =stencilKeys[i];
					if(stencilKey.startsWith(namespace))
					{
						//let stencilName = stencilKey.replace(namespace,'');
						let stencilFQN = stencilKey.split('.');
						let stencilName = stencilFQN.pop();
						let newStencilSection = stencilFQN.pop();

						if(newStencilSection != currentStencilSection)
						{
							sbEntries.push(this.addEntry(sideBarConfig.tags + " " + newStencilSection.toLowerCase(), this.createSection(newStencilSection.charAt(0).toUpperCase() + newStencilSection.slice(1))));
							currentStencilSection = newStencilSection;
						}

						sbEntries.push(this.addEntry(sideBarConfig.tags + " " + stencilName.toLowerCase(), function() {
							var bg = Sidebar.prototype.addMondrianVertexTemplateFactory('ln', 'collapsed', 'black', null, null, null, null, 'no_container_transparent', null, '', '', stencilName, null, stencilName, null, null, null, '', sideBarConfig.fontsettings);
							
							return sb.createVertexTemplateFromCells([bg], bg.geometry.width, bg.geometry.height, stencilName, false);
						}));
					}
				}

				this.setCurrentSearchEntryLibrary(sideBarConfig.id, sideBarConfig.id + sideBarConfig.lib);
				this.addPaletteFunctions(sideBarConfig.id + sideBarConfig.lib, sideBarConfig.title, false, sbEntries);
			}
			else
			{
				try
				{
					let sidebarConfigs = JSON.parse(mxUtils.load(sideBarConfig.url).getText());
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
								sbEntries.push(this.addEntry(sideBarConfig.tags + " " + section.toLowerCase(), this.createSection(section)));
				
							let shapes = sidebar[section];
				
							for (let shapeName in shapes) {
								sbEntries.push(this.addEntry(sideBarConfig.tags + " " + shapeName.toLowerCase(), function() {
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

									var bg = Sidebar.prototype.addMondrianVertexTemplateFactory(shape.format.type, shape.format.layout, shape.color.family, shapeIntensity, shapeBackground, shapeMultiplicity, shapeBorder, shape.format.container, shape.text.font, shape.extra, shape.id, shapeName, positionText, shape.icon, tagForm, tagColorFamily, tagColorFill, tagText, sideBarConfig.fontsettings);
									
									let showLabel = (shape.format.type == 'du');
									return sb.createVertexTemplateFromCells([bg], bg.geometry.width, bg.geometry.height, shapeName, showLabel);
								}));
							}
						}
				
						this.setCurrentSearchEntryLibrary(sideBarConfig.id, sideBarConfig.id + sideBarConfig.lib);

						this.addPaletteFunctions(sideBarConfig.id + sideBarConfig.lib, sideBarConfig.title, false, sbEntries);
					}
				}
				catch (ex){
					console.log(sideBarConfigs[sidebarConfigKey]);	
					console.log(ex);
				}
			}
		}

		this.setCurrentSearchEntryLibrary();
	};

	Sidebar.prototype.addMondrianVertexTemplateFactory = function(shapeType, shapeLayout, shapeColor, shapeIntensity, shapeBackground, shapeMultiplicity, shapeBorder, shapeContainer, styleFont, shapeExtraStyle, elementID, elementName, positionText, iconName, tagForm, tagColorFamily, tagColorFill, tagText, fontConfig)
	{
		let MBS = Sidebar.prototype.mondrian;
		let fixedStandardSettings = ';html=1;whiteSpace=wrap;metaEdit=1;collapsible=0;recursiveResize=0;expand=0';

		let shape = null;
		let shapeFont = fontConfig.elementName;

		if(shapeType == MBS.SHAPE_TYPE.LEGEND)
		{
			shape = 'shape=' + MBS.LEGEND_SHAPE;
		}
		else if(shapeType == MBS.SHAPE_TYPE.DU)
		{
			shape = 'shape=' + MBS.DU_SHAPE;
			shapeFont = fontConfig.elementID;
		}
		else
		{
			shape = 'shape=' + MBS.BASE_SHAPE;
		}

		let fontSettings = (styleFont == '' || styleFont == null) ? ';fontFamily=' + shapeFont + ';fontColor=#000000;fontSize=14' : ';fontFamily=' + shapeFont + styleFont;

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
			bg.setAttribute('label', '%Element-Name%<BR><font style=\'font-size: 12px\' face=\'' + fontConfig.elementID + '\'>%Element-ID%</font>');
			bg.setAttribute('Element-ID', elementID);
			bg.setAttribute('Element-Name', elementName);
			bg.setAttribute('Icon-Name', iconName);
		}
		
		return bg;
	}
})();