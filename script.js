
var canvasWidth = 640;
var canvasHeight = 480;
var gaborSize = 64;
var gaborPadding = 16;

var gaborTableWidth = 8;
var gaborTableHeight = 6;
var gaborDuplicates = 3;
var gaborTable = new Array(gaborTableWidth);

onload = function() {
    generateGaborTable();
    drawCanvas();
};

function generate() {
    generateGaborTable();
    drawCanvas();
}

function generateGaborTable() {
    for (var i = 0; i < gaborTableWidth; i++) {
        gaborTable[i] = new Array(gaborTableWidth);
        for (var j = 0; j < gaborTableHeight; j++) {
            gaborTable[i][j] = -1;
        }
    }

    var rests = new Array(0);
    for (var i = 0; i < gaborTableWidth; i++) {
        for (var j = 0; j < gaborTableHeight; j++) {
            var position = {x:i, y:j};
            rests.push(position);
        }
    }

    var numRad = 8;
    var looping = 0;
    while (rests.length > 0) {
        var objects = new Array();
        for (var i = 0; i < gaborDuplicates; i++) {
            var objectIndex = Math.floor(Math.random() * rests.length);
            var object = rests[objectIndex];
            objects.push(object);
            gaborTable[object.x][object.y] = numRad;
            rests.splice(objectIndex, 1);
        }
        numRad++;
    }
    drawCanvas();
}

function drawCanvas() {
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    var imageData = context.createImageData(canvasWidth, canvasHeight);
    context.clearRect(0, 0, canvasWidth, canvasHeight);

    context.fillStyle = "black";
    context.strokeStyle = "black";

    for (var i = 0; i < gaborTableWidth; i++) {
        for (var j = 0; j < gaborTableHeight; j++) {
            var num = Math.floor(gaborTable[i][j] / 4);
            var radius = (gaborTable[i][j] % 4) * 45;
            drawGabor(imageData,
                      i * (gaborSize + gaborPadding) + gaborSize / 2,
                      j * (gaborSize + gaborPadding) + gaborSize / 2,
                      num, 
                      radius);
        }
    }
    context.putImageData(imageData, 0, 0);
}

function drawGabor(imageDataRef, x, y, num, radius) {
    for (var xDelta = -gaborSize / 2; xDelta <= gaborSize / 2; xDelta++) {
        for (var yDelta = -gaborSize / 2; yDelta <= gaborSize / 2; yDelta++) {
            var tmpX = x + xDelta;
            var tmpY = y + yDelta;

            if (tmpX < 0 || tmpY < 0 || tmpX >= canvasWidth || tmpY >= canvasHeight) {
                continue;
            }

            var baseIndex = (tmpY * canvasWidth + tmpX) * 4;
            var xInGabor = Math.cos(radius / 180.0 * Math.PI) * xDelta
                         + Math.sin(radius / 180.0 * Math.PI) * yDelta;

            var barLevel;
            if (num % 2 == 0) {
                var barX = Math.sin(num * xInGabor / gaborSize * Math.PI);
                barLevel = barX * barX;
            } else {
                var barX = Math.cos(num * xInGabor / gaborSize * Math.PI);
                barLevel = barX * barX;
            }
            
            var halfGaborSize = gaborSize / 2; 
            var spotLevel = 1 - Math.pow(Math.pow(xDelta, 2) + Math.pow(yDelta, 2), 1/2) / halfGaborSize;

            var value = normalizeValue(1 - barLevel * spotLevel);

            imageDataRef.data[baseIndex + 0] = value;
            imageDataRef.data[baseIndex + 1] = value;
            imageDataRef.data[baseIndex + 2] = value;
            imageDataRef.data[baseIndex + 3] = 255;
        }
    }
}

function normalizeValue(value) {
    var tmpValue = value;
    if (value > 1) {
        value = 1;
    } else if (value < 0) {
        value = 0;
    }
    return value * 255;
}