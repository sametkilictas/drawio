// Singleton instance
let mondrianCoreInstance = null;

class MondrianCore {
  constructor() {
        if (!mondrianCoreInstance) {
            mondrianCoreInstance = this;
        } else {
        return mondrianCoreInstance;
        }
    }  

    async initialize() {
    }

    CONFIG = {
        TAG_FONT : 'Roboto Mono',

        // Material Design Definitions https://material.io/design/color/the-color-system.html#tools-for-picking-colors

        COLOR: {
            PALETTE: {
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
                black: {light: '#ECEFF1', medium: '#000000', dark: '#000000'},
                black_label: {medium: '#666666', dark: '#000000'}                   // Special entry only used for fontColor of Labels
            },

            INTENSITY: {
                NO_COLOR: 'noColor',
                WHITE: 'white',
                VERY_LIGHT: 'veryLight',
                LIGHT: 'light',
                MEDIUM: 'medium',
                DARK: 'dark'
            }
        }
    }

    // COLOR FUNCTIONS
    getColor = function(colorFamily, colorIntensity) {
        switch(colorFamily)
        {
            case 'noColor':
                return 'none';
            case 'white':
                return '#ffffff';
        }
    
        let intensity = this.CONFIG.COLOR.INTENSITY;
        switch(colorIntensity) 
        {
            case intensity.NO_COLOR:
                return 'none';
            case intensity.WHITE:
                return '#ffffff';
            case intensity.VERY_LIGHT:
            case intensity.LIGHT:
                return this.getSelectedColorSpecification(colorFamily)[intensity.LIGHT];
            case intensity.MEDIUM:
                return this.getSelectedColorSpecification(colorFamily)[intensity.MEDIUM];
            case intensity.DARK:
                return this.getSelectedColorSpecification(colorFamily)[intensity.DARK];
        }
    }

    getSelectedColorSpecification = function(colorFamily) {
        if(this.CONFIG.COLOR.PALETTE.hasOwnProperty(colorFamily))
            return this.CONFIG.COLOR.PALETTE[colorFamily];
        else
            return {light: '#f2f4f8', medium: '#000000', dark: '#000000'}
    }

    isDarkColor = function(color, colorIntensity)
    {
        if(color === '#000000') // black
            return true;
        else if(color === '#ffffff') // white
            return false;
        else if(color === this.CONFIG.COLOR.PALETTE.yellow.medium) // yellow medium is an exception. This will be light as well.
            return false;
        else
            return (colorIntensity === this.CONFIG.COLOR.INTENSITY.MEDIUM || colorIntensity === this.CONFIG.COLOR.INTENSITY.DARK);
    }

    getStrokeColor = function (currentStyle, colorFamilyOverride, colorIntensityOverride) {
        const CORE = window.MONDRIAN_CORE;

        let colorFamilyLine = (colorFamilyOverride) ?  
            colorFamilyOverride : 
            CORE.getStyleValue(currentStyle, 'colorFamilyLine', 'black');

        let colorIntensityLine = (colorIntensityOverride) ? 
            colorIntensityOverride : 
            CORE.getStyleValue(currentStyle, 'colorIntensityLine', 'medium');
        
        return CORE.getColor(colorFamilyLine, colorIntensityLine);
    }

