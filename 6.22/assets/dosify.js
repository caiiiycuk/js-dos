const replaceWithDigger = (el) => {
    el.parent().css("text-align", "center");
    
    const canvas = document.createElement("canvas");
    el.replaceWith(canvas);
    Dos(canvas, { wdosboxUrl: "/6.22/6.22.7/wdosbox.js" }).ready((fs, main) => {
        fs.extract("/6.22/6.22.7/test/digger.zip").then(() => {
            main(["-c", "DIGGER.COM"])
        });
    });
};

const dosify = () => {
    $("img").each((index, image) => {
        const el = $(image);
        if (el.attr('alt') === "Digger in browser") {
            replaceWithDigger(el);
        }
    });
};

$(document).on('flatdoc:ready', function() {
    dosify();
});