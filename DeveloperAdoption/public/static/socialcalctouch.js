//
// socialcalctouch adds touch gestures to SocialCalc
// 
// As a start, touch gestures are modeled similar to 
// mouse events 
//
// Author: Ramu Ramamurthy
//
//
//

//
//
// To initialize, SocialCalc.CreateTableEditor must call 
//    SocialCalc.TouchRegister(editor.toplevel, {Swipe: SocialCalc.EditorProcessSwipe, editor: editor});
//    Also, any element create inside the grid needs to be touch registered for it to work
//        this includes buttons, etc
//
// TestCases:
//     1) tap to point to cell, and to move edit-cell
//     2) double-tap on a cell to open edit-box, then tap on edit box to pullup keyboard
//          -- when editing, tap on any other cell to be done with edit
//              *** figure out escape to cancel edit versus return to accept edit
//          -- when editing, and if = seen than tapping on cell puts the cell name into the edit box
//     3) tap on input box on top opens edit on cell
//        tap on any cell accepts and finishes this edit
//        *** need a way to cancel the edit versus accept the edit
//
//     4) tap on a cell and move finger starts a range
//        removing finger completes the range
//        tap on cell cancels range
//       
//     5) a swipe action scrolls the sheet
//        swipe up/dn scrolls up/dn
//        swipe lt/rt scrolls lt/rt
// 
//
// Wishlist:
//     1) smooth scroll will be nice (in addition to swipe) -- using a two-touch pan ?
//


var SocialCalc;
if (!SocialCalc) {
    alert("Main SocialCalc code module needed");
    SocialCalc = {};
}

// *************************************
//
// Touch functions:
//
// *************************************

SocialCalc.HasTouch = false;

(function() {
    // platform specific registration
    var agent = navigator.userAgent.toLowerCase();
    
    if(agent.indexOf('iphone') >= 0 || agent.indexOf('ipad') >= 0 || agent.indexOf('android') >= 0){
	SocialCalc.HasTouch = true;
    }
})();



SocialCalc.TouchInfo = {
    
    // In sequence the following will be implemented
    // swipe up/dn, left/right will scroll up/dn/left/right respectively
    // 
    // touch on a cell will move ecell to that cell
    // repeated touch on a cell will start edit on that cell
    // touch on another cell will cancel edit if it was in progress (?)
    // etc
    // 
    // touch on buttons will activate the buttons
    // 
    // The registeredElements array is used to identify items.
    
    // One item for each element to respond to the touch, each an object with:
    //    .element, .functionobj
    
    registeredElements: [],
    
    // for swipe
    threshold_x : 20,
    threshold_y : 20,
    
    orig_coord_x : 0,
    orig_coord_y : 0,
    final_coord_x : 0,
    final_coord_y : 0,
    
    px_to_rows : 20,  // 20 pixels is 1 row scroll
    px_to_cols : 20,  // 20 pixels is 1 col scroll
    
    touch_start : 0,
    ranging : false,
    ranging_threshold : 100,
    move_start: 0,
    
    last_touch : 0,
    timeout_handle : null,
    doubletap_threshold: 500 // max milliseconds between taps
    
};


//
// TouchRegister(element, functionobj) - make element respond to touch
//

SocialCalc.TouchRegister = function(element, functionobj) {
    
    
    if (!SocialCalc.HasTouch) {
	return;
    }

    var touchinfo = SocialCalc.TouchInfo;

    if (SocialCalc.LookupElement(element, touchinfo.registeredElements)) {
	// already registered
	return;
    }

    
    touchinfo.registeredElements.push({
	        element: element, 
		functionobj: functionobj
		}
	);
    
    if (SocialCalc.HasTouch && element.addEventListener) { // Webkit based (?)
	element.addEventListener("touchstart", SocialCalc.ProcessTouchStart, false);
	element.addEventListener("touchmove", SocialCalc.ProcessTouchMove, false);
	element.addEventListener("touchend", SocialCalc.ProcessTouchEnd, false);
	element.addEventListener("touchcancel", SocialCalc.ProcessTouchCancel, false);
	//element.addEventListener("onorientationchange", SocialCalc.ProcessOrientationChange, false);
    }
};

SocialCalc.FindTouchElement = function(event) {
    
    var touchinfo = SocialCalc.TouchInfo;
    
    var event = event || window.event;
    
    var ele = event.target || event.srcElement; // investigate
    
    for (wobj=null; !wobj && ele; ele=ele.parentNode) { // investigate
	wobj = SocialCalc.LookupElement(ele, touchinfo.registeredElements);
    }
    
    return wobj;
    
}
    
SocialCalc.ProcessTouchStart = function(event) {

    var touchinfo = SocialCalc.TouchInfo;
    touchinfo.orig_coord_x = event.targetTouches[0].pageX;
    touchinfo.orig_coord_y = event.targetTouches[0].pageY;  
    
    touchinfo.final_coord_x = touchinfo.orig_coord_x;
    touchinfo.final_coord_y = touchinfo.orig_coord_y;

    touchinfo.touch_start = new Date().getTime()
    
    event.preventDefault();
};

SocialCalc.TouchGetSimulatedMouseEvent = function(event, mouse_evt_name) {
    var touches = event.changedTouches;
    var first = touches[0];
    var simulatedEvent = document.createEvent("MouseEvent");
    simulatedEvent.initMouseEvent(mouse_evt_name, true, true, window, 1, 
				  first.screenX, first.screenY, 
				  first.clientX, first.clientY, false, 
				  false, false, false, 0, null);
    return simulatedEvent;
}

