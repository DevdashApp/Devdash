function flushJSandCSS() {
    Array.from(document.getElementsByClassName('service-specific')).forEach((element) => {
        element.remove();
    });
}

function loadContent() {
    const service = window.location.href.split('/')[4];
    if (service) {
        flushJSandCSS();
        fetch("/services/" + service + "/")
            .then(response => response.text())
            .then(html => {
                const contentDiv = document.getElementById('content');
                contentDiv.innerHTML = html;

                const scriptElements = contentDiv.querySelectorAll('script');
                scriptElements.forEach(script => {
                    const newScript = document.createElement('script');
                    if (script.src) {
                        newScript.src = '/services/' + script.src.split('/').pop();
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
                    newLink.href = '/services/' + service + link.href.split('/').pop();
                    newLink.crossOrigin = 'anonymous';
                    newLink.type = 'text/css';
                    newLink.classList.add('service-specific');
                    document.head.appendChild(newLink);
                    link.remove();
                });
            })
            .catch(error => {
                console.error('Error when loading content:', error);
            });

    }
}

loadContent();