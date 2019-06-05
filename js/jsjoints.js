var makerjs = require('makerjs');

var currentUnits = "mm";
var plan = {};

window.onload = canvasUpdate();

addEventListener('submit', (evt) => {
    evt.preventDefault();
    canvasUpdate();
});

function readInputs() {
    plan.width = parseFloat(document.getElementById("width").value);
    plan.height = parseFloat(document.getElementById("height").value);
    plan.depth = parseFloat(document.getElementById("depth").value);
    plan.thickness = parseFloat(document.getElementById("thickness").value);
    plan.fingerCount = parseInt(document.getElementById("fingers").value);
    plan.clearance = parseFloat(document.getElementById("clearance").value);
    plan.R = parseFloat(document.getElementById("overlap").value);
    plan.tabLength = (1 - plan.R) * plan.thickness;
    plan.thinWall = plan.R * plan.thickness;
    plan.tongeWidth = plan.height / (2 * plan.fingerCount) - plan.clearance;
    plan.grooveWidth = plan.tongeWidth + 2 * plan.clearance;
    plan.boneRadius = parseFloat(document.getElementById("radius").value);
}

function canvasUpdate() {
    readInputs();
    var model = buildDrawing();
    var svg = makerjs.exporter.toSVG(model);
    document.getElementById('canvas').innerHTML = svg;
}

function buildDrawing() {
    var margin = 20;
    var fronto = front();
    var myDrawing = {
        models: {
            'side': side(),
            'front': makerjs.model.moveRelative(fronto, [0, plan.height + margin]),
        }
    };
    // myDrawing.units = makerjs.units.Millimeter;
    return myDrawing;
}

function front() {
    // First the vertical lines
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
    var t = plan.thinWall;
    makerjs.model.moveRelative(modelLeft, [plan.tabLength + t, 0]);
    makerjs.model.moveRelative(modelRight, [plan.width - plan.tabLength - t, 0]);

    // Creating the box
    var box = new makerjs.models.Rectangle(plan.width, plan.height);

    var model = {
        models: {
            'modelLeft': modelLeft,
            'modelRigth': modelRight,
            'box': box
        }
    };
    return model;
}

function side() {
    // First the vertical lines
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
    var t = 0;
    makerjs.model.moveRelative(modelLeft, [plan.tabLength + t, 0]);
    makerjs.model.moveRelative(modelRight, [plan.depth - plan.tabLength - 2 * plan.thinWall - t, 0]);

    // Creating the box
    var box = new makerjs.models.Rectangle(plan.depth - 2 * plan.thinWall, plan.height);

    var model = {
        models: {
            'modelLeft': modelLeft,
            'modelRigth': modelRight,
            'box': box
        }
    };
    //call originate before calling simplify:
    makerjs.model.originate(model);
    makerjs.model.simplify(model);
    return model;
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

function toMillimeters() {
    var elements = document.getElementsByClassName("input-group-text");
    for(var i=0; i<elements.length; i++) {
        elements[i].innerHTML = "mm";
    }
    if (currentUnits == "in") {
        elements = document.getElementsByClassName("dimensional");
        for(var i=0; i<elements.length; i++) {
            var n = elements[i].value * 25.4;
            elements[i].value = n.toFixed(3);
        }
        currentUnits = "mm";
    }
    canvasUpdate();
}

function toInches() {
    var elements = document.getElementsByClassName("input-group-text");
    for(i=0; i<elements.length; i++) {
        elements[i].innerHTML = "in";
    }
    if (currentUnits == "mm") {
        elements = document.getElementsByClassName("dimensional");
        for(var i=0; i<elements.length; i++) {
            var n = elements[i].value / 25.4;
            elements[i].value = n.toFixed(3);
        }
        currentUnits = "in";
    }
    canvasUpdate();
}