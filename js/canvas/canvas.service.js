'use strict';

// router to call correct function when loading canvas
function loadItem() {
    let { itemType, itemId,} = gSelectedItem
    
    if (!itemType && !itemId) {
        gSelectedItem.itemType = itemType = 'image'
        gSelectedItem.itemId = itemId = getItems('gallery')[0].id
    }

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
function loadImage(itemType, itemId) {
    const { drawings, selectedImgId } = gMeme
    const { elImg } = gSelectedItem

    if (itemId) {
        const imageObj = getItemById(itemType, itemId)

        if (selectedImgId === itemId) {
            if (elImg) return
            // re-render image to canvas
            renderItemToCanvas(imageObj)
            return
        }

        resetMeme(itemId)
        resetBrush()
        renderItemToCanvas(imageObj)
    } else {
        const shouldReset = (!selectedImgId && !drawings.length)
       
        if (!shouldReset) return
        resetMeme()
        resetBrush()
    }
    
}

function renderItemToCanvas(imageObj) {
    const img = new Image();

    img.crossOrigin = 'anonymous'

    img.onload = () => {
        gSelectedItem.elImg = img

        gElCanvas.height = (img.naturalHeight / img.naturalWidth) * gElCanvas.width
        renderMeme()
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
    gBrush = {
        txt: '',
        fontSize: 40,
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
    renderMeme()
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

// render meme's image and drawings to canvas
function renderMeme() {
    const { drawings, selectedDrawingIdx } = gMeme
    const { width, height } = gElCanvas
    const { elImg } = gSelectedItem

    // Clear canvas
    gCtx.clearRect(0, 0, width, height)

    // draw selected item's image if one has been assigned
    if (elImg) {
        gCtx.drawImage(elImg, 0, 0, gElCanvas.width, gElCanvas.height)
    }

    // render drawings in reverse so index 0 renders on top
    for (let idx = drawings.length - 1; idx >= 0; idx--) {
        drawText(drawings[idx])
        // check if current drawing should be highlighted
        if (idx === selectedDrawingIdx) highlightDrawing(drawings[idx])
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
function getDrawingIdxAtPos(pos) {
    const idx = gMeme.drawings.findIndex( drawing => {
        // get drawing's positions
        const { x, y, width, height } = getDrawingBorders(drawing)

        // check if cursor is pointing in the dimensions of the drawing
        return (
            pos.x >= x &&
            pos.x <= x + width &&
            pos.y >= y &&
            pos.y <= y + height
        )
    })

    // return drawing position or null if no match was found
    return (idx !== -1) ? idx : null
}

// reorder modified drawing to top of the drawings array 
function bringDrawingToFront(idx) {
    const [ drawing ] = gMeme.drawings.splice(idx, 1)

    // move drawing to top of array and return its index (0)
    gMeme.drawings.unshift(drawing)
    return 0
}

// update brush and selected drawing text
function setSelectedDrawingText(txt) {
    const { drawings, selectedDrawingIdx: idx } = gMeme
    gBrush.txt = txt

    if (idx === null) return
    drawings[idx].txt = txt
}

// select/deselect drawing and sync all brush properties from it
function selectDrawing(idx) {
    const { shape } = gBrush

    gMeme.selectedDrawingIdx = idx
    if (idx === null) {
        gBrush.txt = ''
    
    } else {
        const { txt, font, size: fontSize, fillColor, strokeColor } = gMeme.drawings[idx]

        gBrush = {
            txt,
            font,
            fontSize,
            fillColor,
            strokeColor,
            shape
        }
    }
}

// remove selected drawing from meme
function removeDrawing() {
    const { drawings, selectedDrawingIdx: idx } = gMeme
    
    if (idx === null) return

    drawings.splice(idx, 1)
    gMeme.selectedDrawingIdx = null
    gBrush.txt = ''
}

// update a brush and selected drawing property
function updateBrush(key, value) {
    const { drawings, selectedDrawingIdx: idx } = gMeme
    gBrush[key] = value
    if (idx === null) return
    drawings[idx][key === 'fontSize' ? 'size' : key] = value
}

// update drawing's position
function moveSelectedDrawing(pos) {
    const idx = gMeme.selectedDrawingIdx
    if (idx === null) return

    gMeme.drawings[idx].pos = pos
}