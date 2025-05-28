(function () {

    document.getElementById("reorder_button").addEventListener("click", () => {
        let elements = document.getElementsByClassName("draggable")
        for (let i = elements.length - 1; i >= 0; i--) {
            elements[i].draggable = true;

            elements[i].addEventListener("dragstart", dragStart); //save dragged element reference
            elements[i].addEventListener("dragover", dragOver); // change color of reference element to red
            elements[i].addEventListener("dragleave", dragLeave); // change color of reference element to black
            elements[i].addEventListener("drop", drop); //change position of dragged element using the referenced element
        }

    }, false);


    let startElement;

    /**
     * This function puts all row to "notSelected" class, then we use CSS to put "notSelected" in black and "selected" in red
     * @param rowsArray
     */
    function unselectRows(rowsArray) {
        console.log("unselectRows");
        for (let i = 0; i < rowsArray.length; i++) {
            rowsArray[i].className = "notSelected";
        }
    }


    /**
     * The dragstart event is fired when the user starts dragging an element (if it is draggable=True)
     * https://developer.mozilla.org/en-US/docs/Web/API/Document/dragstart_event
     * @param event
     */
    function dragStart(event) {
        console.log("dragStart");
        /* we need to save in a letiable the row that provoked the event
         to then move it to the new position */
        startElement = event.target.closest("tr");
    }

    /**
     * The dragover event is fired when an element is being dragged over a valid drop target.
     * https://developer.mozilla.org/es/docs/Web/API/Document/dragover_event
     * @param event
     */
    function dragOver(event) {
        console.log("dragOver");
        // We need to use prevent default, otherwise the drop event is not called
        event.preventDefault();

        // We need to select the row that triggered this event to marked as "selected" so it's clear for the user
        let dest = event.target.closest("tr");

        // Mark  the current element as "selected", then with CSS we will put it in red
        dest.className = "selected";
    }

    /**
     * The dragleave event is fired when a dragged element leaves a valid drop target.
     * https://developer.mozilla.org/en-US/docs/Web/API/Document/dragleave_event
     * @param event
     */
    function dragLeave(event) {
        console.log("drag leave");
        // We need to select the row that triggered this event to marked as "notSelected" so it's clear for the user
        let dest = event.target.closest("tr");

        // Mark  the current element as "notSelected", then with CSS we will put it in black
        dest.className = "notSelected";
    }

    /**
     * The drop event is fired when an element or text selection is dropped on a valid drop target.
     * https://developer.mozilla.org/en-US/docs/Web/API/Document/drop_event
     * @param event
     */
    function drop(event) {
        console.log("drop");

        // Obtain the row on which we're dropping the dragged element
        let dest = event.target.closest("tr");

        // Obtain the index of the row in the table to use it as references for changing the dragged element position
        let table = dest.closest('table');
        let rowsArray = Array.from(table.querySelectorAll("tr"));
        let indexDest = rowsArray.indexOf(dest);

        // Move the dragged element to the new position
        if (rowsArray.indexOf(startElement) < indexDest)
            // If we're moving down, then we insert the element after our reference (indexDest)
            startElement.parentElement.insertBefore(startElement, rowsArray[indexDest + 1]);
        else
            // If we're moving up, then we insert the element before our reference (indexDest)
            startElement.parentElement.insertBefore(startElement, rowsArray[indexDest]);

        rowsArray.forEach(function (row) {
            console.log(row.id + " | " + row.index);
        })

        // Mark all rows in "not selected" class to reset previous dragOver
        unselectRows(rowsArray);
    }
})();
