'use strict';


let gElCanvas
let gCtx

// TODO: should save to localStorage in case user refreshes page ??
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

function onEditorInit() {
    gElCanvas = document.querySelector('canvas')
	gCtx = gElCanvas.getContext('2d')

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
}

function onDownloadMeme(el) {
    const imgUrl = getMemeImgUrl()
    el.href = imgUrl
}

// add new text drawing
function odAddNewTextDrawing() {
    gBrush.shape = 'text'
    gBrush.stickerId = null
    addText()
    renderBrushProperties()
    renderStickersSelection()
    renderMeme()
}

// click a palette sticker to add it / toggle sticker mode
function onSelectSticker(stickerId) {
    selectSticker(stickerId)
    renderBrushProperties()
    renderStickersSelection()
    renderMeme()
}

// build the emoji sticker palette
function renderStickers() {
    const elContainer = document.querySelector('.stickers-container')
    
    if (!elContainer) return

    let strHtml = ''
    const stickers = getStickers()
    
    stickers.forEach( sticker =>
        strHtml += `<button class="sticker-btn" data-id="${sticker.id}" onclick="onSelectSticker('${sticker.id}')">${sticker.emoji}</button>`
    )

    elContainer.innerHTML = strHtml
    renderStickersSelection()
}

// highlight active sticker in palette
function renderStickersSelection() {
    const { shape, stickerId } = gBrush

    document.querySelectorAll('.sticker-btn').forEach( elBtn => {
        const isSelected = (shape === 'sticker' && elBtn.dataset.id === stickerId)
        
        elBtn.classList.toggle('sticker-selected', isSelected)
    })
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
    renderStickersSelection()
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
    }

    selectDrawing(idx)
    renderBrushProperties()
    renderStickersSelection()
    renderMeme()
}

// drag drawing and store it's original positions
function onMove(ev) {
    if (!gIsMouseDown || gMeme.selectedDrawingIdx === null) return
    const { x: offsetX, y: offsetY} = gOffsetPos
    const pos = getEvPos(ev)
    const x = pos.x - offsetX
    const y = pos.y - offsetY

    moveSelectedDrawing({x, y})
    renderMeme()
}

function onUp() {
	gIsMouseDown = false
}
