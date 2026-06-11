'use strict';

// router to call correct function when loading canvas
function loadItem() {
    let { itemType, itemId,} = gSelectedItem
    
    if (!itemType && !itemId) {
        gSelectedItem.itemType = itemType = 'image'
        gSelectedItem.itemId = itemId = getItems('gallery')[0].id
    }

    // TODO: Might want to load a sample (first) image if !itemId
    if (itemType === 'image') {

        loadImage(itemType, itemId)
    } else {
        loadMeme(itemType, itemId)
    }
}

// load existing saved meme into canvas
// Don't override data if exists and user didn't specifically chose to do so
// TODO: probably incorrect - review again once I want to support loading memes
function loadMeme(itemType, itemId) {
    if (gMeme?.id === id) return

    gMeme = getItemById('meme', id)
    resetBrush()
}

// load image or blank page to canvas
// Don't override data if exists and user didn't specifically chose to do so
// Note: I allow blank canvases on init - but it's just an edge case. I could also load a sample image
function loadImage(itemType, itemId) {
    if (itemId) {
        if (gMeme.selectedImgId === itemId) return
        
        const imageObj = getItemById(itemType, itemId)
        
        resetMeme(itemId)
        resetBrush()
        renderItemToCanvas(imageObj)
    } else {
        const shouldReset = (!gMeme.selectedImgId && !gMeme.drawings.length)
       
        if (!shouldReset) return
        resetMeme()
        resetBrush()
    }
    
}

function renderItemToCanvas(imageObj) {
    const img = new Image();
    
    img.onload = () => {      
        gSelectedItem.elImg = img
        
        gElCanvas.height = (img.naturalHeight / img.naturalWidth) * gElCanvas.width
        gCtx.drawImage(img, 0, 0, gElCanvas.width, gElCanvas.height)
    }
    img.src = `${imageObj.url}`
}

// Reset gMeme object
function resetMeme(imageId) {
    gMeme = {
        id: '',
        selectedImgId: imageId || '',
        selectedDrawingIdx: null,
        drawings: []
    }
}

// Reset brush object
function resetBrush() {
    // TODO: add support for sticker shape and selected sticker.
    // TODO: update brush based on user definitions
    gBrush = {
        txt: '',
        fontSize: 30,
        font: 'helvetica',
        fillColor: '#ffffff',
        strokeColor: '#000000',
        shape: 'text'
    }
}

// Detect window resize and adjust canvas dimensions accordingly
function resizeCanvas() {
    const elCanvasContainer = document.querySelector('.canvas-container')
    const { elImg } = gSelectedItem
	
    gElCanvas.width = elCanvasContainer.offsetWidth

    if (elImg) {
        gElCanvas.height = (elImg.naturalHeight / elImg.naturalWidth) * gElCanvas.width
    } else {
        gElCanvas.height = elCanvasContainer.offsetWidth
    }
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

// draw a drawing into canvas
function drawText(drawing) {
    const { txt, size, font, fillColor, strokeColor, pos } = drawing

    // set drawing properties
    gCtx.lineWidth = 2
    gCtx.font = `${size}px ${font}`
    gCtx.textAlign = 'center'
    gCtx.textBaseline = 'middle'
    gCtx.fillStyle = fillColor
    gCtx.strokeStyle = strokeColor

    // draw text to canvas
    gCtx.fillText(txt, pos.x, pos.y)
    gCtx.strokeText(txt, pos.x, pos.y)
}

// highlight border around selected drawing
function highlightDrawing(drawing) {
    const { x, y, width, height } = getDrawingBorders(drawing)

    // set highlight properties
    gCtx.strokeStyle = '#0099ff'
    gCtx.lineWidth = 2

    // draw highlighting border
    gCtx.setLineDash([6, 4])
    gCtx.strokeRect(x, y, width, height)

    // reset line properties to none
    gCtx.setLineDash([])
}

// get drawing start and end positions (x and y)
function getDrawingBorders(drawing) {
    const { txt, size, font, pos } = drawing
    const extraPadding = 5

    // set drawing font to canvas
    // calculate drawing's width based on text, size and font 
    gCtx.font = `${size}px ${font}`
    const measuredWidth = gCtx.measureText(txt).width

    // set start & end positions
    const x = pos.x - (measuredWidth / 2) - extraPadding
    const y = pos.y - (size / 2) - extraPadding
    const width = measuredWidth + (extraPadding * 2)
    const height = size + (extraPadding * 2)

    return {
        x,
        y,
        width,
        height
    }
}

// add drawing based on brush configuration
function addText() {
    const { txt, fontSize, font, fillColor, strokeColor } = gBrush
    const { width, height } = gElCanvas
    const text = txt.trim() || 'Text'

    // set drawing's middle position
    const x = width / 2
    const y = height / 2
    
    // set drawing properties
    const drawing = {
        txt: text,
        size: fontSize,
        font,
        fillColor,
        strokeColor,
        pos: {x, y}
    }
    // store drawing data to gMeme at the front (top of the z-order)
    // set drawing to be selected drawing
    gMeme.drawings.unshift(drawing)
    gMeme.selectedDrawingIdx = 0
}

// get latest drawing's positions
}