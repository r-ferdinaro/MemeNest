'use strict';


let gElCanvas
let gCtx

let gCanvas = {}
let gBrush = {}
let gStartPos = {}
let gIsMouseDown = false

// Init function
function onInit() {
    gElCanvas = document.querySelector('canvas')
	gCtx = gElCanvas.getContext('2d')

    resetCanvasObj()
    resetBrushObj()

    resizeCanvas()
    addEventListeners()
}

// Register necessary event listeners
function addEventListeners() {
    window.addEventListener('resize', onResizeCanvas)

    gElCanvas.addEventListener('mousedown', onDown)
	gElCanvas.addEventListener('mousemove', onDraw)
	gElCanvas.addEventListener('mouseup', onUp)

    gElCanvas.addEventListener('touchstart', onDown)
	gElCanvas.addEventListener('touchmove', onDraw)
	gElCanvas.addEventListener('touchend', onUp)
}

function onResizeCanvas() {
    resizeCanvas()
}

function onClearCanvas() {
	clearCanvas()
}

function onDown(ev) {
    gIsMouseDown = true
    gStartPos = getEvPos(ev)

    onDraw(ev)
}

function onDraw(ev) {
	if (!gIsMouseDown) return
    
    const pos = getEvPos(ev)
	draw(pos)
	gStartPos = pos
}

function onUp() {
	gIsMouseDown = false
    
    gCtx.closePath()
}
