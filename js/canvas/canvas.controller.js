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

// TODO: gMeme should also have a memeId property. Upon save, if no Id - create one. If one exists, update the existing meme. This means I should support editing existing saved memes

function onEditorInit() {
    gElCanvas = document.querySelector('canvas')
	gCtx = gElCanvas.getContext('2d')

    resizeCanvas()
    addEventListeners()
    loadItem()
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

// add new text drawing
function odAddNewTextDrawing() {
    addText()
    renderMeme()
}

function onSetText(el) {
    setSelectedDrawingText(el.value)
    renderMeme()
}

function onUpdateFontSize(el) {
    document.querySelector('.fontSizeValue').innerText = el.value
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
    document.querySelector('.text-input').value = gBrush.txt
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
