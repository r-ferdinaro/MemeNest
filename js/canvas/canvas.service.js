'use strict';

// router to call correct function when loading canvas
function loadItem() {
    let { itemType, itemId } = gSelectedItem

    if (!itemId && restoreEditorState()) {
        gEditorReady = true
        resetBrush()

        if (gMeme.selectedDrawingIdx !== null && gMeme.selectedDrawingIdx !== undefined) {
            selectDrawing(gMeme.selectedDrawingIdx)
        }

        const imageObj = getItemById('image', gMeme.selectedImgId)
        if (imageObj) {
            renderItemToCanvas(imageObj)
        } else {
            renderMeme()
        }
        return
        
    }

    gEditorReady = true

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

// load an existing saved meme into the canvas for editing
function loadMeme(itemType, itemId) {
    // already loaded and rendered - just re-render to be safe
    if (gMeme?.id === itemId && gSelectedItem.elImg) {
        renderMeme()
        return
    }

    const savedMeme = getItemById('meme', itemId)
    if (!savedMeme) return

    // clone so edits don't mutate the stored record until the user saves
    gMeme = structuredClone(savedMeme)
    gMeme.selectedDrawingIdx = null
    resetBrush()

    // render the meme's base image, which in turn renders its drawings
    const imageObj = getItemById('image', gMeme.selectedImgId)
    if (imageObj) renderItemToCanvas(imageObj)
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
    gBrush = {
        txt: '',
        fontSize: 40,
        font: 'helvetica',
        fillColor: '#ffffff',
        strokeColor: '#000000',
        shape: 'text',
        stickerId: null
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
    const rect = gElCanvas.getBoundingClientRect()
    let clientX, clientY
    
    if (TOUCH_EVENTS.includes(ev.type)) {
        ev.preventDefault()
        const touch = ev.targetTouches[0]
        clientX = touch.clientX
        clientY = touch.clientY
    } else {
        clientX = ev.clientX
        clientY = ev.clientY
    }

    const scaleX = gElCanvas.width / rect.width
    const scaleY = gElCanvas.height / rect.height

    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
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
        const drawing = drawings[idx]
        // draw based on the drawing's shape (text or sticker)
        if (drawing.shape === 'sticker') drawSticker(drawing)
        else drawText(drawing)
        
        // check if current drawing should be highlighted
        if (idx === selectedDrawingIdx) highlightDrawing(drawing)
    }

    if (gEditorReady && !gIsMouseDown) saveEditorState()
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

// draw a sticker (emoji) into canvas
function drawSticker(drawing) {
    const { stickerId, size, pos } = drawing
    const sticker = getStickerById(stickerId)
    
    if (!sticker) return

    // set sticker properties
    gCtx.font = `${size}px serif`
    gCtx.textAlign = 'center'
    gCtx.textBaseline = 'middle'

    // draw sticker emoji to canvas
    gCtx.fillText(sticker.emoji, pos.x, pos.y)
}

// highlight border around selected drawing
function highlightDrawing(drawing) {
    const { x, y, width, height } = getDrawingBorders(drawing)

    // set highlight properties
    gCtx.strokeStyle = '#8B5CF6'
    gCtx.lineWidth = 2

    // draw highlighting border
    gCtx.setLineDash([6, 4])
    gCtx.strokeRect(x, y, width, height)

    // reset line properties to none
    gCtx.setLineDash([])
}

// get drawing start and end positions (x and y)
function getDrawingBorders(drawing) {
    const { size, pos } = drawing
    const extraPadding = 5

    // calculate drawing's width based on its content
    const measuredWidth = measureDrawingWidth(drawing)

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

// measure a drawing's rendered width based on its shape
function measureDrawingWidth(drawing) {
    const { shape, size } = drawing

    if (shape === 'sticker') {
        const sticker = getStickerById(drawing.stickerId)

        gCtx.font = `${size}px serif`
        return gCtx.measureText(sticker ? sticker.emoji : '').width
    }

    gCtx.font = `${size}px ${drawing.font}`
    return gCtx.measureText(drawing.txt).width
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
        shape: 'text',
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

// add a sticker drawing based on the given sticker id
function addSticker(stickerId) {
    const { width, height } = gElCanvas

    // set sticker's middle position
    const x = width / 2
    const y = height / 2
    const drawing = {
        shape: 'sticker',
        stickerId,
        size: 50,
        pos: {x, y}
    }
    
    // store drawing in first position and select
    gMeme.drawings.unshift(drawing)
    gMeme.selectedDrawingIdx = 0
}

function selectSticker(stickerId) {
    if (gBrush.shape === 'sticker' && gBrush.stickerId === stickerId) {
        clearStickerSelection()
        return
    }

    gBrush.shape = 'sticker'
    gBrush.stickerId = stickerId
    addSticker(stickerId)
}

function clearStickerSelection() {
    gBrush.shape = 'text'
    gBrush.stickerId = null
    gBrush.txt = ''
    gMeme.selectedDrawingIdx = null
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

// select/deselect drawing and sync all brush properties from it
function selectDrawing(idx) {
    gMeme.selectedDrawingIdx = idx

    if (idx === null) {
        gBrush.txt = ''
        return
    }

    const drawing = gMeme.drawings[idx]

    // selecting a sticker switches the brush into sticker mode
    if (drawing.shape === 'sticker') {
        gBrush.shape = 'sticker'
        gBrush.stickerId = drawing.stickerId
        gBrush.txt = ''
        return
    }

    // selecting text syncs all text brush properties from the drawing
    const { txt, font, size: fontSize, fillColor, strokeColor } = drawing

    gBrush = {
        ...gBrush,
        txt,
        font,
        fontSize,
        fillColor,
        strokeColor,
        shape: 'text',
        stickerId: null
    }
}

// update brush and selected drawing text
function setSelectedDrawingText(txt) {
    const { drawings, selectedDrawingIdx: idx } = gMeme
    gBrush.txt = txt

    if (idx === null) return
    // stickers have no editable text
    if (drawings[idx].shape === 'sticker') return
    drawings[idx].txt = txt
}

// update a brush and selected drawing property
function updateBrush(key, value) {
    const { drawings, selectedDrawingIdx: idx } = gMeme
    gBrush[key] = value
    if (idx === null) return
    // text styling doesn't apply to stickers
    if (drawings[idx].shape === 'sticker') return
    drawings[idx][key === 'fontSize' ? 'size' : key] = value
}

// update drawing's position
function moveSelectedDrawing(pos) {
    const idx = gMeme.selectedDrawingIdx
    if (idx === null) return

    gMeme.drawings[idx].pos = pos
}

// remove selected drawing from meme
function removeDrawing() {
    const { drawings, selectedDrawingIdx: idx } = gMeme
    
    if (idx === null) return

    drawings.splice(idx, 1)
    gMeme.selectedDrawingIdx = null
    gBrush.txt = ''
    // leave sticker mode after deleting a drawing
    gBrush.shape = 'text'
    gBrush.stickerId = null
}

// capture the canvas as dataURL, save to storage, and sync state
function saveAndSyncMeme() {
    const imgUrl = getMemeImgUrl()
    const savedMeme = saveMeme(imgUrl)

    gMeme.id = gSelectedItem.itemId = savedMeme.id
    gSelectedItem.itemType = 'meme'
}

// save as image in dataURL format
function getMemeImgUrl() {
    // clear drawing selections and re-render canvas
    gMeme.selectedDrawingIdx = null
    renderMeme()

    // save edited canvas to dataURL format
    const imgUrl = gElCanvas.toDataURL()

    return imgUrl
}

// upload meme dataURL to Cloudinary and call onSuccess with the public URL
async function uploadImg(imgData, onSuccess) {
    const UPLOAD_URL = `https://api.cloudinary.com/v1_1/webify/image/upload`

    const formData = new FormData()
    formData.append('file', imgData)
    formData.append('upload_preset', 'webify')

    try {
        const res = await fetch(UPLOAD_URL, {
            method: 'POST',
            body: formData,
        })
        const data = await res.json()
        onSuccess(data.secure_url)
    } catch (err) {
        console.error('Upload failed:', err)
    }
}
