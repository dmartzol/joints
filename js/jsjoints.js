var makerjs = require('makerjs');
var currentUnits = "mm";
var plan = {};

window.onload = canvasUpdate();
addEventListener('submit', (evt) => {
    evt.preventDefault();
    canvasUpdate();
});
addEventListener('change', () => {
    canvasUpdate();
});
addEventListener('keyup', () => {
    canvasUpdate();
});
$('.btn-group').on('click', '.btn', function() {
    $(this).addClass('active').siblings().removeClass('active');
});
$("#add-handle").click(function(){
    $('#slot-length').prop('disabled', function(i, v) { return !v; });
    $('#slot-diameter').prop('disabled', function(i, v) { return !v; });
    $('#slot-distance').prop('disabled', function(i, v) { return !v; });
});
$("#add-bottom").click(function(){
    $('#bottom-thickness').prop('disabled', function(i, v) { return !v; });
    $('#bottom-height').prop('disabled', function(i, v) { return !v; });
});

function readInputs() {
    plan.width = parseFloat(document.getElementById("width").value);
    plan.height = parseFloat(document.getElementById("height").value);
    plan.depth = parseFloat(document.getElementById("depth").value);
    plan.thickness = parseFloat(document.getElementById("thickness").value);
    plan.fingerCount = parseInt(document.getElementById("tabs").value);
    plan.boneDiameter = parseFloat(document.getElementById("diameter").value);
    plan.boneRadius = plan.boneDiameter / 2;
    plan.clearance = parseFloat(document.getElementById("clearance").value);
    plan.R = parseFloat(document.getElementById("overlap").value);
    plan.tabLength = (1 - plan.R) * plan.thickness;
    plan.thinWall = plan.R * plan.thickness;
    plan.tongeWidth = plan.height / (2 * plan.fingerCount) - plan.clearance;
    plan.grooveWidth = plan.tongeWidth + 2 * plan.clearance;
    plan.slotDiameter = parseFloat(document.getElementById("slot-diameter").value);
    plan.slotLength = parseFloat(document.getElementById("slot-length").value) - plan.slotDiameter;
    plan.slotDistance = document.getElementById("slot-distance").value;
    plan.bottomThickness = parseFloat(document.getElementById("bottom-thickness").value);
    plan.bottomHeight = parseFloat(document.getElementById("bottom-height").value);
    plan.handleDisabled = document.getElementById("slot-diameter").disabled;
    plan.bottomDisabled = document.getElementById("bottom-thickness").disabled;
}

function canvasUpdate() {
    readInputs();
    updateThickness();
    var model = buildDrawing();
    var options = {svgAttrs: {width:'100%', height:'30em'}, stroke: 'white'};
    var svg = makerjs.exporter.toSVG(model, options);
    document.getElementById('canvas').innerHTML = svg;
}

function buildDrawing() {
    var margin = 0.2 * plan.height;
    var myDrawing = {
        models: {
            'side': side(),
            'front': makerjs.model.moveRelative(front(), [0, plan.height + margin]),
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
    var chain1 = makerjs.model.findSingleChain(modelLeft);
    var dogbones1 = makerjs.chain.dogbone(chain1, { right: plan.boneRadius});
    modelLeft.models.bones = dogbones1;
    var modelRight = makerjs.cloneObject(modelLeft);
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
    if (!plan.handleDisabled) {
        model.models["handle"] = buildHandle("front");
    }
    if (!plan.bottomDisabled) {
        model.models["bottomGroove"] = buildBottom("front");
    }
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
    if (!plan.handleDisabled) {
        model.models["handle"] = buildHandle("side");
    }
    if (!plan.bottomDisabled) {
        model.models["bottomGroove"] = buildBottom("side");
    }
    //we have to call originate before calling simplify:
    makerjs.model.originate(model);
    makerjs.model.simplify(model);
    return model;
}

function buildHandle(type) {
    if (type == "front") {
        var width = plan.width;
    } else {
        var width = plan.depth;
    }
    var handleY = plan.height - plan.slotDiameter/2 - plan.slotDistance;
    console.log(plan.slotDistance)
    var origin = [(width - plan.slotLength)/2, handleY];
    var end = [(width + plan.slotLength)/2, handleY];
    var radius = plan.slotDiameter / 2;
    var slot = new makerjs.models.Slot(origin, end, radius);
    var model = {
        models: {
            'handle': slot,
        }
    };
    return model;
}

function buildBottom(type) {
    if (type == "front") {
        var width = plan.width;
        var thinWall = plan.thinWall;
    } else {
        var width = plan.depth - 2 * plan.thinWall;
        var thinWall = 0;
    }
    var lineLength = width - 2 * (plan.tabLength + thinWall);
    var line = new makerjs.paths.Line([0, 0], [lineLength, 0]);
    var lines = makerjs.layout.cloneToColumn(line, 2, plan.bottomThickness);
    makerjs.model.moveRelative(lines, [plan.tabLength + thinWall, plan.bottomHeight]);
    console.log(line);
    var model = {
        models: {
            'bottomGroove': lines,
        }
    };
    console.log(model);
    return model;
}

function svgDownload() {
    var model = buildDrawing();
    var svg = makerjs.exporter.toSVG(model);
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:attachment/text,' + encodeURI(svg);
    hiddenElement.target = '_blank';
    hiddenElement.download = 'hidden-joints-box.svg';
    hiddenElement.click();
}

function dxfDownload() {
    var drawing = buildDrawing();
    var dxf = makerjs.exporter.toDXF(drawing);
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:attachment/text,' + encodeURI(dxf);
    hiddenElement.target = '_blank';
    hiddenElement.download = 'hidden-joints-box.dxf';
    hiddenElement.click();
}

function toMillimeters() {
    var elements = document.getElementsByClassName("units");
    if (currentUnits == "in") {
        for(var i=0; i<elements.length; i++) {
            elements[i].innerHTML = "mm";
        }
        elements = document.getElementsByClassName("dimensional");
        for(var i=0; i<elements.length; i++) {
            var n = elements[i].value * 25.4;
            elements[i].value = n.toFixed(3);
        }
        currentUnits = "mm";
    }
    canvasUpdate();
}

function toInches(button) {
    var elements = document.getElementsByClassName("units");
    if (currentUnits == "mm") {
        for(i=0; i<elements.length; i++) {
            elements[i].innerHTML = "in";
        }
        elements = document.getElementsByClassName("dimensional");
        for(var i=0; i<elements.length; i++) {
            var n = elements[i].value / 25.4;
            elements[i].value = n.toFixed(3);
        }
        currentUnits = "in";
    }
    canvasUpdate();
}

function updateThickness() {
    var overlapThickness = plan.thickness * plan.R;
    overlapThickness = overlapThickness.toFixed(2);
    document.getElementById("overlap-thickness").innerHTML = overlapThickness;
}