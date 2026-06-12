'use strict';

let gQueryParams = {
    page: '',
    filterBy: ''
}
let gSelectedItem = {
    itemId: '', 
    itemType: '',
    elImg: null
}

// Page rendering functions

function onInit() {
    readQueryParams()
    renderPageContent()
    renderQueryParamsFilters()
}

function renderPageContent() {
    const { page = 'gallery' } = gQueryParams
    const pages = ['gallery', 'editor']
    const activePage = ['gallery', 'memes'].includes(page) ? 'gallery' : page

    // hide/show sections, based on the selected page using the hide class
    pages.forEach( page => document.querySelector(`.${page}`).classList.toggle('hide', page !== activePage))

    // Render gallery content based on gallery type
    if (['gallery', 'memes'].includes(page)) {
        document.querySelector('.gallery-content').innerHTML = getGalleryElements()
    }
    
    // Initialize Editor
    if (page === 'editor') onEditorInit()
    else removeResizeListeners()
}

// change page based on nav click
function onPageChange(ev) {
    ev.preventDefault()
    onCloseMenu()

    gQueryParams.page = ev.target.dataset.uri
    setQueryParams()
    renderPageContent()
}

// click on image/meme to open it in the editor
function onRenderGalleryItem(el = null) {
    if (!el || !['gallery', 'memes'].includes(gQueryParams.page)) return
    
    // Get the id & type of triggered item
    gSelectedItem = {
        itemId: el.dataset.id,    
        itemType: (gQueryParams.page === 'gallery') ? 'image' : 'meme',
        elImg: null
    }

    // update queryParams to editor & update the meme's selectedImageId
    gQueryParams.page = 'editor'
    gQueryParams.filterBy = ''

    // render updated URL & editor with selected item & its type
    setQueryParams()
    renderPageContent()
}

// TODO: trigger search based on the target value
// TODO: trigger setQueryParams
function OnSetSearchFilter(el) {
}

// TODO: if tag doesn't exist in search value - add to the end of the search value
// TODO: if tag exists in search value - remove from search value
// TODO: toggle class that will help understand wether tag is selected or not
// TODO: trigger search based on the searchbar target value, 
// TODO: trigger setQueryParams
function onTagFilter(el) {
}

// TODO: clear value from search bar
// TODO: clear special class from all tags
// TODO: trigger search based on the searchbar target value, 
// TODO: trigger setQueryParams
function onClearSearchFilter() {
}


// query params functions

// Read query params from search bar
function readQueryParams() {
    const queryParams = new URLSearchParams(window.location.search)

    gQueryParams.page = queryParams.get('page') || 'gallery'
    gQueryParams.filterBy = queryParams.get('filterBy') || ''
}

// Render queryParams values to filter section
function renderQueryParamsFilters() {
    const { page, filterBy } = gQueryParams
    
    // Early return if irrelevant page or no filter value
    if (page === 'editor' || !filterBy) return
    
    document.querySelector('.search-bar').value = filterBy
    // TODO: if search content words are part of existing tags, change the tags order so they are first to show, and change their style so it's obvious they are selected
}

// Set current query params to the search bar
function setQueryParams() {
    const queryParams = new URLSearchParams()
    const { protocol, host, pathname } = window.location
    const { page = 'gallery', filterBy } = gQueryParams
    
    queryParams.set('page', page)
    if (['gallery', 'editor'].includes(page)) {
        if (filterBy) queryParams.set('filterBy', filterBy)
    }
    
    const newUrl = `${protocol}//${host}${pathname}?${queryParams.toString()}`
    window.history.pushState({path: newUrl}, '', newUrl)
}

// Mobile only - Menu visibility functions

// Show/hide nav/filter menu
function onToggleMenu(el) {
    const menuTypeClass = el.classList.contains('filter-btn') ? 'filter' : 'nav'
    document.body.classList.add('menu-open', `${menuTypeClass}`)
}

// Close nav/filter menu
function onCloseMenu() {
    document.body.classList.remove('menu-open', 'filter', 'nav')
}

