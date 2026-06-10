'use strict';

const gQueryParams = {
    page: '',
    filterBy: ''
}

// Page rendering functions

function onInit() {
    readQueryParams()
    renderPageContent()
    renderQueryParamsFilters()
}

function renderPageContent() {
    const { page } = gQueryParams
    // const elContainer = document.querySelector('.main-content-container')
    
    if (['gallery', 'memes'].includes(page)) {
        const galleryContent = getGalleryContent()
        
        document.querySelector('.gallery-content').innerHTML = galleryContent
        document.querySelector('.gallery').classList.remove('hide')
        document.querySelector('.editor').classList.add('hide')
        document.querySelector('.about').classList.add('hide')
    } else if (page === 'editor') {
        document.querySelector('.editor').classList.remove('hide')
        document.querySelector('.gallery').classList.add('hide')
        document.querySelector('.about').classList.add('hide')
        onEditorInit()
    } else {
        document.querySelector('.about').classList.remove('hide')
        document.querySelector('.gallery').classList.add('hide')
        document.querySelector('.editor').classList.add('hide')
    }
}

// Get images/memes from storage to img tags
// TODO: support memes
function getGalleryContent() {
    const { page, filterBy } = gQueryParams
    const contentArray = getItems(page, filterBy)
    let strHtml = ``
    
    if (contentArray) {
        contentArray.forEach( img => strHtml += `<img data-idx="${img.id}" src="${img.url}">`)
    }
    return strHtml
}

// change page based on nav click
function onPageChange(ev) {
    ev.preventDefault()

    gQueryParams.page = ev.target.dataset.uri
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
    if (['editor', 'about'].includes(page) || !filterBy) return
    
    document.querySelector('.search-bar').value = filterBy
    // TODO: if search content words are part of existing tags, change the tags order so they are first to show, and change their style so it's obvious they are selected
}

// TODO: should be triggered upon changing the page 
// TODO: should be triggered upon changing the search filter values or selecting a specific tag
// TODO: should be triggered when user clicks on image/meme to open editor
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

