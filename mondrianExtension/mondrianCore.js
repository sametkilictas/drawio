/**
 * ES5-compatible MondrianCore singleton
 */
(function (global) {
    var mondrianCoreInstance = null;

    function MondrianCore() {
        if (mondrianCoreInstance) {
            return mondrianCoreInstance;
        }

        this.CONFIG = {
            TAG_FONT: 'Roboto Mono',
            COLOR: {
                PALETTE: {
                    red: { light: '#FFEBEE', medium: '#E53935', dark: '#B71C1C' },
                    magenta: { light: '#FCE4EC', medium: '#D81B60', dark: '#880E4F' },
                    purple: { light: '#F3E5F5', medium: '#8E24AA', dark: '#4A148C' },
                    cyan: { light: '#E0F7FA', medium: '#00ACC1', dark: '#006064' },
                    blue: { light: '#E3F2FD', medium: '#1E88E5', dark: '#0D47A1' },
                    teal: { light: '#E0F2F1', medium: '#00897B', dark: '#004D40' },
                    green: { light: '#E8F5E9', medium: '#43A047', dark: '#1B5E20' },
                    limegreen: { light: '#CCFF90', medium: '#64DD17', dark: '#33691E' },
                    yellow: { light: '#FFFDE7', medium: '#FDD835', dark: '#F57F17' },
                    orange: { light: '#FFF3E0', medium: '#FB8C00', dark: '#E65100' },
                    gray: { light: '#ECEFF1', medium: '#546E7A', dark: '#263238' },
                    black: { light: '#ECEFF1', medium: '#000000', dark: '#000000' },
                    black_label: { medium: '#666666', dark: '#000000' }
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
        };

        mondrianCoreInstance = this;
    }

    MondrianCore.prototype.initialize = function (callback) {
        if (callback) callback();
    };

    MondrianCore.prototype.getSelectedColorSpecification = function (colorFamily) {
        if (this.CONFIG.COLOR.PALETTE.hasOwnProperty(colorFamily)) {
            return this.CONFIG.COLOR.PALETTE[colorFamily];
        } else {
            return { light: '#f2f4f8', medium: '#000000', dark: '#000000' };
        }
    };

    MondrianCore.prototype.getColor = function (colorFamily, colorIntensity) {
        var intensity = this.CONFIG.COLOR.INTENSITY;
        if (colorFamily === intensity.NO_COLOR) return 'none';
        if (colorFamily === intensity.WHITE) return '#ffffff';

        switch (colorIntensity) {
            case intensity.NO_COLOR: return 'none';
            case intensity.WHITE: return '#ffffff';
            case intensity.VERY_LIGHT:
            case intensity.LIGHT:
                return this.getSelectedColorSpecification(colorFamily)[intensity.LIGHT];
            case intensity.MEDIUM:
                return this.getSelectedColorSpecification(colorFamily)[intensity.MEDIUM];
            case intensity.DARK:
                return this.getSelectedColorSpecification(colorFamily)[intensity.DARK];
        }
    };

    MondrianCore.prototype.isDarkColor = function (color, colorIntensity) {
        if (color === '#000000') return true;
        if (color === '#ffffff') return false;
        if (color === this.CONFIG.COLOR.PALETTE.yellow.medium) return false;

        return colorIntensity === this.CONFIG.COLOR.INTENSITY.MEDIUM ||
            colorIntensity === this.CONFIG.COLOR.INTENSITY.DARK;
    };

    MondrianCore.prototype.getStyleValue = function (style, key, defaultValue) {
        var value = 'undefined';
        var keyIndex = style.indexOf(key + '=');
        if (keyIndex > 0) {
            var valueSeparator = style.indexOf('=', keyIndex + 1);
            var keySeparator = style.indexOf(';', valueSeparator + 1);
            if (keySeparator < 0) keySeparator = style.length;
            value = style.substring(valueSeparator + 1, keySeparator);
        }
        return (value === 'undefined' && defaultValue !== undefined) ? defaultValue : value;
    };

    MondrianCore.prototype.getStrokeColor = function (currentStyle, colorFamilyOverride, colorIntensityOverride) {
        var CORE = mondrianCoreInstance;
        var colorFamilyLine = colorFamilyOverride || CORE.getStyleValue(currentStyle, 'colorFamilyLine', 'black');
        var colorIntensityLine = colorIntensityOverride || CORE.getStyleValue(currentStyle, 'colorIntensityLine', 'medium');
        return CORE.getColor(colorFamilyLine, colorIntensityLine);
    };

    MondrianCore.prototype.updateStyle = function (thisState, mandatoryStyles, defaultStyles, doBeginUpdate) {
        doBeginUpdate = (typeof doBeginUpdate === 'undefined') ? true : doBeginUpdate;
        if (!thisState) return;

        var CORE = mondrianCoreInstance;
        var INTENSITY = CORE.CONFIG.COLOR.INTENSITY;

        var newStyles = thisState.cell.style;
        var currentStyles = thisState.cell.style;

        var template = global.MONDRIAN_REPO.getTemplate(CORE.getStyleValue(newStyles, 'template'));
        if (template && template.style) {
            var initTemplate = CORE.getStyleValue(newStyles, 'initTemplate') !== 'undefined';

            if (template.style.mandatorySettings) {
                for (var setting in template.style.mandatorySettings) {
                    newStyles = mxUtils.setStyle(newStyles, setting, template.style.mandatorySettings[setting]);
                }
            }
            if (template.style.initialSettings && initTemplate) {
                for (var setting in template.style.initialSettings) {
                    newStyles = mxUtils.setStyle(newStyles, setting, template.style.initialSettings[setting]);
                }
                newStyles = mxUtils.setStyle(newStyles, 'initTemplate', null);
            }
        }

        var i, parts, propValue;
        if (mandatoryStyles) {
            parts = mandatoryStyles.split(';');
            for (i = 0; i < parts.length; i++) {
                var kv = parts[i].split('=');
                newStyles = mxUtils.setStyle(newStyles, kv[0], kv[1]);
            }
        }

        if (defaultStyles) {
            parts = defaultStyles.split(';');
            for (i = 0; i < parts.length; i++) {
                var kv = parts[i].split('=');
                propValue = CORE.getStyleValue(newStyles, kv[0]);
                if (propValue === 'undefined') {
                    newStyles = mxUtils.setStyle(newStyles, kv[0], kv[1]);
                }
            }
        }

        var colorFamilyOverride, colorIntensityOverride;
        if (thisState.view.graph && thisState.view.graph['mondrianHighlightPredefinedEnabled']) {
            var isPreDefined = thisState.cell.getAttribute('repoAttributes', '') !== '';
            colorFamilyOverride = isPreDefined ? 'green' : 'red';
            colorIntensityOverride = INTENSITY.MEDIUM;
        }

        newStyles = mxUtils.setStyle(newStyles, 'strokeColor', CORE.getStrokeColor(newStyles, colorFamilyOverride, colorIntensityOverride));

        if (newStyles !== currentStyles) {
            if (doBeginUpdate) thisState.view.graph.model.beginUpdate();
            try {
                thisState.view.graph.model.setStyle(thisState.cell, newStyles);
            } finally {
                if (doBeginUpdate) thisState.view.graph.model.endUpdate();
            }
        }
    };

    MondrianCore.prototype.addAttributes = function (element, elementType, labelColor, labelOnDarkBackground) {
        var CORE = mondrianCoreInstance;
        var REPO = global.MONDRIAN_REPO;
        var mondrianStyleProperties = { ATTRIBUTES_TEXT: 'attributesText', FORMAT_TEXT: 'formatText' };
        var mondrianBaseVersionAttribute = 'mondrianVersion';
        var mondrianBaseVersion = '1.0.0';
        var mondrianBaseElementID = { mxMondrianConnector: 'Interface-ID', mxMondrianShape: 'Element-ID' };
        var mondrianBaseAttributes = { mxMondrianConnector: ['Interface-ID', 'Interface-Name'], mxMondrianShape: ['Element-ID', 'Element-Name', 'Icon-Name', 'Tag-Text'] };
        var mondrianBaseDefaultAttributes = { mxMondrianConnector: ["Interface-Name", "Interface-ID", "noText"], mxMondrianShape: ["Element-Name", "Element-ID", "noText"] };
        var mondrianBaseLabelSettings = { mxMondrianConnector: 'defaultSettingsConnector', mxMondrianShape: 'defaultSettings' };

        if (element.state != null) {
            var cell = element.state.cell;

            if (!mxUtils.isNode(cell.value)) {
                var obj = mxUtils.createXmlDocument().createElement('UserObject');
                obj.setAttribute('label', cell.value);
                cell.value = obj;
            }

            if (cell.value.getAttribute(mondrianBaseVersionAttribute) != mondrianBaseVersion) {
                cell.value.setAttribute(mondrianBaseVersionAttribute, mondrianBaseVersion);
                cell.value.setAttribute('placeholders', '1');

                for (var i = 0; i < mondrianBaseAttributes[elementType].length; i++) {
                    var attr = mondrianBaseAttributes[elementType][i];
                    if (!cell.value.hasAttribute(attr)) {
                        cell.value.setAttribute(attr, '');
                    }
                }
            }

            var template = REPO.getTemplate(CORE.getStyleValue(cell.style, 'template'));
            if (template != null) {
                var templateAttributes = [];
                var templateAttributesMandatory = [];
                if (template.attributes != null) {
                    if (template.attributes.mandatorySettings != null) {
                        for (var setting in template.attributes.mandatorySettings) {
                            cell.value.setAttribute(setting, template.attributes.mandatorySettings[setting]);
                            templateAttributes.push(setting);
                            templateAttributesMandatory.push(setting);
                        }
                    }
                    if (template.attributes.initialSettings != null) {
                        for (var setting in template.attributes.initialSettings) {
                            if (cell.getAttribute(setting, '') === '') {
                                cell.value.setAttribute(setting, template.attributes.initialSettings[setting]);
                            }
                            templateAttributes.push(setting);
                        }
                    }
                }
                cell.value.setAttribute('templateAttributes', templateAttributes.join(','));
                cell.value.setAttribute('templateAttributesMandatory', templateAttributesMandatory.join(','));
            } else {
                cell.value.setAttribute('templateAttributes', null);
                cell.value.setAttribute('templateAttributesMandatory', null);
            }

            REPO.setAttributesFromRepo(element.state, mondrianBaseElementID[elementType]);

            var attributesText = CORE.getStyleValue(cell.style, mondrianStyleProperties.ATTRIBUTES_TEXT);
            var attributesChanged = false;
            var attributes = [];
            if (attributesText === undefined || attributesText === 'undefined') {
                attributes = mondrianBaseDefaultAttributes[elementType];
                attributesChanged = true;
            } else {
                var formatText = CORE.getStyleValue(cell.style, mondrianStyleProperties.FORMAT_TEXT, 'default:1');
                var attributesCount = 0;
                if (formatText === 'default:1') attributesCount = 1;
                else if (formatText === 'default' || formatText === 'default:1,2') attributesCount = 2;
                else if (formatText === 'default:1,2,3') attributesCount = 3;

                attributes = attributesText.split(',');
                for (var j = 0; j < attributes.length; j++) {
                    if (attributes[j] === 'default') {
                        attributes[j] = (j < attributesCount) ? mondrianBaseDefaultAttributes[elementType][j] : 'noText';
                        attributesChanged = true;
                    }
                }
            }

            if (attributesChanged) {
                attributesText = attributes.join(',');
                cell.style = mxUtils.setStyle(cell.style, mondrianStyleProperties.ATTRIBUTES_TEXT, attributesText);
            }

            cell.value.setAttribute('label', CORE.defineLabel(attributesText, cell, mondrianBaseLabelSettings[elementType], labelColor, labelOnDarkBackground));
        }
    };

    MondrianCore.prototype.defineLabel = function (attributesText, currentCell, settings, labelColor, labelOnDarkBackGround, labelTemplate) {
        if(window.IS_VIEWER)
            return currentCell.getAttribute('label');
        
        labelColor = labelColor || 'black';
        labelOnDarkBackGround = !!labelOnDarkBackGround;
        labelTemplate = labelTemplate || 'default';

        var formatText = this.getLabelFormat(attributesText, labelTemplate);
        var currentLabelValue = currentCell.getAttribute('label');
        currentCell.style = mxUtils.setStyle(currentCell.style, 'noLabel', (formatText === 'nolabel') ? 1 : 0);

        var elementDefaultSettings = global.MONDRIAN_REPO.getElement(['default'], settings || 'defaultSettings');
        var labelFormats = elementDefaultSettings.labelFormats;
        var labelDefaults = elementDefaultSettings.labelDefaultAttributes;

        var attributes = (attributesText === 'undefined' || typeof attributesText === 'undefined') ? labelDefaults : attributesText.split(',');
        var labelFormatFilter = (formatText === 'undefined' || typeof formatText === 'undefined') ? elementDefaultSettings.labelDefaultFormat : formatText;
        var labelAttributes = [];

        for (var i = 0; i < attributes.length; i++) {
            if (attributes[i] === 'default') {
                labelAttributes.push(labelDefaults[i]);
            } else if (attributes[i] === 'noText') {
                labelAttributes.push('');
            } else {
                labelAttributes.push(attributes[i]);
            }
        }

        var labelValue = labelFormats[labelFormatFilter] || labelFormats['default'];

        for (var i = 0; i < labelAttributes.length; i++) {
            labelValue = labelValue.replace('@' + i, labelAttributes[i]);
            labelValue = labelValue.replace('%%', '');
        }

        var colorFamily = (labelColor === 'black') ? 'black_label' : labelColor;
        var labelColors = labelOnDarkBackGround ? ['#ffffff', '#ffffff'] : [
            this.CONFIG.COLOR.PALETTE[colorFamily].dark,
            this.CONFIG.COLOR.PALETTE[colorFamily].medium
        ];

        for (var i = 0; i < labelColors.length; i++) {
            labelValue = labelValue.replace('HEX' + i, labelColors[i]);
            labelValue = labelValue.replace('%%', '');
        }

        return (labelValue === 'CUSTOM') ? currentLabelValue : labelValue;
    };

    MondrianCore.prototype.getLabelFormat = function (labelAttributes, labelTemplate) {
        var attributes = labelAttributes.split(',');
        var highestKeyWithAttribute = -1;

        for (var i = 0; i < attributes.length; i++) {
            if (attributes[i] !== 'noText') {
                highestKeyWithAttribute = i;
            }
        }

        var labelFormat;
        switch (highestKeyWithAttribute) {
            case -1:
                labelFormat = 'nolabel';
                break;
            case 0:
                labelFormat = labelTemplate + ':1';
                break;
            case 1:
                labelFormat = labelTemplate + ':1,2';
                break;
            default:
                labelFormat = labelTemplate + ':1,2,3';
                break;
        }

        return labelFormat;
    };

    global.createMondrianCore = function (callback) {
        var core = new MondrianCore();
        core.initialize(callback);
        return core;
    };

    if (typeof App === 'undefined') {
        if (typeof global.MONDRIAN_CORE === 'undefined') {
            global.MONDRIAN_CORE = global.createMondrianCore();
        }
    }
})(typeof window !== 'undefined' ? window : this);
