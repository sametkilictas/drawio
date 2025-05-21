// MondrianRepo in ES5 style
function MondrianRepo() {
  this.ELEMENTS = new Map();
  this.ELEMENTS_BY_CLIENT = {};
  this.ELEMENTS_BY_CLIENT_MERGED = {};
  this.STENCILS = {};
  this.ICONS = [];
  this.MONDRIAN_BASE_STENCIL_REGISTRY = 'mondrianbase.';
  this.MONDRIAN_ICONS_STENCIL_REGISTRY = 'mondrianicons.';
}

MondrianRepo.CONFIG = {
  PATH: window.MONDRIAN_CONFIG_PATH || 'mondrian/',
  FILE: 'baseConfig.json',
  STENCIL_REPOSITORY: 'stencils/stencilRepository.json'
};

MondrianRepo.prototype.initialize = function() {
  var self = this;
  return this._fetchJSONFromURL(MondrianRepo.CONFIG.PATH + MondrianRepo.CONFIG.FILE)
      .then(function(config) {
          self.CONFIG = config;
          self.CONFIG.PATH = MondrianRepo.CONFIG.PATH;
          return self._buildElementsRepo();
      })
      .then(function() {
        if (typeof window.mondrianStencilsInline !== 'undefined') {
            for (var filename in window.mondrianStencilsInline) {
                mxStencilRegistry.loadStencilSet('stencils/' + filename); // mimic expected path
            }
        } else {
            // fallback to loading from mondrianConfig if needed
            var mondrianConfig = self.CONFIG.JSON;
            for (var stencilKey in mondrianConfig.Stencils) {
                mxStencilRegistry.loadStencilSet(MondrianRepo.CONFIG.PATH + mondrianConfig.Stencils[stencilKey].uri);
            }
        }
        return self._buildStencilRepo(mxStencilRegistry.stencils);
      });
};

MondrianRepo.prototype.getElementRepo = function(client, elementType) {
  if (this.ELEMENTS_BY_CLIENT_MERGED[elementType]) {
      return this.ELEMENTS_BY_CLIENT_MERGED[elementType][client] || this.ELEMENTS_BY_CLIENT_MERGED[elementType]['default'];
  }
};

MondrianRepo.prototype.hasElement = function(clients, id) {
  if (id === undefined) return false;

  if (clients !== 'undefined' && clients !== 'default' && clients !== '') {
      for (var client in clients) {
          if (this.ELEMENTS.has((clients[client] + '.' + id).toLowerCase())) {
              return true;
          }
      }
  }

  return this.ELEMENTS.has(id.toLowerCase());
};

MondrianRepo.prototype.getElement = function(clients, id) {
  var definedElement;

  if (clients !== 'undefined' && clients !== 'default' && clients !== '') {
      for (var client in clients) {
          definedElement = this.ELEMENTS.get((clients[client] + '.' + id).toLowerCase());
          if (definedElement !== undefined) {
              return definedElement.element;
          }
      }
  }

  definedElement = this.ELEMENTS.get(id.toLowerCase());
  if (definedElement !== undefined) {
      return definedElement.element;
  }
};