    // UTIL FUNCTIONS
    getStyleValue = function(style, key, defaultValue)
    {
        var value = 'undefined';
        var keyIndex = style.indexOf(key + '=');

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

    updateStyle = function(thisState, mandatoryStyles, defaultStyles, doBeginUpdate = true)
    {
        if (thisState != null)
        { 
            const CORE = window.MONDRIAN_CORE;
            const INTENSITY = CORE.CONFIG.COLOR.INTENSITY;
    
            let newStyles = (thisState != null) ? thisState.cell.style : undefined;
            let currentStyles = (thisState != null) ? thisState.cell.style : undefined;
    
            // check if a formatConnector template is specified and if so apply this first
            let formatConnector = CORE.getStyleValue(newStyles, 'formatConnector', undefined);
            
            if(formatConnector != undefined && formatConnector != 'undefined')
            {
                let connectFormatString = window.MONDRIAN_REPO.getElement('default','connectorFormats').formats[formatConnector];
                let connectFormat = connectFormatString.toString().split(';');
                for (let j = 0; j< connectFormat.length; j++)
                {
                    let styleAttribute = connectFormat[j].toString().split('=');
                    newStyles = mxUtils.setStyle(newStyles, styleAttribute[0], styleAttribute[1]);
                }
            }
    
            // apply the MANDATORY styles that have been given to this function
            let newStylePartials = (mandatoryStyles != undefined) ? mandatoryStyles.split(';') : [];
            for (let j = 0; j< newStylePartials.length; j++)
            {
                let styleAttribute = newStylePartials[j].toString().split('=');
                newStyles = mxUtils.setStyle(newStyles, styleAttribute[0], styleAttribute[1]);
            }
    
            // apply the DEFAULT styles that have been given to this function
            newStylePartials = (defaultStyles != undefined) ? defaultStyles.split(';') : [];
            for (let j = 0; j< newStylePartials.length; j++)
            {
                let styleAttribute = newStylePartials[j].toString().split('=');
                let propValue = CORE.getStyleValue(newStyles, styleAttribute[0]);
    
                if(propValue == 'undefined')
                    newStyles = mxUtils.setStyle(newStyles, styleAttribute[0], styleAttribute[1]);
            }
    
            // strokeColor is based on the colorFamily and intensity and the #HEX value must be re-established after the update
            let colorFamilyOverride;
            let colorIntensityOverride;
    
            if(thisState.view.graph != undefined && thisState.view.graph['mondrianHighlightPredefinedEnabled'])
            {
                let isPreDefined = ((thisState.cell.getAttribute('repoAttributes','')) != '');
                colorFamilyOverride = (isPreDefined) ? 'green' : 'red';
                colorIntensityOverride = (isPreDefined) ? INTENSITY.MEDIUM : INTENSITY.MEDIUM;
            }
    
            newStyles = mxUtils.setStyle(newStyles, 'strokeColor', CORE.getStrokeColor(newStyles, colorFamilyOverride, colorIntensityOverride));
    
            if(newStyles != currentStyles)
            {
                if (doBeginUpdate)
                    thisState.view.graph.model.beginUpdate();
                try
                {
                    thisState.view.graph.model.setStyle(thisState.cell, newStyles);	
                }
                finally
                {
                    if(doBeginUpdate)
                        thisState.view.graph.model.endUpdate();
                }
            }
        }
    }
        
    addAttributes = function(element, elementType, labelColor, labelOnDarkBackground)
    {
        const mondrianStyleProperties = {ATTRIBUTES_TEXT: 'attributesText', FORMAT_TEXT: 'formatText'};
        const mondrianBaseVersionAttribute = 'mondrianVersion';
        const mondrianBaseVersion = '1.0.0';

        const mondrianBaseElementID =           {mxMondrianConnector: 'Interface-ID', mxMondrianShape: 'Element-ID'};
        const mondrianBaseAttributes =          {mxMondrianConnector: ['Interface-ID', 'Interface-Name'], mxMondrianShape: ['Element-ID', 'Element-Name', 'Icon-Name', 'Tag-Text']};
        const mondrianBaseDefaultAttributes =   {mxMondrianConnector: ["Interface-Name", "Interface-ID", "noText"], mxMondrianShape: ["Element-Name", "Element-ID", "noText"]};
        const mondrianBaseLabelSettings =       {mxMondrianConnector: 'defaultSettingsConnector', mxMondrianShape:'defaultSettings'};
        if(element.state != null)
        {
            const CORE = window.MONDRIAN_CORE;
            const REPO = window.MONDRIAN_REPO;
            let cell = element.state.cell;
    
            // Set UserObject
            if (!mxUtils.isNode(cell.value)) {
                let obj = mxUtils.createXmlDocument().createElement('UserObject');
                obj.setAttribute('label', cell.value);			
                cell.value = obj;
            }
    
            // Set Default Attributes
            if(cell.value.getAttribute(mondrianBaseVersionAttribute) != mondrianBaseVersion)
            {
                cell.value.setAttribute(mondrianBaseVersionAttribute, mondrianBaseVersion);
                cell.value.setAttribute('placeholders', '1');
    
                for (let attributeIndex = 0; attributeIndex < mondrianBaseAttributes[elementType].length; attributeIndex++ )
                {
                    if(!cell.value.hasAttribute(mondrianBaseAttributes[elementType][attributeIndex]))
                        cell.value.setAttribute(mondrianBaseAttributes[elementType][attributeIndex], '');
                }
            }
    
            // Set Repo Attributes
            REPO.setAttributesFromRepo(element.state, mondrianBaseElementID[elementType]);
    
            // Set Label Value
            let attributesText = CORE.getStyleValue(cell.style, mondrianStyleProperties.ATTRIBUTES_TEXT, undefined);
            let attributesChanged = false;
            let attributes = [];
    
            if(attributesText === undefined || attributesText === 'undefined')
            {
                attributes = mondrianBaseDefaultAttributes[elementType];
                attributesChanged = true;
            }
            else
            {
                let formatText = CORE.getStyleValue(cell.style, mondrianStyleProperties.FORMAT_TEXT, 'default:1');
                let attributesCount = 0;
    
                // to support transition away from separate value to control textFormat
                if(formatText === 'default:1')
                    attributesCount = 1;
                else if(formatText === 'default' || formatText === 'default:1,2')
                    attributesCount = 2;
                else if(formatText === 'default:1,2,3')
                    attributesCount = 3;
    
                attributes = attributesText.split(',');
                for (let i = 0; i < attributes.length; i++)
                {
                    if(attributes[i] === 'default')
                    {
                        if(i < attributesCount)
                            attributes[i] = mondrianBaseDefaultAttributes[elementType][i];
                        else
                            attributes[i] = 'noText';
    
                        attributesChanged = true;
                    }
                }
            }
    
            if(attributesChanged)
            {
                attributesText = attributes.join(",");
                cell.style = mxUtils.setStyle(cell.style, mondrianStyleProperties.ATTRIBUTES_TEXT, attributesText);
            }
            
            cell.value.setAttribute('label',
                CORE.defineLabel(attributesText, cell, mondrianBaseLabelSettings[elementType], labelColor, labelOnDarkBackground));
        }
    }    


    getLabelFormat = function(labelAttributes)
    {
        let attributes = labelAttributes.split(',');

        let highestKeyWithAttribute = -1;

        for (const [key, value] of attributes.entries()) {
            if(value != 'noText')
                highestKeyWithAttribute = key;
        }

        let labelFormat = undefined;

        switch(highestKeyWithAttribute) {
            case -1:
                labelFormat = 'nolabel';
                break;
            case 0:
                labelFormat = 'default:1';
                break;
            case 1:
                labelFormat = 'default:1,2';
                break;
            default:
                labelFormat = 'default:1,2,3';
        }

        return labelFormat;
    }

    defineLabel = function(attributesText, currentCell, settings, labelColor = 'black', labelOnDarkBackGround = false)
    {
        let formatText = this.getLabelFormat(attributesText);
        let currentLabelValue = currentCell.getAttribute('label');
        currentCell.style = mxUtils.setStyle(currentCell.style, 'noLabel', (formatText === 'nolabel' ) ? 1 : 0);

        let elementDefaultSettings = window.MONDRIAN_REPO.getElement(['default'],(settings != undefined) ? settings : 'defaultSettings');
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
        
        // data values
        for (let i = 0; i < labelAttributes.length; i++)
        {
            labelValue = labelValue.replace('@'+i,labelAttributes[i]);
            labelValue = labelValue.replace('%%','');
        }

        // colors
        let colorFamily = (labelColor === 'black') ? 'black_label' : labelColor;
        let labelColors = (labelOnDarkBackGround) ? ['#ffffff','#ffffff'] : [this.CONFIG.COLOR.PALETTE[colorFamily].dark,this.CONFIG.COLOR.PALETTE[colorFamily].medium];

        for (let i = 0; i < labelColors.length; i++)
        {
            labelValue = labelValue.replace('HEX'+i,labelColors[i]);
            labelValue = labelValue.replace('%%','');
        }

        return (labelValue === 'CUSTOM') ? currentLabelValue : labelValue;
    }
}

// asynchronous factory function
async function createMondrianCore() {
    const mondrianCore = new MondrianCore();
    await mondrianCore.initialize();
    
    return mondrianCore;
}