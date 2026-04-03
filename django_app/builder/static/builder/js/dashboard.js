// ======================================
// STATE
// ======================================
const pageData = initialPageData && initialPageData.elements
    ? initialPageData
    : { elements: [] };

let draggedIndex = null;
let selectedElementId = null;


// ======================================
// INIT
// ======================================
document.addEventListener("DOMContentLoaded", function () {
    setupElementButtons();
    setupSaveButton();
    renderCanvas();
    renderPropertiesPanel();
});


// ======================================
// SETUP
// ======================================
function setupElementButtons() {
    const buttons = document.querySelectorAll(".element-btn");

    buttons.forEach((button) => {
        button.addEventListener("click", function () {
            const type = button.dataset.type;
            addElement(type);
        });
    });
}

function setupSaveButton() {
    const saveButton = document.getElementById("save-layout-btn");

    saveButton.addEventListener("click", async function () {
        await saveLayout();
    });
}


// ======================================
// ELEMENT CREATION
// ======================================
function addElement(type) {
    const newElement = createDefaultElement(type);
    pageData.elements.push(newElement);
    selectedElementId = newElement.id;

    renderCanvas();
    renderPropertiesPanel();
}

function createDefaultElement(type) {
    const baseElement = {
        id: generateId(),
        type: type,
        content: "",
        styles: {},
        settings: {}
    };

    if (type === "heading") {
        baseElement.content = "This is a heading";
        baseElement.styles = {
            fontSize: "32px",
            color: "#111827",
            textAlign: "left",
            marginBottom: "16px"
        };
    }

    if (type === "text") {
        baseElement.content = "This is a text block. Edit me from the properties panel.";
        baseElement.styles = {
            fontSize: "16px",
            color: "#374151",
            textAlign: "left",
            marginBottom: "16px"
        };
    }

    if (type === "button") {
        baseElement.content = "Click Me";
        baseElement.styles = {
            fontSize: "16px",
            color: "#ffffff",
            backgroundColor: "#2563eb",
            padding: "12px 20px",
            borderRadius: "8px",
            display: "inline-block"
        };
        baseElement.settings = {
            url: "#"
        };
    }

    if (type === "image") {
        baseElement.styles = {
            width: "300px",
            marginBottom: "16px",
            borderRadius: "12px"
        };
        baseElement.settings = {
            src: "https://via.placeholder.com/300x180?text=Image",
            alt: "Placeholder image"
        };
    }

    return baseElement;
}

function generateId() {
    return "el_" + Date.now() + "_" + Math.floor(Math.random() * 100000);
}


// ======================================
// LOOKUPS
// ======================================
function getSelectedElement() {
    if (!selectedElementId) {
        return null;
    }

    return pageData.elements.find((element) => element.id === selectedElementId) || null;
}

function getElementById(elementId) {
    return pageData.elements.find((element) => element.id === elementId) || null;
}


// ======================================
// CANVAS RENDER
// ======================================
function renderCanvas() {
    const canvas = document.getElementById("builder-canvas");
    canvas.innerHTML = "";

    if (!pageData.elements.length) {
        canvas.innerHTML = `
            <div class="canvas-placeholder">
                Your page canvas is here. Click an element on the left to add it.
            </div>
        `;
        return;
    }

    pageData.elements.forEach((element, index) => {
        const wrapper = document.createElement("div");
        wrapper.className = "builder-element";
        wrapper.draggable = true;
        wrapper.dataset.index = index;
        wrapper.dataset.id = element.id;

        if (element.id === selectedElementId) {
            wrapper.classList.add("selected");
        }

        wrapper.innerHTML = `
            <div class="element-toolbar">
                <button class="element-action-btn delete-btn" data-index="${index}">
                    Delete
                </button>
            </div>

            <div class="element-label">${escapeHtml(element.type)}</div>

            <div class="element-render-area">
                ${renderElementHTML(element)}
            </div>
        `;

        attachElementEvents(wrapper);
        canvas.appendChild(wrapper);
    });
}

