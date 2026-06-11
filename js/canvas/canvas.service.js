'use strict';

// router to call correct function when loading canvas
function renderMeme(type = null, id = null) {
    if (!type) {
        loadImage()
    } else if (type = 'image') {
        loadImage(id)
    } else {loadMeme()}
}

// load existing saved meme into canvas
// Don't override data if exists and user didn't specifically chose to do so
function loadMeme(id) {
    if (gMeme?.id === id) return

    gMeme = getItemById('meme', id)
    resetBrush()
}

// load image or blank page to canvas
// Don't override data if exists and user didn't specifically chose to do so
// Note: I allow blank canvases on init - but it's just an edge case. I could also load a sample image
function loadImage(id = null) {
    const shouldReset = (gMeme.selectedImgId == null && !gMeme.drawings.length)

    if (id) {
        if (gMeme?.selectedImgId === id) return
        
        resetMeme(id)
        resetBrush()
    } else if (shouldReset) {
        resetMeme()
        resetBrush()
    }
}

// Reset gMeme object
function resetMeme(imageId) {
    gMeme = {
        id: null,
        selectedImgId: imageId || null,
        selectedDrawIdx: null,
        drawings: []
    }
}

// Reset brush object
function resetBrush() {
    // TODO: Add support for different shapes - text, sticker
    gBrush = {
        isFill: false,
        isOutline: false,  
	    fillColor: '#000000',
        outlineColor: '#000000',
	    shape: 'line',
	    size: 1
    }
}

// TODO: add functions that will edit the brush

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