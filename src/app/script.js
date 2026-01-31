function loadContent() {
    const service = window.location.href.split('/')[4];
    if (service) {
        const contentIframe = document.getElementById('content');
        const servicePath = window.location.pathname.replace("/app/", "");
        contentIframe.src = "/services/" + servicePath;

        contentIframe.onload = () => {
            const title = contentIframe.contentDocument.title;
            if (title) {
                document.title = title + ' - Devdash';
            }
        };
    }
}

loadContent();