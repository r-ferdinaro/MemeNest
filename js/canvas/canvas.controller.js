'use strict';

let gElCanvas
let gCtx

let gMeme = {
    id: null,
    selectedImgId: null,
    selectedDrawingIdx: null,
    drawings: []
}
let gBrush
let gOffsetPos = { 
    x: 0, 
    y: 0 
}
let gIsMouseDown = false
let gEditorReady = false

function onEditorInit() {
    gElCanvas = document.querySelector('canvas')
	gCtx = gElCanvas.getContext('2d')
    gEditorReady = false

    resizeCanvas()
    addEventListeners()
    loadItem()
    renderBrushProperties()
    renderStickers()
}

// Register necessary event listeners
function addEventListeners() {
    window.addEventListener('resize', onResizeCanvas)

    gElCanvas.addEventListener('mousedown', onDown)
	gElCanvas.addEventListener('mousemove', onMove)
	gElCanvas.addEventListener('mouseup', onUp)

    gElCanvas.addEventListener('touchstart', onDown)
	gElCanvas.addEventListener('touchmove', onMove)
	gElCanvas.addEventListener('touchend', onUp)
}

function removeResizeListeners() {
    window.removeEventListener('resize', onResizeCanvas)
}

function onResizeCanvas() {
    resizeCanvas()
}

// save meme to storage
function onSaveMeme() {
    saveAndSyncMeme()
    showBanner('Meme saved')
}

function onDownloadMeme(el) {
    const imgUrl = getMemeImgUrl()
    el.href = imgUrl
    showBanner('Meme downloaded')
}

// upload the meme to Cloudinary, then immediately open Facebook's share dialog
function onUploadImg(ev) {
    ev.preventDefault()
    const canvasData = getMemeImgUrl()

    function onSuccess(uploadedImgUrl) {
        const encodedUrl = encodeURIComponent(uploadedImgUrl)
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&t=${encodedUrl}`)
    }

    uploadImg(canvasData, onSuccess)
}

// add new text drawing
function odAddNewTextDrawing() {
    gBrush.shape = 'text'
    gBrush.stickerId = null
    addText()
    renderBrushProperties()
    renderMeme()
}

// click a palette sticker to add it / toggle sticker mode
function onSelectSticker(stickerId) {
    selectSticker(stickerId)
    renderBrushProperties()
    renderMeme()
}

function onSetText(el) {
    setSelectedDrawingText(el.value)
    renderMeme()
}

function onUpdateFontSize(el) {
    updateBrush('fontSize', +el.value)
    document.querySelector('.font-size-value').innerText = el.value
    renderMeme()
}

function onRemoveText() {
    removeDrawing()
    renderBrushProperties()
    renderMeme()
}

function onFontChange(el) {
    updateBrush('font', el.value)
    renderMeme()
}

function onSetFontColor(el) {
    updateBrush('fillColor', el.value)
    renderMeme()
}

function onSetStrokeColor(el) {
    updateBrush('strokeColor', el.value)
    renderMeme()
}

// build the emoji sticker palette
function renderStickers() {
    const elContainer = document.querySelector('.stickers-container')
    
    if (!elContainer) return

    let strHtml = ''
    const stickers = getStickers()
    
    stickers.forEach( sticker => {
        // use img element for image stickers
        const content = sticker.img
            ? `<img class="sticker-img" src="${sticker.img}" alt="logo sticker">`
            : sticker.emoji
        
            strHtml += `<button class="sticker-btn" data-id="${sticker.id}" onclick="onSelectSticker('${sticker.id}')">${content}</button>`
    })

    elContainer.innerHTML = strHtml
}

function renderBrushProperties() {
    const {font, fillColor, fontSize, strokeColor, txt} = gBrush
    const elCanvasTools = document.querySelector('.canvas-tools')
    
    elCanvasTools.querySelector('.text-input').value = txt
    elCanvasTools.querySelector('#text-font').value = font
    elCanvasTools.querySelector('.font-size-slider').value = fontSize
    elCanvasTools.querySelector('.font-size-value').innerText = fontSize
    elCanvasTools.querySelector('.stroke-color').value = strokeColor
    elCanvasTools.querySelector('.fill-color').value = fillColor
}

// select/deselect drawing per cursor position
function onDown(ev) {
    const pos = getEvPos(ev)
    let idx = getDrawingIdxAtPos(pos)

    // move selected drawing to top of the list
    // update offset position 
    if (idx !== null) {
        idx = bringDrawingToFront(idx)
        const { pos: drawingPos } = gMeme.drawings[idx]
        
        const x = pos.x - drawingPos.x
        const y = pos.y - drawingPos.y

        gOffsetPos = {x,y}
        gIsMouseDown = true
        // grabbing a drawing - show the "grabbing" cursor
        gElCanvas.style.cursor = 'grabbing'
    }

    selectDrawing(idx)
    renderBrushProperties()
    renderMeme()
}

// drag the selected drawing, or update the cursor when just hovering
function onMove(ev) {
    const pos = getEvPos(ev)

    if (gIsMouseDown && gMeme.selectedDrawingIdx !== null) {
        const { x: offsetX, y: offsetY} = gOffsetPos
        const x = pos.x - offsetX
        const y = pos.y - offsetY

        moveSelectedDrawing({x, y})
        renderMeme()
        return
    }

    const idx = getDrawingIdxAtPos(pos)

    gElCanvas.style.cursor = (idx !== null) ? 'grab' : 'default'
}

function onUp() {
	gIsMouseDown = false

    gElCanvas.style.cursor = 'grab'
    
    if (gEditorReady) saveEditorState()
}
