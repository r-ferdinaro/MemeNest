'use strict';

// TODO: verify this is the object format that I want
// TODO: decide when to init a new fresh object with or without selectedImgId, and when to load an existing meme from memeStorage (if has memeId)
function setMeme() {
    gMeme = {
	    // mode: "", //Resmbles fill or outline via values 'fill' and 'stroke'
	    fillColor: "#000000", //hex color value
        outlineColor: "#000000", //hex color value
	    shape: "line", // 'line, square, circle, text...' //should later add support for text
	    size: 1
    }
}
// TODO: verify this is the object format that I want
function setBrush() {
    gBrush = {
	    // mode: "", //Resmbles fill or outline via values 'fill' and 'stroke'
	    fillColor: "#000000", //hex color value
        outlineColor: "#000000", //hex color value
	    shape: "line", // 'line, square, circle, text...' //should later add support for text
	    size: 1
    }
}

// Detect window resize and adjust canvas dimensions accordingly
function resizeCanvas() {
    const elContainer = document.querySelector('.canvas-container')
	gElCanvas.width = elContainer.clientWidth
}

// Get event positions on Web & Mobile
function getEvPos(ev) {
    const TOUCH_EVENTS = ['touchstart', 'touchmove', 'touchend']

    if (TOUCH_EVENTS.includes(ev.type)) {
        ev.preventDefault()
        const touch = ev.targetTouches[0]
        const rect = gElCanvas.getBoundingClientRect()
        
        return {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top,
        }
    } else {
        return {
            x: ev.offsetX,
            y: ev.offsetY,
        }
    }
}

// TODO: support drawing stickers
// send to correct draw function
function draw(pos) {
	switch (gBrush.shape) {
		case 'line':
			drawLine(pos)
			break
        case 'circle':
            drawArc(pos)
            break
        case 'square':
            drawRect(pos)
			break
	}
}

// Draw a line
function drawLine(pos) {
    const { x, y } = pos
    const { fillColor, size } = gBrush

	gCtx.strokeStyle = fillColor
	gCtx.lineWidth = size
	
    gCtx.beginPath()
	gCtx.moveTo(gStartPos.x, gStartPos.y)
	gCtx.lineTo(x, y)
	gCtx.stroke()
}

function drawArc(pos) {
    const { x, y } = pos
    const { fillColor, mode, size } = gBrush
    
    gCtx.fillStyle = gCtx.strokeStyle = fillColor
    gCtx.lineWidth = 1
	gCtx.beginPath()

	gCtx.arc(x, y, size, 0, 2 * Math.PI)
	mode === 'fill' ? gCtx.fill() : gCtx.stroke()
}

function drawRect(pos) {
    const { x, y } = pos
    const { fillColor, mode, size } = gBrush

	gCtx.fillStyle = gCtx.strokeStyle = fillColor
	gCtx.lineWidth = 1
	
    gCtx.beginPath()

    if (mode === 'fill') {
        gCtx.fillRect(x, y, size, size)
    } else {
        gCtx.strokeRect(x, y, size, size)
    }
}