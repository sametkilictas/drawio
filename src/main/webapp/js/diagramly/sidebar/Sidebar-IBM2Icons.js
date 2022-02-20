(function()
{
    Sidebar.prototype.addIBM2IconPalette = function()
    {
		let baseURL = (new RegExp(/^.*\//)).exec(window.location.href)[0];
		let sidebarURL = baseURL + 'js/diagramly/sidebar/ibm/IBM2MondrianIcons.json';
		let sideBarConfig = `{"id": "ibm2icons", "name": "IBM" , "url": "${sidebarURL}" }`;

		this.addIBM2MondrianPalette([JSON.parse(sideBarConfig)], addSidebarBase = false);

		let stencilURL = baseURL + 'stencils/ibm/ibm2mondrian_batch_1.xml';
		mxStencilRegistry.loadStencilSet(stencilURL);
	};
})();