function renderElementHTML(element) {
    const styleString = buildInlineStyles(element.styles || {});

    if (element.type === "heading") {
        return `
            <h2 style="${styleString}">
                ${escapeHtml(element.content || "Heading")}
            </h2>
        `;
    }

    if (element.type === "text") {
        return `
            <p style="${styleString}">
                ${escapeHtml(element.content || "Text")}
            </p>
        `;
    }

    if (element.type === "button") {
        const url = element.settings?.url || "#";

        return `
            <a href="${escapeHtml(url)}" style="text-decoration: none;" onclick="return false;">
                <button style="${styleString}; border: none; cursor: pointer;">
                    ${escapeHtml(element.content || "Button")}
                </button>
            </a>
        `;
    }

    if (element.type === "image") {
        const src = element.settings?.src || "https://via.placeholder.com/300x180?text=Image";
        const alt = element.settings?.alt || "Image";

        return `
            <img
                src="${escapeHtml(src)}"
                alt="${escapeHtml(alt)}"
                style="${styleString}"
            />
        `;
    }

    return `<div>Unknown element type</div>`;
}


// ======================================
// ELEMENT EVENTS
// ======================================
function attachElementEvents(wrapper) {
    attachSelectionEvent(wrapper);
    attachDeleteEvent(wrapper);
    attachDragEvents(wrapper);
}

function attachSelectionEvent(wrapper) {
    wrapper.addEventListener("click", function (event) {
        if (event.target.closest(".delete-btn")) {
            return;
        }

        const elementId = wrapper.dataset.id;
        selectedElementId = elementId;

        renderCanvas();
        renderPropertiesPanel();
    });
}

function attachDeleteEvent(wrapper) {
    const deleteButton = wrapper.querySelector(".delete-btn");

    deleteButton.addEventListener("click", function (event) {
        event.stopPropagation();

        const index = Number(deleteButton.dataset.index);
        deleteElement(index);
    });
}

function deleteElement(index) {
    if (index < 0 || index >= pageData.elements.length) {
        return;
    }

    const deletedElement = pageData.elements[index];
    pageData.elements.splice(index, 1);

    if (deletedElement && deletedElement.id === selectedElementId) {
        selectedElementId = null;
    }

    renderCanvas();
    renderPropertiesPanel();
}


// ======================================
// DRAG AND DROP
// ======================================
function attachDragEvents(elementNode) {
    elementNode.addEventListener("dragstart", handleDragStart);
    elementNode.addEventListener("dragover", handleDragOver);
    elementNode.addEventListener("dragleave", handleDragLeave);
    elementNode.addEventListener("drop", handleDrop);
    elementNode.addEventListener("dragend", handleDragEnd);
}

function handleDragStart(event) {
    const target = event.currentTarget;
    draggedIndex = Number(target.dataset.index);

    target.classList.add("dragging");

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", draggedIndex);
}

function handleDragOver(event) {
    event.preventDefault();

    const target = event.currentTarget;
    const targetIndex = Number(target.dataset.index);

    if (draggedIndex === null || draggedIndex === targetIndex) {
        return;
    }

    target.classList.add("drag-over");
    event.dataTransfer.dropEffect = "move";
}

function handleDragLeave(event) {
    event.currentTarget.classList.remove("drag-over");
}

function handleDrop(event) {
    event.preventDefault();

    const target = event.currentTarget;
    const targetIndex = Number(target.dataset.index);

    target.classList.remove("drag-over");

    if (draggedIndex === null || draggedIndex === targetIndex) {
        return;
    }

    moveElement(draggedIndex, targetIndex);
    renderCanvas();
    renderPropertiesPanel();
}

function handleDragEnd() {
    document.querySelectorAll(".builder-element").forEach((element) => {
        element.classList.remove("dragging", "drag-over");
    });

    draggedIndex = null;
}

function moveElement(fromIndex, toIndex) {
    const elements = pageData.elements;

    if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= elements.length ||
        toIndex >= elements.length
    ) {
        return;
    }

    const movedItem = elements.splice(fromIndex, 1)[0];
    elements.splice(toIndex, 0, movedItem);
}


// ======================================
// PROPERTIES PANEL
// ======================================
function renderPropertiesPanel() {
    const panel = document.getElementById("properties-panel");
    const selectedElement = getSelectedElement();

    if (!selectedElement) {
        panel.innerHTML = `
            <p class="properties-placeholder">
                Select an element to edit its properties.
            </p>
        `;
        return;
    }

    panel.innerHTML = buildPropertiesPanelHTML(selectedElement);
    attachPropertiesPanelEvents(selectedElement);
}