MondrianRepo.prototype.getTemplate = function(id) {
  if (id !== undefined) {
      var template = this.ELEMENTS.get(id.toLowerCase());

      if (template !== undefined) {
          var templateElement = template.element;
          if (templateElement.templateInherit !== undefined) {
              var templatesToInherit = templateElement.templateInherit.split(',');

              for (var i = 0; i < templatesToInherit.length; i++) {
                  var templateToInherit = templatesToInherit[i];
                  var baseTemplate = this.ELEMENTS.get(templateToInherit.toLowerCase());

                  if (baseTemplate !== undefined) {
                      var baseTemplateElement = baseTemplate.element;

                      if (baseTemplateElement.style !== undefined && baseTemplateElement.style.initialSettings !== undefined) {
                          templateElement.style = templateElement.style || {};
                          templateElement.style.initialSettings = templateElement.style.initialSettings || {};
                          for (var setting in baseTemplateElement.style.initialSettings) {
                              if (templateElement.style.initialSettings[setting] === undefined) {
                                  templateElement.style.initialSettings[setting] = baseTemplateElement.style.initialSettings[setting];
                              }
                          }
                      }

                      if (baseTemplateElement.style !== undefined && baseTemplateElement.style.mandatorySettings !== undefined) {
                          templateElement.style = templateElement.style || {};
                          templateElement.style.mandatorySettings = templateElement.style.mandatorySettings || {};
                          for (var setting2 in baseTemplateElement.style.mandatorySettings) {
                              if (templateElement.style.mandatorySettings[setting2] === undefined) {
                                  templateElement.style.mandatorySettings[setting2] = baseTemplateElement.style.mandatorySettings[setting2];
                              }
                          }
                      }

                      if (baseTemplateElement.attributes !== undefined && baseTemplateElement.attributes.initialSettings !== undefined) {
                          templateElement.attributes = templateElement.attributes || {};
                          templateElement.attributes.initialSettings = templateElement.attributes.initialSettings || {};
                          for (var setting3 in baseTemplateElement.attributes.initialSettings) {
                              if (templateElement.attributes.initialSettings[setting3] === undefined) {
                                  templateElement.attributes.initialSettings[setting3] = baseTemplateElement.attributes.initialSettings[setting3];
                              }
                          }
                      }

                      if (baseTemplateElement.attributes !== undefined && baseTemplateElement.attributes.mandatorySettings !== undefined) {
                          templateElement.attributes = templateElement.attributes || {};
                          templateElement.attributes.mandatorySettings = templateElement.attributes.mandatorySettings || {};
                          for (var setting4 in baseTemplateElement.attributes.mandatorySettings) {
                              if (templateElement.attributes.mandatorySettings[setting4] === undefined) {
                                  templateElement.attributes.mandatorySettings[setting4] = baseTemplateElement.attributes.mandatorySettings[setting4];
                              }
                          }
                      }
                  }
              }
          }

          return templateElement;
      }
  }
};

MondrianRepo.prototype._fetchJSONFromURL = function(url) {
    if (window.IS_VIEWER) {
        //console.log('[Viewer Mode] Skipping fetch for:', url);
        return Promise.resolve({ URL: url, JSON: {} });
    }
    
  var fetchHeaders = {
      method: 'GET',
      mode: 'cors',
      headers: new Headers({
          'Content-Type': 'application/json; charset=UTF-8',
          'Cache-Control': 'no-cache'
      })
  };

  return fetch(window.DRAWIO_SERVER_URL + url, fetchHeaders).then(function(response) {
      if (!response.ok) {
          throw new Error("HTTP error! Status: " + response.status);
      }
      return response.json().then(function(json) {
          return { URL: url, JSON: json };
      });
  });
};

MondrianRepo.prototype._fetchJSONFromMultipeURLs = function(urls) {
  var self = this;
  var promises = urls.map(function(url) {
      return self._fetchJSONFromURL(url);
  });
  return Promise.all(promises);
};

MondrianRepo.prototype._buildElementsRepo = function() {
  var self = this;
  var elementFiles = self._getElementFiles(self.CONFIG.JSON);
  var fixedElementTypes = {
      'ABB': true, 'SBB': true, 'LN': true, 'TN': true, 'ACT': true, 'IN': true
  };

  return self._fetchJSONFromMultipeURLs(Array.from(elementFiles.keys()))
      .then(function(results) {
          for (var i = 0; i < results.length; i++) {
              var result = results[i];
              var clients = elementFiles.get(result.URL);
              for (var j = 0; j < clients.length; j++) {
                  var client = clients[j];
                  for (var elementKey in result.JSON) {
                      var type = elementKey.split('-')[0];
                      type = fixedElementTypes[type] ? type : 'Other';
                      type = result.JSON[elementKey]['Element-Type-Full'] || type;
                      self._addElement(result.JSON[elementKey]['elementType'], type, client, elementKey, result.JSON[elementKey]);
                  }
              }
          }
          self._buildMergedElementRepos();
      })
      .catch(function(error) {
          console.log('Error:', error.message);
      })
      .finally(function() {
          setTimeout(function() {
              self._buildElementsRepo();
          }, 60 * 1000);
      });
};

MondrianRepo.prototype._getElementFiles = function(mondrianConfig) {
  var elementFiles = new Map();
  for (var elementsKey in mondrianConfig.Elements) {
      if (mondrianConfig.Elements[elementsKey].uri !== undefined) {
          elementFiles.set(
              MondrianRepo.CONFIG.PATH + mondrianConfig.Elements[elementsKey].uri,
              mondrianConfig.Elements[elementsKey].client.split(',').map(function(item) { return item.trim(); })
          );
      } else {
          for (var fileKey in mondrianConfig.Elements[elementsKey].files) {
              elementFiles.set(
                  MondrianRepo.CONFIG.PATH + mondrianConfig.Elements[elementsKey].basePath + mondrianConfig.Elements[elementsKey].files[fileKey],
                  mondrianConfig.Elements[elementsKey].client.split(',').map(function(item) { return item.trim(); })
              );
          }
      }
  }
  return elementFiles;
};

