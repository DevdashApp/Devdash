function flushJSandCSS() {
    Array.from(document.getElementsByClassName('service-specific')).forEach((element) => {
        element.remove();
    });
}

function loadContent() {
    const service = window.location.href.split('/')[4];
    if (service) {
        flushJSandCSS();
        fetch("/services/" + window.location.pathname.replace("/app/", ""))
            .then(response => response.text())
            .then(html => {
                const contentDiv = document.getElementById('content');
                contentDiv.innerHTML = html;

                const scriptElements = contentDiv.querySelectorAll('script');
                scriptElements.forEach(script => {
                    const newScript = document.createElement('script');
                    if (script.src) {
                        newScript.src = '/services/' + service + '/' + new RegExp('(?<=(?<!/)/)(?!/)[^?]+').exec(script.src);
                    } else {
                        newScript.textContent = script.textContent;
                    }
                    contentDiv.appendChild(newScript);
                    script.classList.add('service-specific');
                    script.remove();
                });

                const linkElements = contentDiv.querySelectorAll('link[rel="stylesheet"]');
                linkElements.forEach(link => {
                    const newLink = document.createElement('link');
                    newLink.rel = 'stylesheet';
                    const match = new RegExp('(?<=(?<!/)/)(?!/)[^?]+').exec(link.href);
                    if (match) {
                        const result = match[0].split('/');
                        result.shift();
                        newLink.href = '/services/' + result.join('/');
                    }
                    newLink.crossOrigin = 'anonymous';
                    newLink.type = 'text/css';
                    newLink.classList.add('service-specific');
                    document.head.appendChild(newLink);
                    link.remove();
                });

                const title = contentDiv.querySelector('title');
                if (title) {
                    document.title = title.textContent + ' - Devdash';
                }
            })
            .catch(error => {
                console.error('Error when loading content:', error);
            });

    }
}

loadContent();