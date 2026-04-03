# No-Code Website Builder Platform

A full-stack no-code website builder that allows users to create, edit, and publish websites using a drag-and-drop interface.

This project is designed as a scalable, production-ready system built with a modern architecture combining Django and FastAPI.

---
## Status
In Progress

## Features

### Visual Builder

* Drag-and-drop page editor
* Real-time canvas rendering
* Element selection and editing
* Dynamic properties panel

### Page & Project System

* Create projects and pages from UI
* Multi-page website structure
* Page-level layout storage using JSON

### Element System

* Heading, text, button, image elements
* Custom styles and settings per element
* Extensible schema for future components

### Layout Engine

* Page structure stored as JSON:

```json
{
  "elements": [
    {
      "id": "unique_id",
      "type": "text",
      "content": "Hello world",
      "styles": {},
      "settings": {}
    }
  ]
}
```

### Publishing System

* Preview pages before publishing
* Public rendering of pages
* Clean separation between editor and live site

---

## Architecture

### Backend

* **Django**

  * Handles UI, authentication, and page rendering
  * Manages projects, pages, and ownership
  * Stores layout JSON in database

* **FastAPI (planned)**

  * API services
  * AI features (future)
  * High-performance async endpoints

### Frontend

* HTML, CSS, JavaScript
* Fully client-driven builder logic
* `pageData` acts as the single source of truth

---

## Core Concept

All changes follow this pattern:

User Interaction → Update `pageData` → Re-render UI → Save JSON

This ensures consistency between:

* UI
* Data
* Database

---

## Tech Stack

* Django
* FastAPI (planned)
* JavaScript (Vanilla)
* HTML / CSS

---

## Current Progress

* Project & page system
* JSON layout engine
* Drag-and-drop editor
* Element selection system
* Properties panel (live editing)
* Layout saving

---

## Roadmap

* Schema-driven element system
* Nested layout (sections, columns)
* Responsive design controls
* Media upload system
* Template marketplace
* AI-assisted website generation

---

## Vision

The goal of this project is to build a scalable no-code platform that enables anyone to create websites without writing code, while maintaining a clean and extensible architecture for future growth.

---

## Preview

(Add screenshots here later)

---

## Author

Phat Chung

---

## Notes

This project focuses on building real-world architecture and scalable systems rather than quick prototypes.
