(function () {

    const body = document.body;
    const findClassesButton = document.getElementById('find-classes');
    const clearButton = document.getElementById('clear');
    const allClassesPre = document.getElementById('all-classes');
    const uniqueClassesPre = document.getElementById('unique-classes');

    const classessExpression = `
(function () {
    return Array.from(document.querySelectorAll('[class]')).map(e => e.className).sort();
})();
        `;

    function findClasses() {
        clear();
        body.classList.add('waiting');
        setTimeout(() => {
            body.classList.remove('waiting');
        }, 500);
        chrome.devtools.inspectedWindow.eval(classessExpression, {}, (sortedClassesArray, returnStatus) => {
            if (sortedClassesArray && sortedClassesArray.length) {
                let previousClasses;
                let classesOrdinal = -1;
                let uniqueClasses = [];
                let nonUniqueClasses = [];
                sortedClassesArray.forEach((classes, index) => {
                    if (typeof classes === 'string') {
                        if (classes.trim().split(/\s+/).length > 1) {
                            if (classes === previousClasses) {
                                classesOrdinal++;
                            } else {
                                previousClasses = classes;
                                classesOrdinal = 0;
                            }
                            let code = document.createElement('code');
                            code.innerHTML = `( ${ordinal_suffix_of(classesOrdinal)} ) <a class="inspect" classes="${classes}" classes-ordinal="${classesOrdinal}" title="${classes}">&#128269;</a> ${classes} \n`;
                            allClassesPre.appendChild(code);
                            classes = classes.trim().split(/\s+/);
                            classes.forEach(c => {
                                nonUniqueClasses.push(c);
                                if (uniqueClasses.indexOf(c) === -1) {
                                    uniqueClasses.push(c);
                                }
                            });
                        }
                    }
                });
                uniqueClasses.sort();
                nonUniqueClasses.sort();

                const uniqueClassesCounts = nonUniqueClasses.reduce((map, val) => {map[val] = (map[val] || 0)+1; return map}, {} );

                uniqueClasses.forEach((c, index) => {
                    if (uniqueClassesCounts[c] === undefined) {
                        let code = document.createElement('code');
                        code.innerHTML = `(          )${c} ${!uniqueClassesCounts[c] ? '' : ' ( ' + uniqueClassesCounts[c] + ' )' }\n`;
                        uniqueClassesPre.appendChild(code);
                    } else {
                        const count = uniqueClassesCounts[c];
                        for (let i = 0; i < count; i++) {
                            let code = document.createElement('code');
                            code.innerHTML = `( ${ordinal_suffix_of(i)} ) <a class="inspect" classes="${c}" classes-ordinal="${i}" title="${c}">&#128269;</a> ${c}${!uniqueClassesCounts[c] ? '' : ' ( ' + uniqueClassesCounts[c] + ' )' }\n`;
                            uniqueClassesPre.appendChild(code);
                        }
                    }
                });

                let inspectAnchors = document.querySelectorAll('.inspect');
                // Convert buttons NodeList to an array
                let inspectAnchorArray = Array.prototype.slice.call(inspectAnchors);
                inspectAnchorArray.forEach((inspectAnchor) => {
                    inspectAnchor.onclick = inspect.bind(inspectAnchor
                        ,inspectAnchor.getAttribute('classes')
                        ,inspectAnchor.getAttribute('classes-ordinal'));
                });
            }
        });
    }

    findClassesButton.onclick = findClasses;

    function clear() {
        allClassesPre.innerHTML = '';
        uniqueClassesPre.innerHTML = '';
    }

    clearButton.onclick = clear;

    function inspect(classes, classesOrdinal) {
        classes = classes.trim().split(/\s+/).join('.');
        const inspectExpression = `inspect(document.querySelectorAll('.${classes}').item(${classesOrdinal}))`;
        chrome.devtools.inspectedWindow.eval(inspectExpression, {}, (returnedValue, returnStatus) => {
        });
    }

    function copyToClipboard (text) {
        // Create new element
        var el = document.createElement('textarea');
        // Set value (string to be copied)
        el.value = text;
        // Set non-editable to avoid focus and move outside of view
        el.setAttribute('readonly', '');
        el.style = {position: 'absolute', left: '-9999px'};
        document.body.appendChild(el);
        // Select text inside element
        el.select();
        // Copy text to clipboard
        document.execCommand('copy');
        // Remove temporary element
        document.body.removeChild(el);
    }

    function ordinal_suffix_of(i) {
        var j = i % 10,
            k = i % 100;
        if (j == 1 && k != 11) {
            return (i + 'st').padStart(6);
        }
        if (j == 2 && k != 12) {
            return (i + 'nd').padStart(6);
        }
        if (j == 3 && k != 13) {
            return (i + 'rd').padStart(6);
        }
        return (i + 'th').padStart(6);
    }

    chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
        if (tabId === chrome.devtools.inspectedWindow.tabId) {
            if (changeInfo.status === 'loading') {
                body.classList.add('waiting');
                clear();
            }
            if (changeInfo.status === 'complete') {
                body.classList.remove('waiting');
                findClasses();
            }
        }
    });

})();
