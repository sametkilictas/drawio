// Addition to add MONDRIAN Capability
mxscript("js/jquery/jquery-3.6.4.min.js", function()
{
    mxscript("js/selectize/selectize.min.js");
});

class MondrianRepo {
    static #CONFIG = {
        PATH: window.MONDRIAN_CONFIG_PATH || 'mondrian/',
        FILE: 'baseConfig.json',
        STENCIL_REPOSITORY: 'stencils/stencilRepository.json'
    }

    ELEMENTS = new Map();
    ELEMENTS_BY_CLIENT = {};
    ELEMENTS_BY_CLIENT_MERGED = {};

    STENCILS = {};
	ICONS = [];

    MONDRIAN_BASE_STENCIL_REGISTRY = 'mondrianbase.';
	MONDRIAN_ICONS_STENCIL_REGISTRY = 'mondrianicons.';

    constructor() {
    }

    async initialize() {
        this.CONFIG = await this.#fetchJSONFromURL(MondrianRepo.#CONFIG.PATH + MondrianRepo.#CONFIG.FILE);
        this.CONFIG.PATH = MondrianRepo.#CONFIG.PATH;
        let mondrianConfig = this.CONFIG.JSON;

        // ELEMENTS
        await this.#buildElementsRepo();

        // STENCILS
		for (let stencilKey in mondrianConfig.Stencils) {
			mxStencilRegistry.loadStencilSet(MondrianRepo.#CONFIG.PATH + mondrianConfig.Stencils[stencilKey].uri);
		}

        await this.#buildStencilRepo(mxStencilRegistry.stencils);
    }

    /* ELEMENTS */
    getElementRepo(client, elementType) {
        if (this.ELEMENTS_BY_CLIENT_MERGED[elementType])
            return (this.ELEMENTS_BY_CLIENT_MERGED[elementType][client]) ? this.ELEMENTS_BY_CLIENT_MERGED[elementType][client] : this.ELEMENTS_BY_CLIENT_MERGED[elementType]['default'];
    }

    hasElement(clients, id)
    {
        if(id === undefined)
            return false;

        if((clients != 'undefined' && clients != 'default' && clients != '')) // for predefined Elements that are not in de the Default
        {
            for(let client in clients)
            {
                if(this.ELEMENTS.has((clients[client] + '.' + id).toLowerCase()))
                    return true;
            }
        }

        return this.ELEMENTS.has(id.toLowerCase());
    }

    getElement(clients, id)
    {
        let definedElement;

        if((clients != 'undefined' && clients != 'default' && clients != ''))
        {
            for(let client in clients)
            {
                definedElement = this.ELEMENTS.get((clients[client] + '.' + id).toLowerCase());

                if(definedElement != undefined)
                    return definedElement.element	
            }
        }
    
        definedElement = this.ELEMENTS.get(id.toLowerCase());
        if(definedElement != undefined)
            return definedElement.element;
    }

    getTemplate(id)
    {
        if(id != undefined)
        {
            let template = this.ELEMENTS.get(id.toLowerCase());

            if(template != undefined)
            {
                let templateElement = template.element
                if(templateElement.templateInherit != undefined)
                {
                    let baseTemplate = this.ELEMENTS.get(templateElement.templateInherit.toLowerCase());

                    if(baseTemplate != undefined)
                    {
                        let baseTemplateElement = baseTemplate.element;

                        if(baseTemplateElement.style != undefined && baseTemplateElement.style.initialSettings != undefined)
                        {
                            if(templateElement.style === undefined) templateElement.style = {};
                            if(templateElement.style.initialSettings === undefined) templateElement.style.initialSettings = {};

                            for (const setting in baseTemplateElement.style.initialSettings) {
                                if(templateElement.style.initialSettings[setting] === undefined)
                                    templateElement.style.initialSettings[setting] = baseTemplateElement.style.initialSettings[setting];
                            }
                        }

                        if(baseTemplateElement.style != undefined && baseTemplateElement.style.mandatorySettings != undefined)
                        {
                            if(templateElement.style === undefined) templateElement.style = {};
                            if(templateElement.style.mandatorySettings === undefined) templateElement.style.mandatorySettings = {};

                            for (const setting in baseTemplateElement.style.mandatorySettings) {
                                if(templateElement.style.mandatorySettings[setting] === undefined)
                                    templateElement.style.mandatorySettings[setting] = baseTemplateElement.style.mandatorySettings[setting];
                            }
                        }

                        if(baseTemplateElement.attributes != undefined && baseTemplateElement.attributes.initialSettings != undefined)
                        {
                            if(templateElement.attributes === undefined) templateElement.attributes = {};
                            if(templateElement.attributes.initialSettings === undefined) templateElement.attributes.initialSettings = {};

                            for (const setting in baseTemplateElement.attributes.initialSettings) {
                                if(templateElement.attributes.initialSettings[setting] === undefined)
                                    templateElement.attributes.initialSettings[setting] = baseTemplateElement.attributes.initialSettings[setting];
                            }
                        }

                        if(baseTemplateElement.attributes != undefined && baseTemplateElement.attributes.mandatorySettings != undefined)
                        {
                            if(templateElement.attributes === undefined) templateElement.attributes = {};
                            if(templateElement.attributes.mandatorySettings === undefined) templateElement.attributes.mandatorySettings = {};

                            for (const setting in baseTemplateElement.attributes.mandatorySettings) {
                                if(templateElement.attributes.mandatorySettings[setting] === undefined)
                                    templateElement.attributes.mandatorySettings[setting] = baseTemplateElement.attributes.mandatorySettings[setting];
                            }
                        }
                    }
                }

                return templateElement;
            }
        }
    }

    async #buildElementsRepo() {
        let elementFiles = this.#getElementFiles(this.CONFIG.JSON);
        
        let fixedElementTypes = new Set(['ABB', 'SBB', 'LN', 'TN', 'ACT', 'IN']);

        await this.#fetchJSONFromMultipeURLs([...elementFiles.keys()])
        .then(results => {
            for (const result of results) {
                
                for (const client of elementFiles.get(result.URL)) {
                    for (let elementKey in result.JSON) {
                        let type = elementKey.split('-')[0];
                        type = (fixedElementTypes.has(type)) ? type : 'Other';
                        type = (result.JSON[elementKey]['Element-Type-Full']) ? result.JSON[elementKey]['Element-Type-Full'] : type;    
                        
                        this.#addElement(result.JSON[elementKey]['elementType'], type, client, elementKey, result.JSON[elementKey]);
                    }
                }
            }

            this.#buildMergedElementRepos();
        })
        .catch(error => {
            console.log('Error:', error.message);
        })
        .finally()
        {
            setTimeout(() => this.#buildElementsRepo(), 60 * 1000)
        };
    }

    async #fetchJSONFromURL(url) {
        const fetchHeaders = {
            method: 'GET',
            mode: 'cors',
            headers: new Headers({
                'Content-Type': 'application/json; charset=UTF-8',
                'Cache-Control': 'no-cache'
            })
        }

        const response = await fetch(window.DRAWIO_SERVER_URL + url, fetchHeaders);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return { URL: url, JSON: await response.json() };
    }

    #fetchJSONFromMultipeURLs(urls) {
        const promises = urls.map(url => this.#fetchJSONFromURL(url));
        return Promise.all(promises);
    }

    #getElementFiles(mondrianConfig) {
        let elementFiles = new Map();

        for (let elementsKey in mondrianConfig.Elements) {
            if (mondrianConfig.Elements[elementsKey].uri != undefined) {
                elementFiles.set(
                    MondrianRepo.#CONFIG.PATH + mondrianConfig.Elements[elementsKey].uri,
                    mondrianConfig.Elements[elementsKey].client.split(',').map(item => item.trim()))
            }
            else {
                for (let fileKey in mondrianConfig.Elements[elementsKey].files) {
                    elementFiles.set(
                        MondrianRepo.#CONFIG.PATH + mondrianConfig.Elements[elementsKey].basePath + mondrianConfig.Elements[elementsKey].files[fileKey],
                        mondrianConfig.Elements[elementsKey].client.split(',').map(item => item.trim()))
                }
            }
        };

        return elementFiles;
    }

    #addElement(elementType, type, client, id, element) {
        let elementKey = ((client === 'default') ? id : client + '.' + id).toLowerCase();
        this.ELEMENTS.set(elementKey, { element: element });

        let elementNameProperty = undefined;
        let elementNameFullProperty = undefined;

        if (element['Element-Name'] != undefined) {
            elementType = (elementType) ? elementType: 'SHAPE';
            elementNameProperty = 'Element-Name';
            elementNameFullProperty = 'Element-Name-Full';
        }
        else if (element['Interface-Name'] != undefined) {
            elementType = (elementType) ? elementType: 'INTERFACE';
            elementNameProperty = 'Interface-Name';
            elementNameFullProperty = 'Interface-Name-Full';
        }
        else if (elementType === 'SHAPE-TEMPLATE' || elementType === 'INTERFACE-TEMPLATE')
        {
            elementNameProperty = 'templateName';
            elementNameFullProperty = 'templateName';
        }

        // FOR Selectize type ahead search
        if (elementType != undefined) {
            let elementsByClient = (this.ELEMENTS_BY_CLIENT.hasOwnProperty(elementType)) ? this.ELEMENTS_BY_CLIENT[elementType] : this.ELEMENTS_BY_CLIENT[elementType] = {};
            let elementByClient = (elementsByClient.hasOwnProperty(client)) ? elementsByClient[client] : elementsByClient[client] = new Map();
            elementByClient.set(
                id,
                {
                    type: type,
                    client: client,
                    id: id,
                    name: element[elementNameProperty],
                    nameFull: (element[elementNameFullProperty]) ? (element[elementNameFullProperty]) : element[elementNameProperty]
                }
            );
        }
    }

    #buildMergedElementRepos() {
        let elementTypes = ['INTERFACE', 'SHAPE', 'INTERFACE-TEMPLATE', 'SHAPE-TEMPLATE'];

        for (const elementType of elementTypes) {
            if (this.ELEMENTS_BY_CLIENT[elementType] != undefined) {
                Object.entries(this.ELEMENTS_BY_CLIENT[elementType]).forEach(([key, value]) => {
                    let client = key;

                    let newElementsArray = [];

                    for (let [key, value] of this.ELEMENTS_BY_CLIENT[elementType][client].entries()) {
                        newElementsArray.push(value);
                    }

                    // add all the Default elements that have an ID that is not yet in the collection
                    if (client != 'default') {
                        for (let [key, value] of this.ELEMENTS_BY_CLIENT[elementType]['default'].entries()) {
                            if (!this.ELEMENTS_BY_CLIENT[elementType][client].has(key))
                                newElementsArray.push(value);
                        }
                    }

                    let elementsByClientMerged = (this.ELEMENTS_BY_CLIENT_MERGED.hasOwnProperty(elementType)) ? this.ELEMENTS_BY_CLIENT_MERGED[elementType] : this.ELEMENTS_BY_CLIENT_MERGED[elementType] = {};
                    elementsByClientMerged[client] = newElementsArray;
                });
            }
        }
    }

    getAttributesFromRepo = function(thisState, predefinedID)
    {
        return this.setAttributesFromRepo(thisState, predefinedID, true);
    }

    setAttributesFromRepo = function(thisState, predefinedID, noSet = false)
    {
        let predefinedElements = ['undefined'];
        let formatSettings = undefined;
        let newRepoAttributes = [];

        if(thisState != null)
        {
            let canvasCell = thisState.view.graph.model.root;

            if(canvasCell != undefined && canvasCell.value != undefined)
                predefinedElements = (canvasCell.hasAttribute('Predefined-Elements')) ? canvasCell.value.getAttribute('Predefined-Elements').split(',') : ['default'];
        }

        let elementID = thisState.cell.getAttribute((predefinedID != undefined) ? predefinedID : 'Element-ID');

        if(window.MONDRIAN_REPO.hasElement(predefinedElements, elementID))
        {
            let element = window.MONDRIAN_REPO.getElement(predefinedElements, elementID);

            for (let attributeInRepo in element) // set data attribute
            {
                if(attributeInRepo === 'format')
                {
                    formatSettings = element[attributeInRepo].mandatorySettings;
                }
                else
                {
                    let validAttribute = (!attributeInRepo.endsWith('_tabbed') && !attributeInRepo.endsWith('_raw')); // HACK TO REMOVE ATTRIBUTES INCORRECTLY GENERATED

                    if(validAttribute)
                    {
                        let attributeValue = element[attributeInRepo];
                        newRepoAttributes.push(attributeInRepo);
        
                        if(attributeValue != '' && !noSet)
                        {
                            thisState.cell.setAttribute(attributeInRepo, element[attributeInRepo]);
                        }
                        else
                        {
                            if(!thisState.cell.hasAttribute(attributeInRepo) && !noSet)
                                thisState.cell.setAttribute(attributeInRepo, '');
                        }	
                    }
                }
            }

            // HACK TO REMOVE ATTRIBUTES INCORRECTLY GENERATED
            let dropAttributes = [];
            for (let attributeIndex = 0; attributeIndex < thisState.cell.value.attributes.length; attributeIndex++) {
                let attributeName = thisState.cell.value.attributes.item(attributeIndex).name;

                if(attributeName.endsWith('_tabbed') || attributeName.endsWith('_raw'))
                    dropAttributes.push(attributeName);
            }

            if(!noSet)
            {
                for(let attributeName in dropAttributes)
                {
                    thisState.cell.value.attributes.removeNamedItem(dropAttributes[attributeName]);
                }
                
                thisState.cell.setAttribute('repoAttributes', newRepoAttributes.join());
            }
        }
        else
        {
            if(!noSet)
                thisState.cell.setAttribute('repoAttributes', '');
        }

        return {repoAttributes: newRepoAttributes.join(), repoFormatSettings: formatSettings}
    }

    /* STENCILS */
    addStencil(name, stencil)
    {
        this.STENCILS[name] = {stencil: stencil};
    }

    hasStencil(name)
    {
        return this.STENCILS.hasOwnProperty(name);
    }

    getStencil(name)
    {
        return this.STENCILS[name].stencil;
    }

    /* ICONS */
    addIcon(group, name)
    {
        this.ICONS.push({group: group, name: name, value: name}); // FOR Selectize type ahead search
    }

    async #buildStencilRepo(stencils)
	{
		// load all stencils
		for(let stencil in stencils)
		{
			this.addStencil(stencil, stencil);
		}

		// add the repository to get the alias
		let stencilRepo = await this.#fetchJSONFromURL(MondrianRepo.#CONFIG.PATH + MondrianRepo.#CONFIG.STENCIL_REPOSITORY);
        
		for(let stencil in stencilRepo)
		{
			if(this.hasStencil(stencil))
			{
				let alias = stencilRepo[stencil].alias;
				for (let i = 0; i < alias.length; i++) {
					this.addStencil(alias[i], stencil);
				}	
			}
		}

		// strip the namespace & add as alias
		for(let stencil in stencils)
		{
			let stencilName = stencil.split('.').pop();
			if(this.hasStencil(stencil)) // an alias has precendence
			{
				this.addStencil(stencilName, stencil);
			}
		}
	}

    /* Misc */

    // Used to allow additional sites that can be used for file loading. 
    hasCorsEnabled(url) 
    {
        let urlLC = url.toLowerCase();

        let mondrianConfig = this.CONFIG.JSON;

		for(let urlKey in mondrianConfig.FileViewerURLs)
		{
            if(urlLC.startsWith(mondrianConfig.FileViewerURLs[urlKey].url))
                return true;
		}
        
        console.error('URL cannot be used for FileViewer: ', url);
        return false;
    }
}

// asynchronous factory function
async function createMondrianRepo() {
    const mondrianRepo = new MondrianRepo();
    await mondrianRepo.initialize();
    
    return mondrianRepo;
}