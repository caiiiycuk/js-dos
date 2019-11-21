const replaceWithDigger = (el) => {
    el.parent().css("text-align", "center");
    
    const canvas = document.createElement("canvas");
    el.replaceWith(canvas);
    Dos(canvas, { wdosboxUrl: "/6.22/current/wdosbox.js", cycles: 1000 }).ready(function(fs, main) {
        fs.extract("/6.22/current/test/digger.zip").then(function() {
            main(["-c", "DIGGER.COM"]).then(function (ci) {
                let isFullscreen = false;
                const fullscreen = document.createElement("button");
                fullscreen.style.cssText = `
                    padding-left: 15px;
                    padding-right: 15px;
                    height: 50px;
                    background: lightgray;
                    border-left: 1px solid white;
                    border-top: 1px solid white;
                    border-right: 1px solid darkgray;
                    border-bottom: 1px solid darkgray;
                    position: absolute;
                    bottom: 0;
                    left: 48px;
                    margin-left: 15px;
                `;
                function toggleFullscreen() {
                    if (!isFullscreen) {
                        ci.fullscreen();
                        fullscreen.innerHTML = "Exit";
                    } else {
                        ci.exitFullscreen();
                        fullscreen.innerHTML = "Fullscreen";
                    }

                    isFullscreen = !isFullscreen;
                };
                fullscreen.innerHTML = "Fullscreen";
                
                const fullscreenTouch = function(event) {
                    event.stopPropagation();
                    toggleFullscreen();
                }
                fullscreen.addEventListener("touchstart", fullscreenTouch);
                fullscreen.addEventListener("mousedown", fullscreenTouch);

                ci.getParentDiv().appendChild(fullscreen);
                
                DosController.Qwerty(ci.getParentDiv(), ci.getKeyEventConsumer(), {
                    uppercase: true,
                    cssText: `
                        .qwerty-key {
                            bottom: 0;
                            left: 0;
                        }
                    `,
                });
                DosController.Move(ci.getParentDiv(), ci.getKeyEventConsumer());
            });
        });
    });
};

const dosify = function() {
    $("img").each(function(index, image) {
        const el = $(image);
        if (el.attr('alt') === "Digger in browser") {
            replaceWithDigger(el);
        }
    });
};

$(document).on('flatdoc:ready', function() {
    dosify();
});