function buildPropertiesPanelHTML(element) {
    let html = `
        <div class="properties-form">
            <div class="property-section">
                <h3 class="property-section-title">Element</h3>

                <div class="form-group">
                    <label>Type</label>
                    <input type="text" value="${escapeHtml(element.type)}" disabled>
                </div>
            </div>
    `;

    if (element.type === "heading" || element.type === "text" || element.type === "button") {
        html += `
            <div class="property-section">
                <h3 class="property-section-title">Content</h3>

                <div class="form-group">
                    <label for="prop-content">Text</label>
                    <textarea id="prop-content">${escapeHtml(element.content || "")}</textarea>
                </div>
            </div>
        `;
    }

    if (element.type === "image") {
        html += `
            <div class="property-section">
                <h3 class="property-section-title">Image</h3>

                <div class="form-group">
                    <label for="prop-src">Image URL</label>
                    <input id="prop-src" type="text" value="${escapeHtml(element.settings?.src || "")}">
                </div>

                <div class="form-group">
                    <label for="prop-alt">Alt Text</label>
                    <input id="prop-alt" type="text" value="${escapeHtml(element.settings?.alt || "")}">
                </div>
            </div>
        `;
    }

    if (element.type === "button") {
        html += `
            <div class="property-section">
                <h3 class="property-section-title">Button Settings</h3>

                <div class="form-group">
                    <label for="prop-url">Button URL</label>
                    <input id="prop-url" type="text" value="${escapeHtml(element.settings?.url || "#")}">
                </div>
            </div>
        `;
    }

    html += `
        <div class="property-section">
            <h3 class="property-section-title">Styles</h3>

            <div class="form-group">
                <label for="prop-font-size">Font Size</label>
                <input id="prop-font-size" type="text" value="${escapeHtml(element.styles?.fontSize || "")}" placeholder="16px">
            </div>

            <div class="form-group">
                <label for="prop-color">Text Color</label>
                <input id="prop-color" type="text" value="${escapeHtml(element.styles?.color || "")}" placeholder="#111827">
            </div>

            <div class="form-group">
                <label for="prop-text-align">Text Align</label>
                <select id="prop-text-align">
                    <option value="left" ${element.styles?.textAlign === "left" ? "selected" : ""}>Left</option>
                    <option value="center" ${element.styles?.textAlign === "center" ? "selected" : ""}>Center</option>
                    <option value="right" ${element.styles?.textAlign === "right" ? "selected" : ""}>Right</option>
                </select>
            </div>

            <div class="form-group">
                <label for="prop-margin-bottom">Margin Bottom</label>
                <input id="prop-margin-bottom" type="text" value="${escapeHtml(element.styles?.marginBottom || "")}" placeholder="16px">
            </div>
        </div>
    `;

    if (element.type === "button") {
        html += `
            <div class="property-section">
                <h3 class="property-section-title">Button Styles</h3>

                <div class="form-group">
                    <label for="prop-bg-color">Background Color</label>
                    <input id="prop-bg-color" type="text" value="${escapeHtml(element.styles?.backgroundColor || "")}" placeholder="#2563eb">
                </div>

                <div class="form-group">
                    <label for="prop-padding">Padding</label>
                    <input id="prop-padding" type="text" value="${escapeHtml(element.styles?.padding || "")}" placeholder="12px 20px">
                </div>

                <div class="form-group">
                    <label for="prop-radius">Border Radius</label>
                    <input id="prop-radius" type="text" value="${escapeHtml(element.styles?.borderRadius || "")}" placeholder="8px">
                </div>
            </div>
        `;
    }

    if (element.type === "image") {
        html += `
            <div class="property-section">
                <h3 class="property-section-title">Image Styles</h3>

                <div class="form-group">
                    <label for="prop-width">Width</label>
                    <input id="prop-width" type="text" value="${escapeHtml(element.styles?.width || "")}" placeholder="300px">
                </div>

                <div class="form-group">
                    <label for="prop-image-radius">Border Radius</label>
                    <input id="prop-image-radius" type="text" value="${escapeHtml(element.styles?.borderRadius || "")}" placeholder="12px">
                </div>
            </div>
        `;
    }

    html += `</div>`;

    return html;
}

