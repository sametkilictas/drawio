/**
 * Copyright (c) 2006-2024, JGraph Ltd
 * Copyright (c) 2006-2024, draw.io AG
 */
// Overrides of global vars need to be pre-loaded
window.DRAWIO_PUBLIC_BUILD = true;
window.EXPORT_URL = 'REPLACE_WITH_YOUR_EXPORT_SERVER';
window.PLANT_URL = 'REPLACE_WITH_YOUR_PLANTUML_SERVER';
window.DRAW_MATH_URL = 'math/es5';

 //window.MONDRIAN_CONFIG_PATH = 'FAKE/';

window.DRAWIO_SERVER_URL = this.getBaseURL(window.location.href) + '/';
function getBaseURL(locationHREF)
{
    let hashPosition = locationHREF.indexOf('#');
    if (hashPosition > 0)
        locationHREF = locationHREF.slice(0, hashPosition);
    let stack = locationHREF.split('/');
    stack.pop();
    return stack.join('/');
}
window.DRAWIO_BASE_URL = window.DRAWIO_SERVER_URL.slice(0, -1);

window.DRAWIO_VIEWER_URL = window.DRAWIO_BASE_URL + '/js/viewer.min.js';; // Replace your path to the viewer js, e.g. https://www.example.com/js/viewer.min.js
window.DRAWIO_LIGHTBOX_URL = window.DRAWIO_BASE_URL; // Replace with your lightbox URL, eg. https://www.example.com

// MONDRIAN CONFIGURATION
let xhr = new XMLHttpRequest();
xhr.open('GET', window.DRAWIO_SERVER_URL + 'mondrian/mondrianDiagrams.configuration', false);
xhr.send();
let mondrianConfig = JSON.parse(xhr.responseText);

window.DRAWIO_CONFIG = mondrianConfig.appConfiguration; // Replace with your custom draw.io configurations. For more details, https://www.drawio.com/doc/faq/configure-diagram-editor

window.DRAWIO_GITHUB_ID = 'Iv1.ebfbd064bd030c44';
window.DRAWIO_GITHUB_APP_MONDRIAN = 'https://github.com/apps/test-mondrian-diagrams';
//urlParams['offline'] = 1;
//urlParams['pwa'] = 0;

urlParams['sync'] = 'manual';

urlParams['browser'] = '1'; // enable save to browser
urlParams['gh'] = '1'; // enable save to GitHub

urlParams['db'] = '0'; //dropbox
urlParams['tr'] = '0'; //trello

urlParams['picker'] = '0';
urlParams['gapi'] = '0'; //google drive

urlParams['od'] = '0'; //onedrive
urlParams['gl'] = '0'; //gitlab
