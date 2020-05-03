(function () {
  chrome.devtools.panels.elements.createSidebarPane('Classes',
    function (sidebar) {
      sidebar.setPage('classessp.html');
      sidebar.setHeight('50em');
    });
})();
