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

    constructor() {
    }

    async initialize() {
        this.CONFIG = await this.#fetchJSONFromURL(MondrianRepo.#CONFIG.PATH + MondrianRepo.#CONFIG.FILE);
        let mondrianConfig = this.CONFIG.JSON;

        // ELEMENTS
        await this.#buildElementsRepo();

        // STENCILS
		for (let stencilKey in mondrianConfig.Stencils) {
			mxStencilRegistry.loadStencilSet(mondrianConfig.Stencils[stencilKey].uri);
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
        return definedElement.element;
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

                        this.#addElement(type, client, elementKey, result.JSON[elementKey]);
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
                    mondrianConfig.Elements[elementsKey].uri,
                    mondrianConfig.Elements[elementsKey].client.split(',').map(item => item.trim()))
            }
            else {
                for (let fileKey in mondrianConfig.Elements[elementsKey].files) {
                    elementFiles.set(
                        mondrianConfig.Elements[elementsKey].basePath + mondrianConfig.Elements[elementsKey].files[fileKey],
                        mondrianConfig.Elements[elementsKey].client.split(',').map(item => item.trim()))
                }
            }
        };

        return elementFiles;
    }

    #addElement(type, client, id, element) {
        let elementKey = ((client === 'default') ? id : client + '.' + id).toLowerCase();
        this.ELEMENTS.set(elementKey, { element: element });

        let elementType = undefined;
        let elementNameProperty = undefined;
        let elementNameFullProperty = undefined;

        if (element['Element-Name'] != undefined) {
            elementType = 'SHAPE';
            elementNameProperty = 'Element-Name';
            elementNameFullProperty = 'Element-Name-Full';
        }
        else if (element['Interface-Name'] != undefined) {
            elementType = 'INTERFACE';
            elementNameProperty = 'Interface-Name';
            elementNameFullProperty = 'Interface-Name-Full';
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
        let elementTypes = ['INTERFACE', 'SHAPE'];

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
		let stencilRepo = await this.#fetchJSONFromURL(MondrianRepo.#CONFIG.PATH + MondrianRepo.#CONFIG.STENCIL_REPOSITORY);;
        
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