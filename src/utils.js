(function (window) {
    const activeClass = 'resize-active';
    const resetDelay = 500;
    let flag = false;
    let timer = null;
    const removeClassHandler = () => {
        flag = false;
        document.documentElement.classList.remove(activeClass);
    };
    const resizeHandler = () => {
        if (!flag) {
            flag = true;
            document.documentElement.classList.add(activeClass);
        }
        clearTimeout(timer);
        timer = setTimeout(removeClassHandler, resetDelay);
    };
    window.addEventListener('resize', resizeHandler);
})(window);
