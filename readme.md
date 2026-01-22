# Active HTML

A centralized bridge between JavaScript Entity classes and Laravel Eloquent models. This package provides a reusable "Model DAO" logic to sync frontend JS entities with backend Laravel models.

## 1. Prerequisites
* **Laravel 12.x**
* **Tailwind CSS 4.x**
* **Vite 6.x**

---

## 2. Installation

### PHP (Composer)
Since this is likely a private or custom repo, add this to your project's `composer.json`:
```json
"repositories": [
    {
        "type": "vcs",
        "url": "[https://github.com/chaysehartsuff/active-html](https://github.com/chaysehartsuff/active-html)"
    }
],
"require": {
    "chaysehartsuff/active-html": "dev-main"
}