MondrianRepo.prototype._addElement = function(elementType, type, client, id, element) {
  var elementKey = (client === 'default' ? id : client + '.' + id).toLowerCase();
  this.ELEMENTS.set(elementKey, { element: element });

  var elementNameProperty = undefined;
  var elementNameFullProperty = undefined;

  if (element['Element-Name'] !== undefined) {
      elementType = elementType || 'SHAPE';
      elementNameProperty = 'Element-Name';
      elementNameFullProperty = 'Element-Name-Full';
  } else if (element['Interface-Name'] !== undefined) {
      elementType = elementType || 'INTERFACE';
      elementNameProperty = 'Interface-Name';
      elementNameFullProperty = 'Interface-Name-Full';
  } else if (elementType === 'SHAPE-TEMPLATE' || elementType === 'INTERFACE-TEMPLATE') {
      elementNameProperty = 'templateName';
      elementNameFullProperty = 'templateName';
  }

  if (elementType !== undefined) {
      var elementsByClient = this.ELEMENTS_BY_CLIENT.hasOwnProperty(elementType) ? this.ELEMENTS_BY_CLIENT[elementType] : (this.ELEMENTS_BY_CLIENT[elementType] = {});
      var elementByClient = elementsByClient.hasOwnProperty(client) ? elementsByClient[client] : (elementsByClient[client] = new Map());
      elementByClient.set(id, {
          type: type,
          client: client,
          id: id,
          name: element[elementNameProperty],
          nameFull: element[elementNameFullProperty] || element[elementNameProperty]
      });
  }
};

MondrianRepo.prototype._buildMergedElementRepos = function() {
  var elementTypes = ['INTERFACE', 'SHAPE', 'INTERFACE-TEMPLATE', 'SHAPE-TEMPLATE'];
  for (var i = 0; i < elementTypes.length; i++) {
      var elementType = elementTypes[i];
      if (this.ELEMENTS_BY_CLIENT[elementType] !== undefined) {
          var clients = this.ELEMENTS_BY_CLIENT[elementType];
          for (var clientKey in clients) {
              var newElementsArray = [];
              var entries = clients[clientKey].entries();
              var entry = entries.next();
              while (!entry.done) {
                  newElementsArray.push(entry.value[1]);
                  entry = entries.next();
              }

              if (clientKey !== 'default') {
                  var defaultEntries = this.ELEMENTS_BY_CLIENT[elementType]['default'].entries();
                  var defaultEntry = defaultEntries.next();
                  while (!defaultEntry.done) {
                      var defaultKey = defaultEntry.value[0];
                      var defaultVal = defaultEntry.value[1];
                      if (!this.ELEMENTS_BY_CLIENT[elementType][clientKey].has(defaultKey)) {
                          newElementsArray.push(defaultVal);
                      }
                      defaultEntry = defaultEntries.next();
                  }
              }

              var elementsByClientMerged = this.ELEMENTS_BY_CLIENT_MERGED.hasOwnProperty(elementType) ? this.ELEMENTS_BY_CLIENT_MERGED[elementType] : (this.ELEMENTS_BY_CLIENT_MERGED[elementType] = {});
              elementsByClientMerged[clientKey] = newElementsArray;
          }
      }
  }
};

MondrianRepo.prototype.getAttributesFromRepo = function(thisState, predefinedID) {
  return this.setAttributesFromRepo(thisState, predefinedID, true);
};

