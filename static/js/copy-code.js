(function() {
    'use strict';

    const copyIcon = '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
    const checkIcon = '<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>';

    function fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            return successful;
        } catch (err) {
            document.body.removeChild(textArea);
            console.error('Fallback copy failed:', err);
            return false;
        }
    }

    function copyTextToClipboard(text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text);
        } else {
            return new Promise(function(resolve, reject) {
                if (fallbackCopyTextToClipboard(text)) {
                    resolve();
                } else {
                    reject(new Error('Copy failed'));
                }
            });
        }
    }

    function initCopyCode() {
        const codeBlocks = document.querySelectorAll('.content pre');

        codeBlocks.forEach(function(pre) {
            if (pre.parentElement.classList.contains('code-block-wrapper')) {
                return;
            }

            const wrapper = document.createElement('div');
            wrapper.className = 'code-block-wrapper';

            pre.parentNode.insertBefore(wrapper, pre);
            wrapper.appendChild(pre);

            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-code-btn';
            copyBtn.innerHTML = copyIcon;
            copyBtn.setAttribute('aria-label', '复制代码');
            copyBtn.setAttribute('title', '复制');

            copyBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();

                const code = pre.querySelector('code');
                const textToCopy = code ? code.textContent : pre.textContent;

                copyTextToClipboard(textToCopy).then(function() {
                    copyBtn.innerHTML = checkIcon;
                    copyBtn.classList.add('copied');
                    copyBtn.setAttribute('title', '已复制');

                    setTimeout(function() {
                        copyBtn.innerHTML = copyIcon;
                        copyBtn.classList.remove('copied');
                        copyBtn.setAttribute('title', '复制');
                    }, 2000);
                }).catch(function(err) {
                    console.error('复制失败:', err);
                    copyBtn.setAttribute('title', '复制失败');
                    setTimeout(function() {
                        copyBtn.setAttribute('title', '复制');
                    }, 2000);
                });
            });

            wrapper.appendChild(copyBtn);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCopyCode);
    } else {
        initCopyCode();
    }
})();
