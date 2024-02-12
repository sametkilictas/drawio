/**
 * Class: mxMondrianDeploymentUnit
 * Extends <mxShape> to implement shapes that provide a Deployment Unit that is compliant with the Mondrian Design Method
 */
function mxMondrianDeploymentUnit(bounds, fill, stroke, strokewidth)
{
    mxShape.call(this);
    this.bounds = bounds;
    this.fill = fill;
    this.stroke = stroke;
    this.strokewidth = (strokewidth != null) ? strokewidth : 1;
};

mxUtils.extend(mxMondrianDeploymentUnit, mxShape);

mxMondrianDeploymentUnit.prototype.cst = 
{
        MONDRIAN_DU : 'mxgraph.mondrian.du',
        SHAPE_TYPE : 'shapeType',
        SHAPE_TYPE_DEFAULT : 'd',	 
        DU_COLOR : 'duColor',
        DU_COLOR_DEFAULT : 'black:noColor:noColor'	
};

mxMondrianDeploymentUnit.prototype.customProperties = [
   {name:'shapeType', dispName:'Type', type:'enum', defVal:'d',
       enumList:[
           {val:'d', dispName: 'Data'}, {val:'e', dispName: 'Execution'}, {val:'i', dispName: 'Installation'}, {val:'p', dispName: 'Presentation'}, 
           {val:'td', dispName: 'Technical Data'}, {val:'te', dispName: 'Technical Execution'}, {val:'ti', dispName: 'Technical Installation'}, {val:'tp', dispName: 'Technical Presentation'}
       ]
   }
];

// The ShapeVisualDefinition contains all properties that define color of various parts of the Shape
mxMondrianDeploymentUnit.prototype.getShapeVisualDefinition = function (thisShape, shapeType)
{
   // basic colors
   const WHITE = '#ffffff';
   const BLACK = '#000000';

   // VD properties
   let shapeVD = {
       shape: {visible:false, type: shapeType, width: null, height: null, radius: null, leftOffSet: null},
       icon: {visible: false, color: null, size: null, spacing: null, rotate: 0, flipH: false, flipV: false},
       text: {color: null, labelBoundsHeight: 16, labelBoundsOffSetLeft: 24},
   };

   shapeVD.icon.visible = true;
   shapeVD.icon.color = BLACK;
   shapeVD.icon.spacing = 0;
   shapeVD.icon.size = 16;

   return shapeVD;
};

mxMondrianDeploymentUnit.prototype.init = function(container)
{
   let mondrianAttributes = ['Element-ID', 'Element-Name'];
    for (attributeIndex = 0; attributeIndex < mondrianAttributes.length; attributeIndex++ ) {
        if(!this.state.cell.hasAttribute(mondrianAttributes[attributeIndex]))
        {
            this.state.cell.setAttribute(mondrianAttributes[attributeIndex],'')
        }
    }
    mxShape.prototype.init.apply(this, arguments); 
};

/**
 * Function: redraw
 *
 * Reconfigures this shape. This will update the attributees of the Shape.
 */
 mxMondrianDeploymentUnit.prototype.redraw = function()
 {
    this.shapeType = mxUtils.getValue(this.style, mxMondrianDeploymentUnit.prototype.cst.SHAPE_TYPE, mxMondrianDeploymentUnit.prototype.cst.SHAPE_TYPE_DEFAULT);
    
    mxShape.prototype.redraw.apply(this, arguments);
 };

 mxMondrianDeploymentUnit.prototype.paintVertexShape = function(c, x, y, w, h)
{	
   const CORE = window.MONDRIAN_CORE;
   const INTENSITY = CORE.CONFIG.COLOR.INTENSITY;

   this.shapeVisualDefinition = mxMondrianDeploymentUnit.prototype.getShapeVisualDefinition(this,this.shapeType);

   let duColor = mxUtils.getValue(this.style, mxMondrianDeploymentUnit.prototype.cst.DU_COLOR, mxMondrianDeploymentUnit.prototype.cst.DU_COLOR_DEFAULT).split(':');
   let textColor = CORE.getColor(duColor[0], INTENSITY.MEDIUM);
   let strokeColor = CORE.getColor(duColor[1], INTENSITY.MEDIUM);
   let fillColor = CORE.getColor(duColor[2], INTENSITY.MEDIUM);

   c.translate(x, y);

   c.setFillColor(fillColor);
   c.setStrokeColor(strokeColor);
   c.rect(0, 0, w, h);
   c.fillAndStroke();
   
   this.paintIcon(c);

   const standardBlack = CORE.getColor('black', INTENSITY.MEDIUM);
   const standardGray = CORE.getColor('gray', INTENSITY.MEDIUM);

   fontColor = this.style.fontColor;
   if(fontColor != textColor && (fontColor === standardBlack || fontColor === standardGray || fontColor === 'undefined'))
   {
       this.style.fontColor = textColor;
       styleCurrent = this.state.view.graph.model.getStyle(this.state.cell);
       newStyle = mxUtils.setStyle(styleCurrent, 'fontColor', this.style.fontColor);
       this.state.view.graph.model.setStyle(this.state.cell, newStyle);
   }
};


mxMondrianDeploymentUnit.prototype.paintIcon = function(c)
{
    let svd = this.shapeVisualDefinition;
    if(svd.icon.visible)
    {
        let positionX = svd.icon.spacing;
        let positionY = svd.icon.spacing;

        let iconStencilName = this.shapeType;

        // Determine what Icon to show
        let showStencilIcon = true;

        // Retrieve the stencil from the registry 
        let iconStencil = null;
        if(showStencilIcon)
        {
            iconStencil = mxStencilRegistry.getStencil(window.MONDRIAN_REPO.MONDRIAN_BASE_STENCIL_REGISTRY + 'du_' + iconStencilName);

            if(iconStencil == null) // the iconStencilName cannot be found, so the 'undefined' Icon is retrieved
                iconStencil = mxStencilRegistry.getStencil(window.MONDRIAN_REPO.MONDRIAN_BASE_STENCIL_REGISTRY + 'undefined');

            showStencilIcon = (iconStencil != null); // only show the Icon if a stencil is found
        }

        if(showStencilIcon)
        {
           c.save();
           let canvasCenterX = positionX + svd.icon.size/2;
           let canvasCenterY = positionY + svd.icon.size/2;
       
           // rotate icon
           c.rotate(svd.icon.rotate, svd.icon.flipH, svd.icon.flipV, 
               canvasCenterX, canvasCenterY);
           
           c.setStrokeColor('none');
           c.setFillColor(svd.icon.color);
           c.setDashed(false);

           iconStencil.strokewidth = 1;
           iconStencil.drawShape(c, this, positionX, positionY, svd.icon.size, svd.icon.size);	
            
            c.restore();
        }
    }
};

mxMondrianDeploymentUnit.prototype.getLabelBounds = function(rect)
{
   let svd = this.shapeVisualDefinition;
   return new mxRectangle(
                   rect.x + svd.text.labelBoundsOffSetLeft * this.scale, 
                   rect.y,
                   rect.width - (svd.text.labelBoundsOffSetLeft * this.scale),
                   svd.text.labelBoundsHeight * this.scale);
};

/**
 * Mondrian Design Method shape registration
 */
mxCellRenderer.registerShape(mxMondrianDeploymentUnit.prototype.cst.MONDRIAN_DU, mxMondrianDeploymentUnit);