MondrianRepo.prototype.setAttributesFromRepo = function(thisState, predefinedID, noSet) {
  noSet = typeof noSet !== 'undefined' ? noSet : false;

  var predefinedElements = ['undefined'];
  var formatSettings = undefined;
  var newRepoAttributes = [];

  if (thisState != null) {
      var canvasCell = thisState.view.graph.model.root;

      if (canvasCell !== undefined && canvasCell.value !== undefined) {
          predefinedElements = canvasCell.hasAttribute('Predefined-Elements')
              ? canvasCell.value.getAttribute('Predefined-Elements').split(',')
              : ['default'];
      }
  }

  var elementID = thisState.cell.getAttribute(predefinedID !== undefined ? predefinedID : 'Element-ID');

  if (window.MONDRIAN_REPO.hasElement(predefinedElements, elementID)) {
      var element = window.MONDRIAN_REPO.getElement(predefinedElements, elementID);

      for (var attributeInRepo in element) {
          if (attributeInRepo === 'format') {
              formatSettings = element[attributeInRepo].mandatorySettings;
          } else {
              var validAttribute = !(attributeInRepo.endsWith('_tabbed') || attributeInRepo.endsWith('_raw'));

              if (validAttribute) {
                  var attributeValue = element[attributeInRepo];
                  newRepoAttributes.push(attributeInRepo);

                  if (attributeValue !== '' && !noSet) {
                      thisState.cell.setAttribute(attributeInRepo, element[attributeInRepo]);
                  } else {
                      if (!thisState.cell.hasAttribute(attributeInRepo) && !noSet) {
                          thisState.cell.setAttribute(attributeInRepo, '');
                      }
                  }
              }
          }
      }

      var dropAttributes = [];
      for (var attributeIndex = 0; attributeIndex < thisState.cell.value.attributes.length; attributeIndex++) {
          var attributeName = thisState.cell.value.attributes.item(attributeIndex).name;

          if (attributeName.endsWith('_tabbed') || attributeName.endsWith('_raw')) {
              dropAttributes.push(attributeName);
          }
      }

      if (!noSet) {
          for (var i = 0; i < dropAttributes.length; i++) {
              thisState.cell.value.attributes.removeNamedItem(dropAttributes[i]);
          }

          thisState.cell.setAttribute('repoAttributes', newRepoAttributes.join());
      }
  } else {
      if (!noSet) {
          thisState.cell.setAttribute('repoAttributes', '');
      }
  }

  return {
      repoAttributes: newRepoAttributes.join(),
      repoFormatSettings: formatSettings
  };
};

// STENCILS
MondrianRepo.prototype.addStencil = function(name, stencil) {
  this.STENCILS[name] = { stencil: stencil };
};

MondrianRepo.prototype.hasStencil = function(name) {
  return this.STENCILS.hasOwnProperty(name);
};

MondrianRepo.prototype.getStencil = function(name) {
  return this.STENCILS[name].stencil;
};

// ICONS
MondrianRepo.prototype.addIcon = function(group, name) {
  this.ICONS.push({ group: group, name: name, value: name });
};

MondrianRepo.prototype._buildStencilRepo = function(stencils) {
  var self = this;

  // Load all stencils
  for (var stencil in stencils) {
      self.addStencil(stencil, stencil);
  }
  
  return self._fetchJSONFromURL(MondrianRepo.CONFIG.PATH + MondrianRepo.CONFIG.STENCIL_REPOSITORY)
      .then(function(stencilRepo) {
          for (var s in stencilRepo) {
              if (self.hasStencil(s)) {
                  var alias = stencilRepo[s].alias;
                  for (var i = 0; i < alias.length; i++) {
                      self.addStencil(alias[i], s);
                  }
              }
          }

          // Strip the namespace & add as alias
          for (var stencil in stencils) {
              var stencilName = stencil.split('.').pop();
              if (self.hasStencil(stencil)) {
                  self.addStencil(stencilName, stencil);
              }
          }
      });
};

// MISC
MondrianRepo.prototype.hasCorsEnabled = function(url) {
  var urlLC = url.toLowerCase();
  var mondrianConfig = this.CONFIG.JSON;

  for (var urlKey in mondrianConfig.FileViewerURLs) {
      if (urlLC.indexOf(mondrianConfig.FileViewerURLs[urlKey].url) === 0) {
          return true;
      }
  }

  console.error('URL cannot be used for FileViewer: ', url);
  return false;
};

// Asynchronous factory function using callback
(function(global) {
global.createMondrianRepo = function(callback, errorCallback) {
  var repo = new MondrianRepo();
  repo.initialize()
    .then(function() {
      if (typeof callback === 'function') {
        callback(repo);
      }
    })
    .catch(function(err) {
      if (typeof errorCallback === 'function') {
        errorCallback(err);
      } else {
        console.error("Error initializing MondrianRepo:", err);
      }
    });
};
})(typeof window !== 'undefined' ? window : this);