function attachPropertiesPanelEvents(element) {
    const contentInput = document.getElementById("prop-content");
    const srcInput = document.getElementById("prop-src");
    const altInput = document.getElementById("prop-alt");
    const urlInput = document.getElementById("prop-url");

    const fontSizeInput = document.getElementById("prop-font-size");
    const colorInput = document.getElementById("prop-color");
    const textAlignInput = document.getElementById("prop-text-align");
    const marginBottomInput = document.getElementById("prop-margin-bottom");

    const bgColorInput = document.getElementById("prop-bg-color");
    const paddingInput = document.getElementById("prop-padding");
    const radiusInput = document.getElementById("prop-radius");

    const widthInput = document.getElementById("prop-width");
    const imageRadiusInput = document.getElementById("prop-image-radius");

    if (contentInput) {
        contentInput.addEventListener("input", function () {
            updateSelectedElementContent(contentInput.value);
        });
    }

    if (srcInput) {
        srcInput.addEventListener("input", function () {
            updateSelectedElementSetting("src", srcInput.value);
        });
    }

    if (altInput) {
        altInput.addEventListener("input", function () {
            updateSelectedElementSetting("alt", altInput.value);
        });
    }

    if (urlInput) {
        urlInput.addEventListener("input", function () {
            updateSelectedElementSetting("url", urlInput.value);
        });
    }

    if (fontSizeInput) {
        fontSizeInput.addEventListener("input", function () {
            updateSelectedElementStyle("fontSize", fontSizeInput.value);
        });
    }

    if (colorInput) {
        colorInput.addEventListener("input", function () {
            updateSelectedElementStyle("color", colorInput.value);
        });
    }

    if (textAlignInput) {
        textAlignInput.addEventListener("change", function () {
            updateSelectedElementStyle("textAlign", textAlignInput.value);
        });
    }

    if (marginBottomInput) {
        marginBottomInput.addEventListener("input", function () {
            updateSelectedElementStyle("marginBottom", marginBottomInput.value);
        });
    }

    if (bgColorInput) {
        bgColorInput.addEventListener("input", function () {
            updateSelectedElementStyle("backgroundColor", bgColorInput.value);
        });
    }

    if (paddingInput) {
        paddingInput.addEventListener("input", function () {
            updateSelectedElementStyle("padding", paddingInput.value);
        });
    }

    if (radiusInput) {
        radiusInput.addEventListener("input", function () {
            updateSelectedElementStyle("borderRadius", radiusInput.value);
        });
    }

    if (widthInput) {
        widthInput.addEventListener("input", function () {
            updateSelectedElementStyle("width", widthInput.value);
        });
    }

    if (imageRadiusInput) {
        imageRadiusInput.addEventListener("input", function () {
            updateSelectedElementStyle("borderRadius", imageRadiusInput.value);
        });
    }
}


// ======================================
// UPDATE SELECTED ELEMENT
// ======================================
function updateSelectedElementContent(value) {
    const element = getSelectedElement();

    if (!element) {
        return;
    }

    element.content = value;
    renderCanvas();
}

function updateSelectedElementStyle(key, value) {
    const element = getSelectedElement();

    if (!element) {
        return;
    }

    if (!element.styles) {
        element.styles = {};
    }

    element.styles[key] = value;
    renderCanvas();
}

function updateSelectedElementSetting(key, value) {
    const element = getSelectedElement();

    if (!element) {
        return;
    }

    if (!element.settings) {
        element.settings = {};
    }

    element.settings[key] = value;
    renderCanvas();
}


// ======================================
// SAVE
// ======================================
async function saveLayout() {
    try {
        const response = await fetch(saveUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCSRFToken()
            },
            body: JSON.stringify({
                layout_json: pageData
            })
        });

        if (!response.ok) {
            throw new Error("Failed to save layout");
        }

        const data = await response.json();
        console.log("Saved successfully:", data);
        alert("Layout saved successfully");
    } catch (error) {
        console.error("Save error:", error);
        alert("Something went wrong while saving");
    }
}


// ======================================
// HELPERS
// ======================================
function buildInlineStyles(styles) {
    let styleString = "";

    for (const key in styles) {
        const value = styles[key];

        if (value === null || value === undefined || value === "") {
            continue;
        }

        const cssKey = camelToKebab(key);
        styleString += `${cssKey}: ${value}; `;
    }

    return styleString.trim();
}

function camelToKebab(value) {
    return value.replace(/[A-Z]/g, function (letter) {
        return "-" + letter.toLowerCase();
    });
}

function getCSRFToken() {
    const cookieName = "csrftoken";
    const cookies = document.cookie.split(";");

    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();

        if (cookie.startsWith(cookieName + "=")) {
            return decodeURIComponent(cookie.substring(cookieName.length + 1));
        }
    }

    return "";
}

function escapeHtml(value) {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}