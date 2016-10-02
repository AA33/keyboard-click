console.log('I got loaded');

function Input(el){
    var parent = el,
        map = {},
        intervals = {};

    function ev_kdown(ev)
    {
        map[ev.key] = true;
        return;
    }

    function ev_kup(ev)
    {
        map[ev.key] = false;
        return;
    }

    function key_down(key)
    {
        return map[key];
    }

    function keys_down_array(array)
    {
        for(var i = 0; i < array.length; i++)
            if(!key_down(array[i]))
                return false;

        return true;
    }

    function keys_down_arguments()
    {
        return keys_down_array(Array.from(arguments));
    }

    function clear()
    {
        map = {};
    }

    function watch_loop(keylist, callback)
    {
        return function(){
            if(keys_down_array(keylist))
                callback();
        }
    }

    function watch(name, callback)
    {
        var keylist = Array.from(arguments).splice(2);

        intervals[name] = setInterval(watch_loop(keylist, callback), 1000/24);
    }

    function unwatch(name)
    {
        clearInterval(intervals[name]);
        delete intervals[name];
    }

    function detach()
    {
        parent.removeEventListener("keydown", ev_kdown);
        parent.removeEventListener("keyup", ev_kup);
    }

    function attach()
    {
        parent.addEventListener("keydown", ev_kdown);
        parent.addEventListener("keyup", ev_kup);
    }

    function Input()
    {
        attach();

        return {
            key_down: key_down,
            keys_down: keys_down_arguments,
            watch: watch,
            unwatch: unwatch,
            clear: clear,
            detach: detach
        };
    }

    return Input();
}

var previousHighlight = null;

function searchHighlight(text) {
    document.designMode = "on";
    var sel = window.getSelection();
    sel.collapse(document.body, 0);

    while (window.find(text)) {
        document.execCommand("HiliteColor", false, "yellow");
        sel.collapseToEnd();
    }
    document.designMode = "off";
}

function removeSearchHighlight(text) {
    document.designMode = "on";
    var sel = window.getSelection();
    sel.collapse(document.body, 0);

    while (window.find(text)) {
        document.execCommand("removeFormat", false);
        sel.collapseToEnd();
    }
    document.designMode = "off";
}

var body = Input(document.getElementsByTagName("body")[0]);

$('body').append("<input id='keyboard_click_search' style='z-index: 100; position: fixed; top: 0;'></input>");

var searchBox = $("#keyboard_click_search");
searchBox.hide();

searchBox.on('keyup', function(event){
    if (previousHighlight){
        removeSearchHighlight(previousHighlight);
    }
    console.log(this.value);
    if (this.value.length > 0 && previousHighlight !== this.value){
        searchHighlight(this.value);
        previousHighlight = this.value;
    }
});

var previouslyFocused = null;

body.watch("watch_click", function(){
    console.log('K + C was hit show searchBox!');
    searchBox.show();
    previouslyFocused = $(':focus');
    searchBox.focus();
}, "c", "k");

body.watch("watch_esc", function(){
	console.log('Esc hit hide searchBox now!');
	if (searchBox.is(':visible')){
		searchBox.hide();
		if (previouslyFocused){
			previouslyFocused.focus();
			previouslyFocused = null;
		}
		if (previousHighlight) {
            removeSearchHighlight(previousHighlight);
            previousHighlight = null;
        }
	}
}, "Escape");

