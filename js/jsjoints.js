var makerjs = require('makerjs');

var plan = {
};

addEventListener('submit', (evt) => {
    evt.preventDefault();
    plan.width = parseFloat(document.getElementById("width").value);
    plan.height = parseFloat(document.getElementById("height").value);
    plan.depth = parseFloat(document.getElementById("depth").value);
    plan.thickness = parseFloat(document.getElementById("thickness").value);
    plan.fingerCount = parseInt(document.getElementById("fingers").value);
    plan.clearance = parseFloat(document.getElementById("clearance").value);
    plan.R = 0.25;
    plan.tabLength = (1 - plan.R) * plan.thickness;
    plan.thinWall = plan.R * plan.thickness;
    plan.tongeWidth = plan.height / (2 * plan.fingerCount) - plan.clearance;
    plan.grooveWidth = plan.tongeWidth + 2 * plan.clearance;
    plan.boneRadius = parseFloat(document.getElementById("radius").value);
    canvasUpdate();
});

function canvasUpdate() {
    var model = buildDrawing();
    var svg = makerjs.exporter.toSVG(model);
    document.getElementById('canvas').innerHTML = svg;
}

function buildDrawing() {
    var myDrawing = {
        models: {
            // box: makerjs.model.center(new makerjs.models.Rectangle(plan.width, plan.height)),
            box: new makerjs.models.Rectangle(plan.width, plan.height),
            verticalLines: tabs(),
        }
    };
    // myDrawing.units = makerjs.units.Millimeter;
    return myDrawing;
}

function tabs() {
    var radius = plan.boneRadius;
    var count = plan.fingerCount;
    // first the vertical lines
    // Vertical lines for the Grooves
    var vlineGroove = new makerjs.paths.Line([0, 0], [0, plan.grooveWidth]);
    var vlinesGrooves = makerjs.layout.cloneToColumn(vlineGroove, plan.fingerCount, plan.tongeWidth);
    
    // Vertical lines for the Tonges
    var vlineTonge = new makerjs.paths.Line([0, 0], [0, plan.tongeWidth]);
    var vlinesTonges = makerjs.layout.cloneToColumn(vlineTonge, plan.fingerCount, plan.grooveWidth);
    makerjs.model.moveRelative(vlinesTonges, [-plan.tabLength, plan.grooveWidth]);
    
    // Horizontal lines
    // Upper Horizontal lines
    var hline = new makerjs.paths.Line([0, 0], [-plan.tabLength, 0]);
    var hlines = makerjs.layout.cloneToColumn(hline, plan.fingerCount, plan.tongeWidth+plan.grooveWidth);
    makerjs.model.moveRelative(hlines, [0, plan.grooveWidth]);
    
    // Lower Horizontal lines
    var hline2 = new makerjs.paths.Line([0, 0], [-plan.tabLength, 0]);
    var hlines2 = makerjs.layout.cloneToColumn(hline2, plan.fingerCount - 1, plan.tongeWidth+plan.grooveWidth);
    makerjs.model.moveRelative(hlines2, [0, plan.grooveWidth + plan.tongeWidth]);
    
    var modelLeft = {
        models: {
            'horizontalLinesTops': hlines,
            'horizontalLinesBottoms': hlines2,
            'verticalLinesGrooves': vlinesGrooves,
            'verticalLinesTonges': vlinesTonges
        }
    };
    // makerjs.model.center(model, true, false);
    var chain1 = makerjs.model.findSingleChain(modelLeft);
    var dogbones1 = makerjs.chain.dogbone(chain1, { right: plan.boneRadius});
    modelLeft.models.bones = dogbones1;
    modelRight = makerjs.cloneObject(modelLeft);
    modelRight = makerjs.model.mirror(modelRight, true, false);

    // Moving to correct positions
    var t = 5;
    makerjs.model.moveRelative(modelLeft, [plan.tabLength + t, 0]);
    makerjs.model.moveRelative(modelRight, [plan.width - plan.tabLength - t, 0]);

    var model = {
        models: {
            'modelLeft': modelLeft,
            'modelRigth': modelRight
        }
    };
    return model;
}

function boxes() {
    box = new makerjs.models.Rectangle(50, 50);
    return box;
}

function svgDownload() {
    var model = buildDrawing();
    var svg = makerjs.exporter.toSVG(model);
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:attachment/text,' + encodeURI(svg);
    hiddenElement.target = '_blank';
    hiddenElement.download = 'test.svg';
    hiddenElement.click();
}

function dxfDownload() {
    var drawing = buildDrawing();
    var dxf = makerjs.exporter.toDXF(drawing);
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:attachment/text,' + encodeURI(dxf);
    hiddenElement.target = '_blank';
    hiddenElement.download = 'test.dxf';
    hiddenElement.click();
}