SocialCalc.ProcessTouchMove = function(event) {


    var touchinfo = SocialCalc.TouchInfo;
    touchinfo.final_coord_x = event.targetTouches[0].pageX;
    touchinfo.final_coord_y = event.targetTouches[0].pageY;     


    var wobj = SocialCalc.FindTouchElement(event);

    if (!wobj) return; // not one of our elements

    if (touchinfo.move_start == 0) {	
	touchinfo.move_start = new Date().getTime();
	if (touchinfo.move_start - touchinfo.touch_start > touchinfo.ranging_threshold) {
	    // This is a delayed move
	    // send a mouse down event
	    // This is for ranging and dragging

	    touchinfo.ranging = true;
	    var mouseDn = SocialCalc.TouchGetSimulatedMouseEvent(event, "mousedown");
	    wobj.functionobj.editor.fullgrid.dispatchEvent(mouseDn);
	}
    } else if (touchinfo.ranging) {
	// already ranging
	// send a mouse move event
	
	var mouseMv = SocialCalc.TouchGetSimulatedMouseEvent(event, "mousemove");
	wobj.functionobj.editor.fullgrid.dispatchEvent(mouseMv);
    }

    event.preventDefault();
};

SocialCalc.ProcessTouchEnd = function(e) {

    var touchinfo = SocialCalc.TouchInfo;

    var changeX = touchinfo.orig_coord_x - touchinfo.final_coord_x;    
    var changeY = touchinfo.orig_coord_y - touchinfo.final_coord_y;
	
    var wobj = SocialCalc.FindTouchElement(event);

    if (!wobj) return; // not one of our elements

    var event = e || window.event;

    touchinfo.move_start = 0;
    touchinfo.touch_start = 0;
    
    if (touchinfo.ranging) {
	// in ranging, and dragging
	// send a mouseup event
	touchinfo.ranging = false;    
	var mouseUp = SocialCalc.TouchGetSimulatedMouseEvent(event, "mouseup");
	wobj.functionobj.editor.fullgrid.dispatchEvent(mouseUp);

    } else  if ( (Math.abs(changeY) > touchinfo.threshold_y) ||
		 (Math.abs(changeX) > touchinfo.threshold_x) ) {

	// check for swipe

	var amount_y = Math.floor(changeY / touchinfo.px_to_rows);
	var amount_x = Math.floor(changeX / touchinfo.px_to_cols);
	if (wobj.functionobj && wobj.functionobj.Swipe) {
	    wobj.functionobj.Swipe(event, touchinfo, wobj, amount_y, amount_x);
	}
	
    } else {
	
	// detect a double tap
	var now = new Date().getTime()
	var lasttouch = touchinfo.last_touch || now + 1
	var delta = now - lasttouch;
	if (touchinfo.timeout_handle) {
	    clearTimeout(touchinfo.timeout_handle);
	    touchinfo.timeout_handle = null;
	}

	if ((delta < touchinfo.doubletap_threshold) && (delta > 0)) {
	    // doubletap seen
	    if (wobj.functionobj && wobj.functionobj.DoubleTap) {
		wobj.functionobj.DoubleTap(event, touchinfo, wobj);
	    }
	} else {
	    // this is a single tap
	    touchinfo.last_touch = now;	    
	    var timeoutFn = function() {
		if (wobj.functionobj && wobj.functionobj.SingleTap) {
		    wobj.functionobj.SingleTap(event, touchinfo, wobj);		
		}
	    };
	    touchinfo.timeout_handle = setTimeout(timeoutFn(), touchinfo.doubletap_threshold);
	}
	touchinfo.last_touch = now;
    }
    e.preventDefault();
};

SocialCalc.ProcessTouchCancel = function(event) {

    var wobj = SocialCalc.FindTouchElement(event);

    if (!wobj) {
	return; // do default behavior
    } 

    var touchinfo = SocialCalc.TouchInfo;
    touchinfo.orig_coord_x = 0;
    touchinfo.orig_coord_y = 0;
    touchinfo.final_coord_x = 0;    
    touchinfo.final_coord_y = 0;
    touchinfo.move_start = 0;
    touchinfo.touch_start = 0;
    touchinfo.ranging = false;
};

SocialCalc.EditorProcessSwipe = function(event, touchinfo, wobj, swipevert, swipehoriz) {

    if (wobj.functionobj.editor.busy) {
	return; // ignore if busy
    }

    if ((swipevert != 0) || (swipehoriz != 0) ) {

	wobj.functionobj.editor.ScrollRelativeBoth(swipevert,swipehoriz);

    }
    
};


SocialCalc.EditorProcessSingleTap = function(event, touchinfo, wobj) {


    if (wobj.functionobj.editor.busy) {
	return; // ignore if busy
    }    

    // send mouse down
    var mouseDn = SocialCalc.TouchGetSimulatedMouseEvent(event, "mousedown");
    wobj.functionobj.editor.fullgrid.dispatchEvent(mouseDn);

    // then send mouse up
    var mouseUp = SocialCalc.TouchGetSimulatedMouseEvent(event, "mouseup");
    wobj.functionobj.editor.fullgrid.dispatchEvent(mouseUp);

};


SocialCalc.EditorProcessDoubleTap = function(event, touchinfo, wobj) {

    if (wobj.functionobj.editor.busy) {
	return; // ignore if busy
    }
    // simulate a mouse double click
    var mouseDblClick = SocialCalc.TouchGetSimulatedMouseEvent(event, "dblclick");
    wobj.functionobj.editor.fullgrid.dispatchEvent(mouseDblClick);
    
};


SocialCalc.ProcessOrientationChange = function(event) {
    alert(window.orientation);
};
