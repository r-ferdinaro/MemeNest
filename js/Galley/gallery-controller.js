'use strict';

function onToggleMenu(el) {
    const menuTypeClass = el.classList.contains('filter-btn') ? 'filter' : 'nav'
    document.body.classList.add('menu-open', `${menuTypeClass}`);
}

function onCloseMenus() {
    document.body.classList.remove('menu-open', 'filter', 'nav');
}